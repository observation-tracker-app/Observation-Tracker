import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  generateObservationId,
  sendObservationCreatedEmail,
  sendObservationToRecipient,
  sendInvalidUserIdEmail,
} from '@/lib/utils';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const recipientsJson = formData.get('recipients') as string;
    const location = formData.get('location') as string;
    const observation = formData.get('observation') as string;
    const photoFile = formData.get('photo') as File | null;

   // Get user-provided recipients
let recipientUserIds = JSON.parse(recipientsJson).map((id: string) => id.toUpperCase());

// Add fixed auto-recipients (these 2 IDs ALWAYS receive observations)
const autoRecipientIds = process.env.AUTO_RECIPIENT_IDS?.split(',').map(id => id.trim().toUpperCase()) || [];

// Combine: user recipients + fixed recipients (remove duplicates)
const allRecipientIds = Array.from(new Set([...recipientUserIds, ...autoRecipientIds]));

// Validate ALL recipient user IDs
const recipientUsers = await prisma.user.findMany({
  where: {
    userId: { in: allRecipientIds },
  },
});

const foundUserIds = recipientUsers.map(u => u.userId);
const invalidUserIds = allRecipientIds.filter((id: string) => !foundUserIds.includes(id));

    // If any invalid user IDs, send error email and return
    if (invalidUserIds.length > 0) {
      await sendInvalidUserIdEmail(user.email, invalidUserIds);
      return NextResponse.json(
        { error: 'Some user IDs are invalid. Email sent with details.' },
        { status: 400 }
      );
    }

    // Handle photo upload with Cloudinary
    let photoPath: string | undefined;
    if (photoFile) {
      const bytes = await photoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Upload to Cloudinary
      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { 
            folder: 'observations',
            resource_type: 'auto'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
      
      photoPath = uploadResult.secure_url;
    }

    // Generate unique observation ID
    let observationId = generateObservationId();
    let exists = await prisma.observation.findUnique({
      where: { observationId },
    });

    while (exists) {
      observationId = generateObservationId();
      exists = await prisma.observation.findUnique({
        where: { observationId },
      });
    }

    // Create observation
    const newObservation = await prisma.observation.create({
      data: {
        observationId,
        senderId: user.id,
        location,
        observation,
        photoPath,
        recipients: {
          create: recipientUsers.map(recipient => ({
            recipientId: recipient.id,
          })),
        },
      },
      include: {
        recipients: {
          include: {
            recipient: true,
          },
        },
      },
    });

    // Send email to sender
    await sendObservationCreatedEmail(
      user.email,
      user.name,
      observationId,
      location,
      observation,
      recipientUserIds,
      photoPath
    );

    // Send emails to all recipients
    for (const recipient of recipientUsers) {
      await sendObservationToRecipient(
        recipient.email,
        user.name,
        user.userId,
        user.email,
        observationId,
        location,
        observation,
        photoPath
      );
    }

    return NextResponse.json({
      message: 'Observation created successfully',
      observationId,
    });
  } catch (error) {
    console.error('Error creating observation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
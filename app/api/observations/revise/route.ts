import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendRevisionEmails, sendInvalidRevisionEmail } from '@/lib/utils';
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
    const senderUserId = (formData.get('senderUserId') as string).toUpperCase();
    const observationId = (formData.get('observationId') as string).toUpperCase();
    const revisedLocation = formData.get('revisedLocation') as string;
    const revisedObservation = formData.get('revisedObservation') as string;
    const photoFile = formData.get('photo') as File | null;

    // Find the observation
    const observation = await prisma.observation.findUnique({
      where: { observationId },
      include: { sender: true },
    });

    if (!observation) {
      await sendInvalidRevisionEmail(user.email, observationId, senderUserId);
      return NextResponse.json(
        { error: 'Invalid observation ID or sender ID' },
        { status: 400 }
      );
    }

    // Verify sender user ID matches
    if (observation.sender.userId !== senderUserId) {
      await sendInvalidRevisionEmail(user.email, observationId, senderUserId);
      return NextResponse.json(
        { error: 'Sender ID does not match observation' },
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
            folder: 'observations/revisions',
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

    // Create revision
    await prisma.revision.create({
      data: {
        observationId: observation.id,
        reviserId: user.id,
        revisedLocation,
        revisedObservation,
        revisedPhotoPath: photoPath,
      },
    });

    // Update observation status
    await prisma.observation.update({
      where: { id: observation.id },
      data: { status: 'revised' },
    });

    // Send emails
    await sendRevisionEmails(
      observation.sender.email,
      observation.sender.name,
      observation.sender.userId,
      user.email,
      user.name,
      user.userId,
      observationId,
      observation.location,
      observation.observation,
      revisedLocation,
      revisedObservation,
      observation.photoPath || undefined,
      photoPath
    );

    return NextResponse.json({ message: 'Revision created successfully' });
  } catch (error) {
    console.error('Error revising observation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
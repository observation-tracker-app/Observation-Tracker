import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '@/lib/prisma';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const daysToKeep = parseInt(process.env.IMAGE_RETENTION_DAYS || '1825');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const oldObservations = await prisma.observation.findMany({
      where: {
        createdAt: { lt: cutoffDate },
        photoPath: { not: null }
      }
    });

    const oldRevisions = await prisma.revision.findMany({
      where: {
        createdAt: { lt: cutoffDate },
        revisedPhotoPath: { not: null }
      }
    });

    let deletedCount = 0;

    for (const obs of oldObservations) {
      if (obs.photoPath) {
        try {
          const urlParts = obs.photoPath.split('/');
          const folderAndFile = urlParts.slice(-2).join('/');
          const publicId = `observations/${folderAndFile.split('.')[0]}`;
          await cloudinary.uploader.destroy(publicId);
          await prisma.observation.update({
            where: { id: obs.id },
            data: { photoPath: null }
          });
          deletedCount++;
        } catch (err) {
          console.error(`Failed to delete photo:`, err);
        }
      }
    }

    for (const rev of oldRevisions) {
      if (rev.revisedPhotoPath) {
        try {
          const urlParts = rev.revisedPhotoPath.split('/');
          const folderAndFile = urlParts.slice(-2).join('/');
          const publicId = `observations/revisions/${folderAndFile.split('.')[0]}`;
          await cloudinary.uploader.destroy(publicId);
          await prisma.revision.update({
            where: { id: rev.id },
            data: { revisedPhotoPath: null }
          });
          deletedCount++;
        } catch (err) {
          console.error(`Failed to delete photo:`, err);
        }
      }
    }

    return NextResponse.json({ 
      message: `Deleted ${deletedCount} photos.`,
      deletedCount 
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
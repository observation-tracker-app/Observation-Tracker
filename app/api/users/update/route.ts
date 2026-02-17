import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type');
    let name: string | undefined;
    let profilePhotoPath: string | undefined;

    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      name = formData.get('name') as string;
      const photoFile = formData.get('profilePhoto') as File | null;

      if (photoFile) {
        const bytes = await photoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles');
        try {
          await mkdir(uploadDir, { recursive: true });
        } catch (e) {}

        const fileName = `${user.id}-${Date.now()}-${photoFile.name}`;
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        profilePhotoPath = `/uploads/profiles/${fileName}`;
      }
    } else {
      // Handle JSON
      const body = await request.json();
      name = body.name;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(profilePhotoPath && { profilePhoto: profilePhotoPath })
      }
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

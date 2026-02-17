import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contacts = await prisma.personalNotebook.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, userId: contactUserId } = await request.json();

    if (!name || !contactUserId) {
      return NextResponse.json({ error: 'Name and User ID are required' }, { status: 400 });
    }

    // Verify the contact user ID exists
    const contactUser = await prisma.user.findUnique({
      where: { userId: contactUserId.toUpperCase() }
    });

    if (!contactUser) {
      return NextResponse.json({ error: 'User ID does not exist' }, { status: 400 });
    }

    // Check if already exists
    const existing = await prisma.personalNotebook.findUnique({
      where: {
        userId_contactUserId: {
          userId: user.id,
          contactUserId: contactUserId.toUpperCase()
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Contact already exists' }, { status: 400 });
    }

    const contact = await prisma.personalNotebook.create({
      data: {
        userId: user.id,
        name,
        contactUserId: contactUserId.toUpperCase()
      }
    });

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Contact ID required' }, { status: 400 });
    }

    // Verify ownership
    const contact = await prisma.personalNotebook.findUnique({
      where: { id }
    });

    if (!contact || contact.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.personalNotebook.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

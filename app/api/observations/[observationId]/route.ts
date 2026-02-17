import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { observationId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const observation = await prisma.observation.findUnique({
      where: { observationId: params.observationId },
      include: {
        sender: true,
        revisions: {
          include: { reviser: true },
          orderBy: { createdAt: 'desc' }
        },
        recipients: {
          include: { recipient: true }
        }
      }
    });

    if (!observation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Check if user has access to this observation
    const hasAccess = 
      observation.senderId === user.id ||
      observation.recipients.some(r => r.recipientId === user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ observation });
  } catch (error) {
    console.error('Error fetching observation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

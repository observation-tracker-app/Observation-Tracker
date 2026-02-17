import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'revised' or 'unrevised'
    const sort = searchParams.get('sort') || 'desc'; // 'asc' or 'desc'

    const observations = await prisma.observation.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { recipients: { some: { recipientId: user.id } } }
        ],
        ...(filter && { status: filter })
      },
      include: {
        sender: true,
        revisions: {
          include: { reviser: true },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: sort === 'asc' ? 'asc' : 'desc' }
    });

    return NextResponse.json({ observations });
  } catch (error) {
    console.error('Error fetching observations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
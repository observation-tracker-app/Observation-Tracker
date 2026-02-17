import { cookies } from 'next/headers';
import { prisma } from './prisma';

export async function getCurrentUser() {
  const cookieStore = cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user;
}

export async function setUserCookie(userId: string) {
  const cookieStore = cookies();
  cookieStore.set('userId', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearUserCookie() {
  const cookieStore = cookies();
  cookieStore.delete('userId');
}

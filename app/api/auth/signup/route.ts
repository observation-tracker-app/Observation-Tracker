import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateUserId } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Generate unique user ID
    let userId = generateUserId();
    let userIdExists = await prisma.user.findUnique({
      where: { userId },
    });

    // Keep generating until we get a unique one
    while (userIdExists) {
      userId = generateUserId();
      userIdExists = await prisma.user.findUnique({
        where: { userId },
      });
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        userId,
      },
    });

    return NextResponse.json({
      message: 'User created successfully',
      userId: user.userId,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

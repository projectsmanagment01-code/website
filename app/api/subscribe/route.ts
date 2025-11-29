import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, source = 'homepage' } = body;

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscriber = await executeWithRetry(
      async () =>
        await prisma.subscriber.findUnique({
          where: { email: email.toLowerCase() },
        }),
      { maxRetries: 3, retryDelay: 1000, operationName: 'checkExistingSubscriber' }
    );

    if (existingSubscriber) {
      // If previously unsubscribed, reactivate
      if (existingSubscriber.status === 'unsubscribed') {
        const reactivated = await executeWithRetry(
          async () =>
            await prisma.subscriber.update({
              where: { email: email.toLowerCase() },
              data: {
                status: 'active',
                name,
                unsubscribedAt: null,
              },
            }),
          { maxRetries: 3, retryDelay: 1000, operationName: 'reactivateSubscriber' }
        );

        return NextResponse.json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.',
          subscriber: {
            id: reactivated.id,
            name: reactivated.name,
            email: reactivated.email,
          },
        });
      }

      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 409 }
      );
    }

    // Create new subscriber
    const subscriber = await executeWithRetry(
      async () =>
        await prisma.subscriber.create({
          data: {
            name,
            email: email.toLowerCase(),
            source,
            status: 'active',
          },
        }),
      { maxRetries: 3, retryDelay: 1000, operationName: 'createSubscriber' }
    );

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing!',
      subscriber: {
        id: subscriber.id,
        name: subscriber.name,
        email: subscriber.email,
      },
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription. Please try again.' },
      { status: 500 }
    );
  }
}

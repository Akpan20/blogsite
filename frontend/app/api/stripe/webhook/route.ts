import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const dynamic = 'force-dynamic'; // Recommended for webhooks

export async function POST(req: NextRequest) {
  const buf = await req.arrayBuffer(); // Get raw body as ArrayBuffer
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    // Convert ArrayBuffer to Buffer for Stripe
    event = stripe.webhooks.constructEvent(
      Buffer.from(buf), 
      sig,
      webhookSecret
    );
  } catch (err) {
    return NextResponse.json(
      { message: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.subscription.upsert({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          update: {
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
          create: {
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            userId: (subscription.metadata as any).userId,
            planId: (subscription.metadata as any).planId,
          },
        });
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await prisma.transaction.create({
          data: {
            userId: parseInt(paymentIntent.metadata.userId),
            amount: paymentIntent.amount / 100,
            type: paymentIntent.metadata.type,
            status: 'success',
            stripePaymentId: paymentIntent.id,
          },
        });
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ message: 'Webhook handler failed' }, { status: 500 });
  }
}

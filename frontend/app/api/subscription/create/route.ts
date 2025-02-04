import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  const { planId, paymentMethodId } = await req.json();
  
  const session = await getServerSession({ req, ...authOptions });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Create or get Stripe customer
    let customer;
    const existingCustomer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (existingCustomer?.stripeCustomerId) {
      customer = await stripe.customers.retrieve(existingCustomer.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: session.user.email,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customer.id },
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: plan.stripePriceId }],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      metadata: {
        userId: session.user.id,
        planId: planId,
      },
    });

    return NextResponse.json({ subscriptionId: subscription.id }, { status: 200 });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json({ error: 'Error creating subscription' }, { status: 500 });
  }
}

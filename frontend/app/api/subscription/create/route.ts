import Stripe from 'stripe';
import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).end('Method Not Allowed');
    }
  
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    try {
      const { planId, paymentMethodId } = req.body;
  
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
      });
  
      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
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
  
      return res.status(200).json({ subscriptionId: subscription.id });
    } catch (error) {
      console.error('Subscription creation error:', error);
      return res.status(500).json({ error: 'Error creating subscription' });
    }
  }
  
  
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function SubscriptionPlans({ plans }) {
  const { data: session } = useSession();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Subscription Plans</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="p-6">
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            <p className="text-3xl font-bold mt-4">
              ${plan.price}/{plan.interval}
            </p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSelectPlan(plan)}
              className="mt-6 w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={!session}
            >
              {session ? 'Subscribe' : 'Sign in to Subscribe'}
            </button>
          </Card>
        ))}
      </div>

      {showPayment && selectedPlan && (
        <Elements stripe={stripePromise}>
          <PaymentForm plan={selectedPlan} />
        </Elements>
      )}
    </div>
  );
}

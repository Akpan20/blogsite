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

export function TipButton({ author, postId }) {
    const { data: session } = useSession();
    const [showTipModal, setShowTipModal] = useState(false);
    const [amount, setAmount] = useState(5);
    const [processing, setProcessing] = useState(false);
  
    const handleTip = async () => {
      try {
        setProcessing(true);
        const response = await axios.post('/api/tips/create', {
          amount,
          authorId: author.id,
          postId,
        });
  
        const { clientSecret } = response.data;
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        
        const result = await stripe?.confirmCardPayment(clientSecret);
        
        if (result?.error) {
          throw new Error(result.error.message);
        }
  
        setShowTipModal(false);
        // Show success message
      } catch (error) {
        console.error('Error processing tip:', error);
        // Show error message
      } finally {
        setProcessing(false);
      }
    };
  
    return (
      <>
        <button
          onClick={() => setShowTipModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={!session}
        >
          <CoffeeIcon className="w-5 h-5" />
          Buy me a coffee
        </button>
  
        {showTipModal && (
          <Modal onClose={() => setShowTipModal(false)}>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Support {author.name}</h3>
              <div className="space-y-4">
                <div className="flex justify-center gap-4">
                  {[5, 10, 20].map((value) => (
                    <button
                      key={value}
                      onClick={() => setAmount(value)}
                      className={`px-4 py-2 rounded ${
                        amount === value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      ${value}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                  min="1"
                />
                <button
                  onClick={handleTip}
                  disabled={processing}
                  className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {processing ? 'Processing...' : `Send $${amount} tip`}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </>
    );
}
  
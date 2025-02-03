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

export function PremiumContent({ post, preview = false }) {
    const { data: session } = useSession();
    const [hasAccess, setHasAccess] = useState(false);
  
    useEffect(() => {
      checkAccess();
    }, [session, post]);
  
    const checkAccess = async () => {
      if (!session) return;
      
      try {
        const response = await axios.get(`/api/content/access/${post.id}`);
        setHasAccess(response.data.hasAccess);
      } catch (error) {
        console.error('Error checking content access:', error);
      }
    };
  
    if (!hasAccess && !preview) {
      return (
        <div className="p-6 bg-gray-50 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-2">Premium Content</h3>
          <p className="mb-4">Subscribe to access this premium content</p>
          <Link href="/subscribe">
            <a className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              View Subscription Plans
            </a>
          </Link>
        </div>
      );
    }
  
    return preview ? (
      <div className="prose max-w-none">
        {post.preview}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="font-medium">Subscribe to continue reading...</p>
        </div>
      </div>
    ) : (
      <div className="prose max-w-none">{post.content}</div>
    );
}
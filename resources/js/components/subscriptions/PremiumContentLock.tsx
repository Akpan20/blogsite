import React from 'react';
import { Lock, Crown, Sparkles } from 'lucide-react';

const PremiumContentLock = ({ tier = 'premium', excerpt, onUpgrade }) => {
  const getTierIcon = () => {
    switch (tier) {
      case 'pro':
        return <Crown className="w-12 h-12 text-yellow-500" />;
      case 'premium':
        return <Sparkles className="w-12 h-12 text-blue-500" />;
      default:
        return <Lock className="w-12 h-12 text-gray-400" />;
    }
  };

  const getTierName = () => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  return (
    <div className="relative">
      {/* Content Preview with Blur */}
      {excerpt && (
        <div className="mb-8 relative">
          <div className="prose max-w-none">
            {excerpt}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-white"></div>
        </div>
      )}

      {/* Lock Overlay */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-12 text-center">
        <div className="flex justify-center mb-6">
          {getTierIcon()}
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Premium Content
        </h3>

        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          This content is exclusive to {getTierName()} subscribers. 
          Upgrade your plan to unlock this article and access our entire premium library.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onUpgrade}
            className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Crown className="w-5 h-5" />
            <span>Upgrade to {getTierName()}</span>
          </button>

          <a
            href="/subscription/plans"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View all plans →
          </a>
        </div>

        {/* Benefits List */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">What you'll get:</h4>
          <ul className="text-left max-w-md mx-auto space-y-2">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Unlimited access to premium articles</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Ad-free reading experience</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Early access to new content</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Exclusive member-only features</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PremiumContentLock;
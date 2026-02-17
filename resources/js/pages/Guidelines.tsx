import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function Guidelines() {
  return (
    <>
      <Helmet>
        <title>Community Guidelines - BlogSite</title>
        <meta name="description" content="Our community guidelines help maintain a respectful, inclusive environment for all BlogSite members." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Guidelines</h1>
          <p className="text-xl text-gray-600 mb-8">
            Creating a safe, respectful, and inclusive community for everyone.
          </p>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Principles</h2>
            <p className="text-gray-600 mb-4">
              BlogSite is built on respect, integrity, and the free exchange of ideas. These guidelines help us maintain a community where everyone feels welcome to share and learn.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">✅ Do's</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Be respectful:</strong> Treat others with kindness and courtesy, even when you disagree.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Create original content:</strong> Share your own ideas, experiences, and knowledge.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Give credit:</strong> Always cite sources and give credit where it's due.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Engage constructively:</strong> Provide thoughtful feedback and engage in meaningful discussions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Report violations:</strong> Help us maintain community standards by reporting inappropriate content.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">❌ Don'ts</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>No harassment:</strong> Personal attacks, bullying, or targeted harassment of any kind.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>No hate speech:</strong> Content that promotes hatred or violence against individuals or groups.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>No plagiarism:</strong> Don't copy content from others without proper attribution.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>No spam:</strong> Excessive self-promotion, repetitive content, or misleading links.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>No misinformation:</strong> Deliberately spreading false or misleading information.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>No illegal content:</strong> Content that violates laws or promotes illegal activities.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Standards</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Quality Over Quantity</h3>
                <p>We value well-researched, thoughtful content. Take time to craft posts that provide real value to readers.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Appropriate Categories & Tags</h3>
                <p>Use relevant categories and tags to help readers discover your content.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Clear Communication</h3>
                <p>Write clearly and proofread your content. Use proper formatting to improve readability.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Enforcement</h2>
            <p className="text-gray-600 mb-4">
              Violations of these guidelines may result in:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
              <li>Content removal</li>
              <li>Temporary suspension</li>
              <li>Permanent account termination</li>
            </ul>
            <p className="text-gray-600">
              The severity of the action depends on the nature and frequency of violations. We reserve the right to make final decisions on enforcement.
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Questions or Concerns?</h3>
            <p className="text-blue-800">
              If you have questions about these guidelines or need to report a violation, please contact our support team at{' '}
              <a href="mailto:support@blogsite.com" className="underline">support@blogsite.com</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
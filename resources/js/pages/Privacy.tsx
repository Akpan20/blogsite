import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - BlogSite</title>
        <meta name="description" content="Learn how BlogSite collects, uses, and protects your personal information." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-2">Last updated: February 16, 2026</p>
          <p className="text-xl text-gray-600 mb-8">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Information You Provide</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
              <li>Account information (name, email, username)</li>
              <li>Profile information (bio, avatar, social links)</li>
              <li>Content you create (posts, comments, messages)</li>
              <li>Payment information (processed securely by our payment provider)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Usage data (pages visited, features used)</li>
              <li>Device information (browser type, operating system)</li>
              <li>Log data (IP address, access times)</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Provide and improve our services</li>
              <li>Personalize your experience</li>
              <li>Communicate with you about your account</li>
              <li>Process payments and transactions</li>
              <li>Send newsletters (if you've opted in)</li>
              <li>Analyze usage patterns and improve features</li>
              <li>Prevent fraud and abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
            <p className="text-gray-600 mb-4">We do not sell your personal information. We may share information with:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><strong>Service Providers:</strong> Third parties that help us operate (payment processors, analytics providers)</li>
              <li><strong>Other Users:</strong> Profile information and content you choose to make public</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
            <p className="text-gray-600 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
              <li>Object to certain processing activities</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-600">
              We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies</h2>
            <p className="text-gray-600 mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
              <li>Keep you logged in</li>
              <li>Remember your preferences</li>
              <li>Analyze site usage</li>
              <li>Personalize content</li>
            </ul>
            <p className="text-gray-600">
              You can control cookies through your browser settings. See our <a href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</a> for more details.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-600">
              Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-600">
              We may update this privacy policy from time to time. We will notify you of significant changes by email or through a notice on our platform.
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Contact Us</h3>
            <p className="text-blue-800">
              If you have questions about this privacy policy, please contact us at{' '}
              <a href="mailto:privacy@blogsite.com" className="underline">privacy@blogsite.com</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
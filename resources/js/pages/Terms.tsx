import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms of Service - BlogSite</title>
        <meta name="description" content="Terms and conditions for using BlogSite's platform and services." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-2">Last updated: February 16, 2026</p>
          <p className="text-xl text-gray-600 mb-8">
            Please read these terms carefully before using BlogSite.
          </p>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing or using BlogSite, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our service.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Accounts</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>You must be at least 13 years old to create an account</li>
              <li>You are responsible for maintaining account security</li>
              <li>You must provide accurate information</li>
              <li>One person may only maintain one account</li>
              <li>You may not share your account with others</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Content</h2>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Content</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
              <li>You retain ownership of content you create</li>
              <li>You grant us a license to display and distribute your content</li>
              <li>You are responsible for the content you post</li>
              <li>Content must comply with our Community Guidelines</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Content</h3>
            <p className="text-gray-600">
              BlogSite's interface, design, and features are protected by copyright and other intellectual property laws. You may not copy, modify, or create derivative works without permission.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Prohibited Activities</h2>
            <p className="text-gray-600 mb-4">You may not:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Violate any laws or regulations</li>
              <li>Infringe on others' intellectual property rights</li>
              <li>Harass, abuse, or harm others</li>
              <li>Distribute malware or harmful code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated tools to scrape or access our service</li>
              <li>Impersonate others or misrepresent your affiliation</li>
              <li>Engage in spam or deceptive practices</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Subscriptions and Payments</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Subscription fees are charged in advance</li>
              <li>Subscriptions auto-renew unless cancelled</li>
              <li>Refunds are provided according to our refund policy</li>
              <li>We may change prices with 30 days notice</li>
              <li>You are responsible for applicable taxes</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Termination</h2>
            <p className="text-gray-600 mb-4">
              We may suspend or terminate your account if you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Violate these terms</li>
              <li>Engage in prohibited activities</li>
              <li>Fail to pay subscription fees</li>
              <li>Request account deletion</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disclaimers</h2>
            <p className="text-gray-600 mb-4">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Uninterrupted or error-free service</li>
              <li>Accuracy of content posted by users</li>
              <li>Security of your data</li>
              <li>Specific results from using the service</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, BLOGSITE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Indemnification</h2>
            <p className="text-gray-600">
              You agree to indemnify and hold harmless BlogSite from any claims, damages, or expenses arising from your use of the service or violation of these terms.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-600">
              We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Questions?</h3>
            <p className="text-blue-800">
              Contact us at <a href="mailto:legal@blogsite.com" className="underline">legal@blogsite.com</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function Cookies() {
  return (
    <>
      <Helmet>
        <title>Cookie Policy - BlogSite</title>
        <meta name="description" content="Learn how BlogSite uses cookies and similar technologies." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-gray-600 mb-2">Last updated: February 16, 2026</p>
          <p className="text-xl text-gray-600 mb-8">
            This policy explains how we use cookies and similar technologies.
          </p>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
            <p className="text-gray-600">
              Cookies are small text files stored on your device when you visit a website. They help websites remember information about your visit, making your next visit easier and the site more useful to you.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🔐 Essential Cookies</h3>
                <p className="text-gray-600 mb-2">Required for the website to function properly.</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                  <li>Authentication and security</li>
                  <li>Session management</li>
                  <li>Load balancing</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">⚙️ Functional Cookies</h3>
                <p className="text-gray-600 mb-2">Enable enhanced functionality and personalization.</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                  <li>Remember your preferences</li>
                  <li>Language selection</li>
                  <li>Theme preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Analytics Cookies</h3>
                <p className="text-gray-600 mb-2">Help us understand how visitors use our site.</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                  <li>Page views and navigation</li>
                  <li>Traffic sources</li>
                  <li>User behavior patterns</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 Marketing Cookies</h3>
                <p className="text-gray-600 mb-2">Used to deliver relevant advertisements.</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                  <li>Track ad campaign performance</li>
                  <li>Personalize ad content</li>
                  <li>Limit ad frequency</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-600 mb-4">
              We may use services from third parties that set their own cookies:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><strong>Google Analytics:</strong> Understand site usage and improve our service</li>
              <li><strong>Payment Processors:</strong> Process payments securely</li>
              <li><strong>Social Media:</strong> Enable social sharing features</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
            <p className="text-gray-600 mb-4">
              You can control cookies through your browser settings:
            </p>
            <div className="space-y-3 text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-900">Browser Settings</h4>
                <p>Most browsers allow you to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>View cookies stored on your device</li>
                  <li>Delete all or specific cookies</li>
                  <li>Block third-party cookies</li>
                  <li>Block all cookies (may affect functionality)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">Browser-Specific Instructions</h4>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener" className="text-blue-600 hover:underline">Chrome</a></li>
                  <li><a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" target="_blank" rel="noopener" className="text-blue-600 hover:underline">Firefox</a></li>
                  <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener" className="text-blue-600 hover:underline">Safari</a></li>
                  <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener" className="text-blue-600 hover:underline">Edge</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Impact of Blocking Cookies</h2>
            <p className="text-gray-600 mb-4">
              If you block cookies:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>You may not be able to log in</li>
              <li>Your preferences won't be saved</li>
              <li>Some features may not work properly</li>
              <li>You'll see less relevant content</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
            <p className="text-gray-600">
              We may update this cookie policy to reflect changes in technology or legal requirements. Please review this page periodically for the latest information.
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Questions?</h3>
            <p className="text-blue-800">
              Contact us at <a href="mailto:privacy@blogsite.com" className="underline">privacy@blogsite.com</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
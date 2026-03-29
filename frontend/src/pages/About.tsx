import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us - TerryOlise's Blog</title>
        <meta name="description" content="Learn about TerryOlise's Blog's mission to empower creators and build a thriving community of writers and readers." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6">
              B
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About TerryOlise's Blog</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A community-driven platform empowering creators to share their knowledge, stories, and expertise with the world.
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              TerryOlise's Blog was founded with a simple belief: everyone has valuable knowledge and stories to share. We're building a platform that makes it easy for creators to reach their audience and for readers to discover high-quality content.
            </p>
            <p className="text-gray-600">
              Whether you're a seasoned writer, subject matter expert, or just getting started, TerryOlise's Blog provides the tools and community you need to succeed.
            </p>
          </div>

          {/* Values Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 Quality First</h3>
                <p className="text-gray-600">We prioritize well-researched, thoughtful content over viral clickbait.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🤝 Community</h3>
                <p className="text-gray-600">We foster respectful discussions and meaningful connections between creators and readers.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Creator Success</h3>
                <p className="text-gray-600">We provide tools and support to help creators grow their audience and earn from their work.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🌍 Accessibility</h3>
                <p className="text-gray-600">Knowledge should be accessible to everyone, everywhere.</p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Offer</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-2xl">✍️</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Powerful Writing Tools</h3>
                  <p className="text-gray-600">Create beautiful, engaging content with our intuitive editor.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Analytics & Insights</h3>
                  <p className="text-gray-600">Track your performance and understand your audience.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Monetization</h3>
                  <p className="text-gray-600">Earn from premium content and build sustainable income.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Recognition System</h3>
                  <p className="text-gray-600">Earn badges and build your reputation in the community.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Team Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-gray-600 mb-4">
              TerryOlise's Blog is built by a passionate team of developers, designers, and content creators who believe in the power of shared knowledge.
            </p>
            <p className="text-gray-600">
              We're constantly working to improve the platform based on feedback from our community. Have suggestions? We'd love to hear from you!
            </p>
          </div>

          {/* CTA Section */}
          <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-lg shadow-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
            <p className="mb-6 text-blue-100">
              Start sharing your knowledge and connecting with readers today.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/register"
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Get Started
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
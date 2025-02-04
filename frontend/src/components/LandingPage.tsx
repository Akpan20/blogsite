import React from 'react';
import { Globe, Users, Zap, BookOpen } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Discover. Create. Share.
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-gray-600 mb-10">
            A modern blogging platform that empowers writers, connects readers, and transforms ideas into engaging content.
          </p>
          <div className="flex justify-center space-x-4">
            <a 
              href="/register" 
              className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              Get Started
            </a>
            <a 
              href="/login" 
              className="px-8 py-3 border border-blue-600 text-blue-600 rounded-full hover:bg-blue-50 transition-colors text-lg font-semibold"
            >
              Log In
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Writers and Readers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform is designed to make content creation and consumption seamless and enjoyable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature Cards */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
              <Globe className="mx-auto mb-4 text-blue-600" size={48} />
              <h3 className="text-xl font-semibold mb-2">Global Reach</h3>
              <p className="text-gray-600">
                Publish content that reaches readers across the globe.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
              <Users className="mx-auto mb-4 text-green-600" size={48} />
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-600">
                Connect with like-minded writers and readers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
              <Zap className="mx-auto mb-4 text-yellow-600" size={48} />
              <h3 className="text-xl font-semibold mb-2">Quick Monetization</h3>
              <p className="text-gray-600">
                Earn from your content through subscriptions and tips.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
              <BookOpen className="mx-auto mb-4 text-purple-600" size={48} />
              <h3 className="text-xl font-semibold mb-2">Analytics</h3>
              <p className="text-gray-600">
                Detailed insights into your audience and content performance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Writing Journey?
          </h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto">
            Join thousands of writers who have found their voice and audience on our platform.
          </p>
          <div className="flex justify-center space-x-4">
            <a 
              href="/register" 
              className="px-10 py-4 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-colors text-lg font-semibold"
            >
              Create Account
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Platform</h3>
              <nav className="space-y-2">
                <a href="/features" className="block hover:text-blue-300">Features</a>
                <a href="/pricing" className="block hover:text-blue-300">Pricing</a>
                <a href="/about" className="block hover:text-blue-300">About Us</a>
              </nav>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Support</h3>
              <nav className="space-y-2">
                <a href="/help" className="block hover:text-blue-300">Help Center</a>
                <a href="/contact" className="block hover:text-blue-300">Contact</a>
                <a href="/terms" className="block hover:text-blue-300">Terms of Service</a>
              </nav>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Connect</h3>
              <nav className="space-y-2">
                <a href="#" className="block hover:text-blue-300">Twitter</a>
                <a href="#" className="block hover:text-blue-300">LinkedIn</a>
                <a href="#" className="block hover:text-blue-300">Email Newsletter</a>
              </nav>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p>&copy; 2025 Blog Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
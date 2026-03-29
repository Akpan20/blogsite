import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from './Footer';

interface BlogLayoutProps {
  children?: React.ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <div className="flex gap-8 items-start">
          {/* Main content area */}
          <div className="flex-1 min-w-0">
            {children ?? <Outlet />}
          </div>

          {/* Right sidebar — sticky, scrolls with page */}
          <div className="hidden lg:block w-80 shrink-0">
            <Sidebar variant="blog" sticky={true} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
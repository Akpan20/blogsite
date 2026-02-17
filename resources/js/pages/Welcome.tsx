import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const TimelineItem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <li className="relative flex items-start gap-4 py-1 pl-8 before:absolute before:left-4 before:top-0 before:-bottom-4 before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A] last:before:hidden">
      <span className="absolute left-0 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-[#e3e3e0] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
        <span className="h-3 w-3 rounded-full bg-[#dbdbd7] dark:bg-[#3E3E3A]"></span>
      </span>
      <span className="mt-1">{children}</span>
    </li>
  );
};

const BlogsiteLogo: React.FC = () => {
  return (
    <svg
      className="mx-auto w-full max-w-xs translate-y-0 opacity-100 transition-all duration-1000 lg:max-w-md dark:text-[#F61500] text-[#F53003]"
      viewBox="0 0 200 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Simple "BLOGSITE" text logo - you can replace with your actual logo */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="32"
        fontWeight="bold"
        fill="currentColor"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        BLOGSITE
      </text>
    </svg>
  );
};

export default function Welcome() {
  const { user, isLoading } = useAuth();

  // Don't render anything while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-[#1b1b18] antialiased dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
      {/* Header / Auth Links */}
      <header className="mx-auto w-full max-w-4xl px-6 pt-6 lg:px-8">
        <nav className="flex justify-end gap-4 text-sm">
          {user ? (
            <Link
              to="/dashboard"
              className="rounded border border-black/20 px-5 py-1.5 font-medium hover:border-black/30 dark:border-white/20 dark:hover:border-white/30"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded border border-transparent px-5 py-1.5 hover:border-black/20 dark:hover:border-white/20"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="rounded border border-black/20 px-5 py-1.5 font-medium hover:border-black/30 dark:border-white/20 dark:hover:border-white/30"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex max-w-4xl grow flex-col items-center justify-center gap-12 px-6 py-12 lg:flex-row lg:gap-0 lg:px-8 lg:py-20">
        {/* Text Column */}
        <div className="w-full max-w-md rounded-b-2xl bg-white p-8 shadow-inner dark:bg-[#161615] lg:max-w-none lg:rounded-bl-2xl lg:rounded-tr-none lg:p-12 lg:shadow-[inset_0_0_0_1px_rgba(26,26,0,0.16)] dark:lg:shadow-[inset_0_0_0_1px_#fffaed2d]">
          <h1 className="mb-2 text-xl font-medium">Welcome to Blogsite</h1>
          <p className="mb-6 text-[#706f6c] dark:text-[#A1A09A]">
            Publish distraction-free. Reach readers who care.
            <br />
            Get started with the following.
          </p>

          <ul className="mb-8 space-y-4 text-sm">
            <TimelineItem>
              Explore the{' '}
              <Link
                to="/dashboard"
                className="font-medium text-[#f53003] underline underline-offset-4 hover:text-[#f53003]/80 dark:text-[#FF4433]"
              >
                Dashboard →
              </Link>
            </TimelineItem>

            <TimelineItem>
              Create your first{' '}
              <Link
                to="/content"
                className="font-medium text-[#f53003] underline underline-offset-4 hover:text-[#f53003]/80 dark:text-[#FF4433]"
              >
                Blog Post →
              </Link>
            </TimelineItem>

            <TimelineItem>
              Browse{' '}
              <Link
                to="/categories"
                className="font-medium text-[#f53003] underline underline-offset-4 hover:text-[#f53003]/80 dark:text-[#FF4433]"
              >
                Categories →
              </Link>
            </TimelineItem>
          </ul>

          <div>
            {user ? (
              <Link
                to="/dashboard"
                className="inline-block rounded border border-black bg-black px-6 py-2 text-sm font-medium text-white hover:bg-black/90 dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-block rounded border border-black bg-black px-6 py-2 text-sm font-medium text-white hover:bg-black/90 dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>

        {/* Illustration Column */}
        <div className="relative w-full overflow-hidden rounded-t-2xl bg-[#fff2f2] lg:w-auto lg:max-w-xl lg:rounded-r-2xl lg:rounded-tl-none dark:bg-[#1D0002]">
          {/* Logo */}
          <BlogsiteLogo />

          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-br from-[#f53003]/5 to-transparent pointer-events-none" />

          {/* Inner shadow overlay */}
          <div className="pointer-events-none absolute inset-0 rounded-t-2xl shadow-[inset_0_0_0_1px_rgba(26,26,0,0.16)] dark:rounded-r-2xl dark:shadow-[inset_0_0_0_1px_#fffaed2d] lg:rounded-tl-none"></div>
        </div>
      </main>

      {/* Small spacer for desktop */}
      <div className="hidden h-14 lg:block"></div>
    </div>
  );
}
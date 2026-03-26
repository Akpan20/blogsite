import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PublicFeaturedPosts from '@/components/content/PublicFeaturedPosts';
import CategoryDropdown from '@/components/content/CategoryDropdown';
import TagCloud from '@/components/content/TagCloud';
import NewsletterSubscribe from '@/components/newsletter/NewsletterSubscribe';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Inline BlogsiteLogo component
const BlogsiteLogo: React.FC = () => (
  <svg
    className="mx-auto w-full max-w-xs translate-y-0 opacity-100 transition-all duration-1000 lg:max-w-md dark:text-[#F61500] text-[#F53003]"
    viewBox="0 0 200 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
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
      TERRYOLISE'S BLOG
    </text>
  </svg>
);

const TimelineItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="relative flex items-start gap-4 py-1 pl-8 before:absolute before:left-4 before:top-0 before:-bottom-4 before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A] last:before:hidden">
    <span className="absolute left-0 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-[#e3e3e0] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
      <span className="h-3 w-3 rounded-full bg-[#dbdbd7] dark:bg-[#3E3E3A]" />
    </span>
    <span className="mt-1">{children}</span>
  </li>
);

const CtaButton = () => {
  const { user } = useAuth();
  return user ? (
    <Button asChild variant="default" size="lg">
      <Link to="/dashboard">Go to Dashboard</Link>
    </Button>
  ) : (
    <Button asChild variant="default" size="lg">
      <Link to="/register">Get Started</Link>
    </Button>
  );
};

export default function Welcome() {
  return (
    <>
      <SEOHead
        title="Welcome to Blogsite"
        description="Publish distraction-free. Reach readers who care."
      />
      <div className="min-h-screen bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
        <Navbar />

        {/* Hero Section */}
        <main className="mx-auto flex max-w-4xl grow flex-col items-center justify-center gap-12 px-6 py-12 lg:flex-row lg:gap-0 lg:px-8 lg:py-20">
          {/* Left column */}
          <div className="w-full max-w-md rounded-b-2xl bg-white p-8 shadow-inner dark:bg-[#161615] lg:max-w-none lg:rounded-bl-2xl lg:rounded-tr-none lg:p-12 lg:shadow-[inset_0_0_0_1px_rgba(26,26,0,0.16)] dark:lg:shadow-[inset_0_0_0_1px_#fffaed2d]">
            <h1 className="mb-2 text-xl font-medium">Welcome to TerryOlise's Blog</h1>
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

            <CtaButton />
          </div>

          {/* Right column */}
          <div className="relative w-full overflow-hidden rounded-t-2xl bg-[#fff2f2] lg:w-auto lg:max-w-xl lg:rounded-r-2xl lg:rounded-tl-none dark:bg-[#1D0002]">
            <BlogsiteLogo />
            <div className="absolute inset-0 bg-linear-to-br from-[#f53003]/5 to-transparent pointer-events-none" />
            <div className="pointer-events-none absolute inset-0 rounded-t-2xl shadow-[inset_0_0_0_1px_rgba(26,26,0,0.16)] dark:rounded-r-2xl dark:shadow-[inset_0_0_0_1px_#fffaed2d] lg:rounded-tl-none" />
          </div>
        </main>

        {/* Featured Posts - Public Version */}
        <section className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
          <h2 className="text-2xl font-semibold mb-8">Featured Posts</h2>
          <PublicFeaturedPosts limit={3} />
        </section>

        {/* Categories & Tags */}
        <section className="mx-auto max-w-4xl px-6 py-16 lg:px-8 bg-gray-50 dark:bg-[#111110]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-medium mb-4">Explore Categories</h3>
                <CategoryDropdown />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-medium mb-4">Popular Tags</h3>
                <TagCloud />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Newsletter */}
        <section className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
          <Card className="bg-[#fafaf9] dark:bg-[#1a1a18]">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">Stay Updated</h2>
              <p className="mb-6 text-[#706f6c] dark:text-[#A1A09A]">
                Get the latest posts delivered straight to your inbox.
              </p>
              <NewsletterSubscribe />
            </CardContent>
          </Card>
        </section>

        <Footer />
      </div>
    </>
  );
}
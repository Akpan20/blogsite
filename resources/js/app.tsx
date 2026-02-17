import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useLocation
} from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/components/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';
import '../css/app.css';

// ────────────────────────────────────────────────
// Lazy-loaded Components
// ────────────────────────────────────────────────

// Public Pages
const About = lazy(() => import('@/pages/About'));
const Guidelines = lazy(() => import('@/pages/Guidelines'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const Cookies = lazy(() => import('@/pages/Cookies'));
const Contact = lazy(() => import('@/pages/Contact'));
const ApiDocs = lazy(() => import('@/pages/ApiDocs'));
const Welcome = lazy(() => import('@/pages/Welcome'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const PublicPostPage = lazy(() => import('@/pages/PublicPostPage'));
const SearchResultsPage = lazy(() => import('@/pages/SearchResultsPage'));

// Layouts
const DashboardLayout = lazy(() => import('@/components/layout/DashboardLayout'));
const BlogLayout = lazy(() => import('@/components/layout/BlogLayout'));

// Dashboard Pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const PostList = lazy(() => import('@/components/dashboard/Content/PostList'));
const PostDetail = lazy(() => import('@/components/dashboard/Content/PostDetail'));
const Analytics = lazy(() => import('@/components/dashboard/Analytics'));
const Monetize = lazy(() => import('@/components/dashboard/Monetize/Monetize'));
const Settings = lazy(() => import('@/pages/Settings'));

// Community Pages
const UserProfilePage = lazy(() => import('@/pages/community/UserProfilePage'));
const MessagingInterface = lazy(() => import('@/pages/community/MessagingInterface'));
const Leaderboard = lazy(() => import('@/pages/community/Leaderboard'));
const FollowersList = lazy(() => import('@/components/community/FollowersList'));
const ActivityFeed = lazy(() => import('@/components/community/ActivityFeed'));

// Subscription Pages
const SubscriptionPlans = lazy(() => import('@/components/subscriptions/SubscriptionPlans'));
const SubscriptionVerify = lazy(() => import('@/components/subscriptions/SubscriptionVerify'));
const SubscriptionDashboard = lazy(() => import('@/components/subscriptions/SubscriptionDashboard'));

// Admin Pages
const AdminRevenueAnalytics = lazy(() => import('@/components/subscriptions/AdminRevenueAnalytics'));
const CategoryManager = lazy(() => import('@/components/category/CategoryManager'));
const FeaturedPostManager = lazy(() => import('@/components/content/FeaturedPostManager'));

// Resource Pages
const CreatorSupport = lazy(() => import('@/pages/CreatorSupport'));
const CreatorEducation = lazy(() => import('@/pages/CreatorEducation'));
const OtherTools = lazy(() => import('@/pages/OtherTools'));

const CategoryList = lazy(() => import('@/pages/CategoryList'));
const SeriesList = lazy(() => import('@/pages/SeriesList'));

// ────────────────────────────────────────────────
// Query Client
// ────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// ────────────────────────────────────────────────
// Loading Fallback
// ────────────────────────────────────────────────
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Protected Route Component
// ────────────────────────────────────────────────
function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// ────────────────────────────────────────────────
// Public Route Wrapper (with BlogLayout)
// ────────────────────────────────────────────────
function PublicRoute() {
  return (
    <BlogLayout>
      <Outlet />
    </BlogLayout>
  );
}

// ────────────────────────────────────────────────
// Router Configuration
// ────────────────────────────────────────────────
const router = createBrowserRouter(
  [
    {
      path: '/',
      element: (
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      ),
      children: [
        // ═══════════════════════════════════════════
        // PUBLIC ROUTES
        // ═══════════════════════════════════════════
        {
          path: '/',
          element: <Welcome />,
        },
        {
          path: '/login',
          element: <Login />,
        },
        {
          path: '/register',
          element: <Register />,
        },

        {
          path: '/about',
          element: <About />,
        },
        {
          path: '/guidelines',
          element: <Guidelines />,
        },
        {
          path: '/privacy',
          element: <Privacy />,
        },
        {
          path: '/terms',
          element: <Terms />,
        },
        {
          path: '/cookies',
          element: <Cookies />,
        },
        {
          path: '/contact',
          element: <Contact />,
        },
        {
          path: '/api-docs',
          element: <ApiDocs />,
        },
        
        // Public Blog Routes (with BlogLayout)
        {
          element: <PublicRoute />,
          children: [
            {
              path: '/posts/:id',
              element: <PublicPostPage />,
            },
            {
              path: '/search',
              element: <SearchResultsPage />,
            },
            {
              path: '/profile/:userId',
              element: <UserProfilePage />,
            },
            {
              path: '/profile/:username/followers',
              element: <FollowersList type="followers" />,
            },
            {
              path: '/profile/:username/following',
              element: <FollowersList type="following" />,
            },
            {
              path: '/leaderboard',
              element: <Leaderboard />,
            },
            {
              path: '/posts/:id',
              element: <PublicPostPage />,
            },
            {
              path: '/search',
              element: <SearchResultsPage />,
            },
            {
              path: '/profile/:userId',
              element: <UserProfilePage />,
            },
            {
              path: '/profile/:userId/followers',
              element: <FollowersList type="followers" />,
            },
            {
              path: '/profile/:userId/following',
              element: <FollowersList type="following" />,
            },
            {
              path: '/leaderboard',
              element: <Leaderboard />,
            },
            {
              path: '/categories',
              element: <CategoryList />,
            },
            {
              path: '/series',
              element: <SeriesList />,
            },
          ],
        },

        // Subscription Routes (public)
        {
          path: '/subscription/plans',
          element: <SubscriptionPlans />,
        },
        {
          path: '/subscription/verify',
          element: <SubscriptionVerify />,
        },

        // ═══════════════════════════════════════════
        // PROTECTED ROUTES
        // ═══════════════════════════════════════════
        {
          element: <ProtectedRoute />,
          children: [
            // Dashboard Routes
            {
              element: <DashboardLayout />,
              children: [
                {
                  path: '/dashboard',
                  element: <Dashboard />,
                },
                {
                  path: '/content',
                  element: <PostList />,
                },
                {
                  path: '/content/:slug',
                  element: <PostDetail />,
                },
                {
                  path: '/analytics',
                  element: <Analytics />,
                },
                {
                  path: '/monetize',
                  element: <Monetize />,
                },
                {
                  path: '/settings',
                  element: <Settings />,
                },
                {
                  path: '/community',
                  element: <UserProfilePage />,
                },
                {
                  path: '/tools',
                  element: <OtherTools />,
                },
                
                // Admin Routes
                {
                  path: '/admin/categories',
                  element: <CategoryManager />,
                },
                {
                  path: '/admin/featured-posts',
                  element: <FeaturedPostManager />,
                },
                {
                  path: '/admin/revenue',
                  element: <AdminRevenueAnalytics />,
                },
              ],
            },

            // Protected Community Routes (with BlogLayout)
            {
              element: <PublicRoute />,
              children: [
                {
                  path: '/messages',
                  element: <MessagingInterface />,
                },
                {
                  path: '/feed',
                  element: <ActivityFeed type="personal" />,
                },
                {
                  path: '/subscription/dashboard',
                  element: <SubscriptionDashboard />,
                },
              ],
            },

            // Resource Pages (with DashboardLayout)
            {
              element: <DashboardLayout><Outlet /></DashboardLayout>,
              children: [
                {
                  path: '/support',
                  element: <CreatorSupport />,
                },
                {
                  path: '/education',
                  element: <CreatorEducation />,
                },
              ],
            },
          ],
        },

        // ═══════════════════════════════════════════
        // CATCH-ALL
        // ═══════════════════════════════════════════
        {
          path: '*',
          element: <Navigate to="/" replace />,
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

// ────────────────────────────────────────────────
// Root Render
// ────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider defaultTheme="system" enableSystem storageKey="blogsite-theme">
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<LoadingFallback />}>
            <RouterProvider
              router={router}
              future={{ v7_startTransition: true }}
            />
          </Suspense>
          <Toaster richColors position="top-right" closeButton />
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);
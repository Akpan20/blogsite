import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import NotificationDropdown from '@/components/community/NotificationDropdown';
import {
  LayoutDashboard, FileText, BarChart3, DollarSign,
  Settings, BookOpen, LifeBuoy, Wrench,
  Menu, X, LogOut, User, Sun, Moon, Search, MessageCircle, ChevronDown,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavbarProps {
  variant?: 'top' | 'dashboard';
  isCollapsed?: boolean;
  onToggle?: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DASHBOARD_NAV = [
  {
    section: 'Main',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Content',   path: '/content',   icon: FileText        },
      { name: 'Analytics', path: '/analytics', icon: BarChart3       },
      { name: 'Monetize',  path: '/monetize',  icon: DollarSign      },
    ],
  },
  {
    section: 'Other',
    items: [
      { name: 'Creator Education', path: '/education', icon: BookOpen },
      { name: 'Creator Support',   path: '/support',   icon: LifeBuoy },
      { name: 'Other Tools',       path: '/tools',     icon: Wrench   },
      { name: 'Settings',          path: '/settings',  icon: Settings },
    ],
  },
];

const TOP_NAV_LINKS = [
  { name: 'Home',        path: '/'            },
  { name: 'Categories',  path: '/categories'  },
  { name: 'Series',      path: '/series'      },
  { name: 'Leaderboard', path: '/leaderboard' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useNavActions() {
  const { user, logout } = useAuth();
  const handleLogout = async () => {
    try { await logout(); } catch (err) { console.error('Logout failed:', err); }
  };
  return { user, handleLogout };
}

function useIsDark() {
  const { theme } = useTheme();
  return theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Avatar({ user, size = 'md' }: { user: any; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  return user.avatar ? (
    <img src={user.avatar} alt={user.name}
      className={`${dim} rounded-full object-cover border border-gray-200 dark:border-gray-700`} />
  ) : (
    <div className={`${dim} rounded-full bg-linear-to-br from-blue-500 to-purple-500
                     flex items-center justify-center text-white font-bold`}>
      {user.name.charAt(0).toUpperCase()}
    </div>
  );
}

function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 min-w-0">
      <div className="w-8 h-8 shrink-0 bg-linear-to-br from-blue-600 to-indigo-600
                      rounded-lg flex items-center justify-center text-white font-bold">
        T
      </div>
      {!collapsed && (
        <span className="font-bold text-gray-900 dark:text-white
                         text-base sm:text-lg truncate max-w-[36 sm:max-w-none">
          TerryOlise&apos;s Blog
        </span>
      )}
    </Link>
  );
}

function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const { setTheme } = useTheme();
  const isDark = useIsDark();
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex items-center gap-3 px-3 py-2 w-full rounded-lg transition
                  text-gray-600 dark:text-gray-400
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  ${collapsed ? 'justify-center' : ''}`}
    >
      {isDark
        ? <Sun  className="w-5 h-5 shrink-0 text-yellow-500" />
        : <Moon className="w-5 h-5 shrink-0 text-gray-500" />}
      {!collapsed && (
        <span className="font-medium text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
      )}
    </button>
  );
}

// ─── Dashboard sidebar ────────────────────────────────────────────────────────

function DashboardNav({ isCollapsed: controlled, onToggle }: Omit<NavbarProps, 'variant'>) {
  const location = useLocation();
  const { user, handleLogout } = useNavActions();
  const [internal, setInternal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isCollapsed = controlled !== undefined ? controlled : internal;
  const toggle = () => (onToggle ? onToggle() : setInternal(c => !c));
  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  // Close sidebar on route change (mobile)
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <>
      {/* Mobile hamburger — only visible when sidebar is closed */}
      <button
        onClick={() => setMobileOpen(o => !o)}
        aria-label="Toggle sidebar"
        className="lg:hidden fixed top-3 left-3 z-50 p-2
                   bg-white dark:bg-gray-900 rounded-lg shadow-md
                   border border-gray-200 dark:border-gray-700"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        flex flex-col h-full bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-800
        transition-all duration-300 ease-in-out
        fixed lg:static inset-y-0 left-0 z-40
        ${isCollapsed ? 'w-16 sm:w-20' : 'w-64'}
        ${mobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Logo + collapse toggle */}
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800
                        flex items-center justify-between gap-2 min-h-16">
          {!isCollapsed && <Logo />}
          <button
            onClick={toggle}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex shrink-0 p-2 rounded-lg
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          {isCollapsed && (
            <div className="w-8 h-8 mx-auto shrink-0 bg-linear-to-br from-blue-600 to-indigo-600
                            rounded-lg flex items-center justify-center text-white font-bold">
              T
            </div>
          )}
        </div>

        {/* User profile */}
        {user && !isCollapsed && (
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar user={user} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
        {user && isCollapsed && (
          <div className="p-3 flex justify-center border-b border-gray-200 dark:border-gray-800">
            <Avatar user={user} size="sm" />
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {DASHBOARD_NAV.map(({ section, items }) => (
            <div key={section}>
              {!isCollapsed && (
                <p className="px-3 mb-1 text-[10px] font-semibold tracking-widest
                              text-gray-400 dark:text-gray-500 uppercase">
                  {section}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map(({ name, path, icon: Icon }) => {
                  const active = isActive(path);
                  return (
                    <Link
                      key={path}
                      to={path}
                      title={isCollapsed ? name : undefined}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm
                        ${isCollapsed ? 'justify-center' : ''}
                        ${active
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
                      `}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span>{name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-800 space-y-0.5">
          <ThemeToggle collapsed={isCollapsed} />
          <Link
            to={`/profile/${user?.id}`}
            title={isCollapsed ? 'View Profile' : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                        text-gray-700 dark:text-gray-300
                        hover:bg-gray-100 dark:hover:bg-gray-800 transition
                        ${isCollapsed ? 'justify-center' : ''}`}
          >
            <User className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="font-medium">View Profile</span>}
          </Link>
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                        text-red-600 dark:text-red-400
                        hover:bg-red-50 dark:hover:bg-red-900/20 transition
                        ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

// ─── Top nav ──────────────────────────────────────────────────────────────────

function UserDropdown({ user, handleLogout }: { user: any; handleLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 p-1 rounded-lg
                   hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        <Avatar user={user} size="sm" />
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900
                        rounded-xl shadow-lg border border-gray-200 dark:border-gray-800
                        overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
          <div className="py-1">
            {[
              { label: 'Profile',   to: `/profile/${user.username || user.id}` },
              { label: 'Dashboard', to: '/dashboard'                           },
              { label: 'Settings',  to: '/settings'                            },
            ].map(({ label, to }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300
                           hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                {label}
              </Link>
            ))}
            <button
              onClick={() => { setOpen(false); handleLogout(); }}
              className="w-full text-left px-4 py-2 text-sm
                         text-red-600 dark:text-red-400
                         hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TopNav() {
  const location = useLocation();
  const { user, handleLogout } = useNavActions();
  const { setTheme } = useTheme();
  const isDark = useIsDark();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  // Close on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const navLinkClass = (path: string) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition ${
      isActive(path)
        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
    }`;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800
                    sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">

          {/* Logo */}
          <Logo />

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {TOP_NAV_LINKS.map(({ name, path }) => (
              <Link key={path} to={path} className={navLinkClass(path)}>{name}</Link>
            ))}
            {user && <Link to="/dashboard" className={navLinkClass('/dashboard')}>Dashboard</Link>}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              title={isDark ? 'Light mode' : 'Dark mode'}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {isDark
                ? <Sun  className="w-5 h-5 text-yellow-500" />
                : <Moon className="w-5 h-5" />}
            </button>

            {/* Search — hidden on very small screens */}
            <Link to="/search" title="Search"
              className="hidden xs:flex p-2 rounded-lg text-gray-600 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Search className="w-5 h-5" />
            </Link>

            {user ? (
              <>
                {/* Notifications */}
                <NotificationDropdown />

                {/* Messages — hidden on small screens */}
                <Link to="/messages" title="Messages"
                  className="hidden sm:flex p-2 rounded-lg text-gray-600 dark:text-gray-400
                             hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <MessageCircle className="w-5 h-5" />
                </Link>

                {/* User dropdown (desktop) */}
                <div className="hidden sm:block">
                  <UserDropdown user={user} handleLogout={handleLogout} />
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300
                             hover:text-blue-600 transition">
                  Login
                </Link>
                <Link to="/register"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm
                             font-medium rounded-lg transition">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800
                        bg-white dark:bg-gray-900">

          {/* Nav links */}
          <div className="px-4 py-3 space-y-0.5">
            {TOP_NAV_LINKS.map(({ name, path }) => (
              <Link key={path} to={path} onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(path)
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>
                {name}
              </Link>
            ))}
            {user && (
              <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/dashboard')
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>
                Dashboard
              </Link>
            )}
          </div>

          {/* User section (mobile) */}
          {user ? (
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 space-y-0.5">
              {/* Mini profile */}
              <div className="flex items-center gap-3 px-3 py-2 mb-1">
                <Avatar user={user} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              {[
                { label: 'Profile',  to: `/profile/${user.username || user.id}`, icon: User       },
                { label: 'Messages', to: '/messages',                             icon: MessageCircle },
                { label: 'Search',   to: '/search',                               icon: Search     },
                { label: 'Settings', to: '/settings',                             icon: Settings   },
              ].map(({ label, to, icon: Icon }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                             text-gray-700 dark:text-gray-300
                             hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              ))}

              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                           text-red-600 dark:text-red-400
                           hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Logout
              </button>
            </div>
          ) : (
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 flex gap-3">
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="flex-1 py-2 text-center text-sm font-medium rounded-lg
                           border border-gray-200 dark:border-gray-700
                           text-gray-700 dark:text-gray-300
                           hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                Login
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}
                className="flex-1 py-2 text-center text-sm font-medium rounded-lg
                           bg-blue-600 hover:bg-blue-700 text-white transition">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function Navbar({ variant = 'top', isCollapsed, onToggle }: NavbarProps) {
  return variant === 'dashboard'
    ? <DashboardNav isCollapsed={isCollapsed} onToggle={onToggle} />
    : <TopNav />;
}
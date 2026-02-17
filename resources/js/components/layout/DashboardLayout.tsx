import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  DollarSign,
  Settings,
  BookOpen,
  LifeBuoy,
  Wrench,
  Menu,
  X,
  LogOut,
  User,
} from 'lucide-react';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Navigation */}
      <DashboardNav />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>

      {/* Right Sidebar */}
      <Sidebar variant="dashboard" sticky={true} />
    </div>
  );
}

// Dashboard Navigation Component
function DashboardNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    {
      section: 'Main',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Content', path: '/content', icon: FileText },
        { name: 'Analytics', path: '/analytics', icon: BarChart3 },
        { name: 'Monetize', path: '/monetize', icon: DollarSign },
      ],
    },
    {
      section: 'Other',
      items: [
        { name: 'Creator Education', path: '/education', icon: BookOpen },
        { name: 'Creator Support', path: '/support', icon: LifeBuoy },
        { name: 'Other Tools', path: '/tools', icon: Wrench },
        { name: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Navigation Sidebar */}
      <aside
        className={`
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:static inset-y-0 left-0 z-40
          bg-white border-r border-gray-200
          transition-all duration-300
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!isCollapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                B
              </div>
              <span className="text-xl font-bold text-gray-900">BlogSite</span>
            </Link>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* User Profile */}
        {!isCollapsed && user && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">{user.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navItems.map((section) => (
            <div key={section.section}>
              {!isCollapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.section}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg transition
                        ${active
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      {!isCollapsed && (
                        <span className="font-medium">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link
            to={`/profile/${user?.id}`}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg transition
              text-gray-700 hover:bg-gray-100
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'View Profile' : undefined}
          >
            <User className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="font-medium">View Profile</span>}
          </Link>

          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg transition
              text-red-600 hover:bg-red-50
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
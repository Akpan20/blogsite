import Link from 'next/link';
import { BarChart3, Home, FileText, Users, Settings } from 'lucide-react';

// Define navigation items type
type NavItem = {
  path: string;
  label: string;
  icon: React.ComponentType;
  requiresAuth: boolean;
};

// Define navigation items array
const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Home',
    icon: Home,
    requiresAuth: false
  },
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    requiresAuth: true
  },
  {
    path: '/posts',
    label: 'Posts',
    icon: FileText,
    requiresAuth: false
  },
  {
    path: '/users',
    label: 'Users',
    icon: Users,
    requiresAuth: true
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    requiresAuth: true
  }
];

const Navigation = () => {
  return (
    <nav className="p-4 bg-white shadow-sm">
      <ul className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link 
              href={item.path}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <item.icon className="w-5 h-5 text-gray-600" />
              <span className="text-gray-800">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
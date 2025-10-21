import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, BarChart2, Bookmark, User, HelpCircle } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/journey', icon: BookOpen, label: 'My Journey' },
    { to: '/summary', icon: BookOpen, label: 'Summary' },
    { to: '/progress', icon: BarChart2, label: 'Progress' },
    { to: '/highlights', icon: Bookmark, label: 'Highlights' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/help', icon: HelpCircle, label: 'Help' }
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">My Wellness Journal</h1>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`${
                  location.pathname === item.to
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-primary-500'
                } px-1 pt-1 text-sm font-medium transition-colors`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center md:hidden">
            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`${
                location.pathname === item.to
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              } group flex items-center px-3 py-2 text-base font-medium rounded-md`}
            >
              <item.icon className="mr-3 h-6 w-6" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

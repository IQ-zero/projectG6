import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUserData } from '../../context/UserContext';
import { Bell, User, Search, GraduationCap } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications } = useUserData();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Memoize unread notifications count
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // Handle clicks outside of menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    setSearchQuery('');
  }, [searchQuery]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-20 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 h-16">
        {/* Logo and branding */}
        <div className="flex items-center">
          <Link to="/app" className="flex items-center space-x-2" aria-label="CareerConnect Home">
            <GraduationCap size={28} className="text-primary-600" />
            <span className="text-xl font-bold text-primary-900 hidden sm:inline-block">CareerConnect</span>
          </Link>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search jobs, events, companies..."
              className="input pr-10 py-1.5 focus:ring-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Submit Search"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* User section */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              className="p-2 rounded-full hover:bg-gray-100 relative"
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                setProfileOpen(false);
              }}
              aria-label="Toggle Notifications"
            >
              <Bell size={20} className="text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-error-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-md py-2 z-30 animate-slide-down">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <button className="text-sm text-primary-600 hover:underline" aria-label="Mark all as read">Mark all as read</button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification) => (
                      <Link
                        to={notification.link || '#'}
                        key={notification.id}
                        className={`block px-4 py-3 hover:bg-gray-50 border-l-2 ${
                          notification.read ? 'border-transparent' : 'border-primary-500'
                        }`}
                        aria-label={`Notification: ${notification.title}`}
                      >
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.timestamp).toLocaleDateString()}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">No notifications</div>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-gray-100">
                  <Link to="/app/notifications" className="text-sm text-primary-600 hover:underline block text-center">
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User profile */}
          <div className="relative" ref={profileRef}>
            <button
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationOpen(false);
              }}
              aria-label="Toggle Profile Menu"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <User size={16} className="text-primary-700" />
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">
                {user?.name?.split(' ')[0] || 'Guest'}
              </span>
            </button>

            {/* Profile dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-md py-2 z-30 animate-slide-down">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Guest'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'No email available'}</p>
                </div>
                <Link
                  to="/app/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setProfileOpen(false)}
                  aria-label="Profile Settings"
                >
                  Profile Settings
                </Link>
                <Link
                  to="/app/resume"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setProfileOpen(false)}
                  aria-label="My Resumes"
                >
                  My Resumes
                </Link>
                <Link
                  to="/app/saved"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setProfileOpen(false)}
                  aria-label="Saved Items"
                >
                  Saved Items
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setProfileOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-gray-50"
                  aria-label="Sign Out"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
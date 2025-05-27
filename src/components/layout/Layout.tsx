import React, { useState, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import { MenuIcon, X } from 'lucide-react';

const Layout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Handle sidebar toggle
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div
            className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"
            aria-label="Loading spinner"
          ></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex flex-1 pt-16">
        {/* Mobile sidebar toggle button */}
        <div className="fixed bottom-4 right-4 md:hidden z-30">
          <button
            onClick={toggleSidebar}
            className="bg-primary-600 text-white p-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <X size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>

        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pt-6 transition-all duration-300 ease-in-out">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
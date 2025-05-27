import React, { useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home,
  FileText,
  Calendar,
  Building2,
  Briefcase,
  User,
  X,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', to: '/app', icon: Home },
    { name: 'Resume Builder', to: '/app/resume', icon: FileText },
    { name: 'Events', to: '/app/events', icon: Calendar },
    { name: 'Companies', to: '/app/companies', icon: Building2 },
    { name: 'Jobs', to: '/app/jobs', icon: Briefcase },
    { name: 'Profile', to: '/app/profile', icon: User },
    ...(user?.role === 'admin' ? [{ name: 'Admin Dashboard', to: '/app/admin', icon: Shield }] : []),
  ];

  const handleNavClick = useCallback(
    () => {
      if (window.innerWidth < 1024) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <div
      className={`
        fixed top-0 left-0 bottom-0 z-30
        w-64 bg-white border-r border-gray-200
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      aria-hidden={!isOpen}
      aria-label="Sidebar"
    >
      {/* Mobile close button */}
      <button
        className="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
        onClick={onClose}
        aria-label="Close sidebar"
      >
        <X size={24} />
      </button>

      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-600">CareerConnect</h1>
      </div>

      {/* Navigation */}
      <nav className="px-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) => `
              flex items-center px-4 py-2 text-sm font-medium rounded-md
              ${isActive
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
            onClick={handleNavClick}
            aria-label={item.name}
          >
            <item.icon size={20} className="mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Settings, Key, Mail, User } from 'lucide-react';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const closePasswordModal = useCallback(() => {
    setShowChangePasswordModal(false);
  }, []);

  const closeEmailModal = useCallback(() => {
    setShowChangeEmailModal(false);
  }, []);

  return (
    <div className="relative">
      {/* User Profile Button */}
      <button
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Open user menu"
      >
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
          <User size={16} className="text-primary-700" />
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">
          {user?.name || 'User'}
        </span>
      </button>

      {/* Dropdown Menu */}
      <div className="dropdown-menu">
        <button
          className="dropdown-item flex items-center"
          onClick={() => setShowChangePasswordModal(true)}
          aria-label="Change password"
        >
          <Key size={16} className="mr-2" />
          Change Password
        </button>
        <button
          className="dropdown-item flex items-center"
          onClick={() => setShowChangeEmailModal(true)}
          aria-label="Change email"
        >
          <Mail size={16} className="mr-2" />
          Change Email
        </button>
        <button
          className="dropdown-item flex items-center"
          onClick={handleLogout}
          aria-label="Log out"
        >
          <LogOut size={16} className="mr-2" />
          Log Out
        </button>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div
          className="modal"
          role="dialog"
          aria-labelledby="change-password-title"
          aria-modal="true"
        >
          <div className="modal-content">
            <h2 id="change-password-title" className="text-xl font-semibold mb-4">
              Change Password
            </h2>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input type="password" className="input" placeholder="Enter current password" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input type="password" className="input" placeholder="Enter new password" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input type="password" className="input" placeholder="Confirm new password" />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={closePasswordModal}
                  aria-label="Cancel password change"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" aria-label="Save new password">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Email Modal */}
      {showChangeEmailModal && (
        <div
          className="modal"
          role="dialog"
          aria-labelledby="change-email-title"
          aria-modal="true"
        >
          <div className="modal-content">
            <h2 id="change-email-title" className="text-xl font-semibold mb-4">
              Change Email
            </h2>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Email
                </label>
                <input
                  type="email"
                  className="input"
                  value={user?.email || ''}
                  disabled
                  aria-label="Current email"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Email
                </label>
                <input
                  type="email"
                  className="input"
                  placeholder="Enter new email"
                  aria-label="New email"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={closeEmailModal}
                  aria-label="Cancel email change"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" aria-label="Save new email">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;

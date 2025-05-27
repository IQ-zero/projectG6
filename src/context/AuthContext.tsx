import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, StudentUser, EmployerUser, AdminUser } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'employer' | 'admin';
    company?: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  checkPermission: (action: string, resourceType: string, resourceId?: string) => boolean;
  hasRole: (role: User['role']) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUser: async () => {},
  checkPermission: () => false,
  hasRole: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasRole = useCallback((role: User['role']) => {
    return user?.role === role;
  }, [user]);

  const checkPermission = useCallback((action: string, resourceType: string, resourceId?: string): boolean => {
    if (!user) return false;

    switch (user.role) {
      case 'admin':
        return true;

      case 'employer':
        if (action === 'create') {
          return ['company', 'event', 'job'].includes(resourceType);
        }
        if (action === 'edit' || action === 'delete') {
          const employer = user as EmployerUser;
          if (resourceType === 'company') {
            return employer.companyId === resourceId;
          }
          if (['event', 'job'].includes(resourceType)) {
            return employer.managedItems?.[resourceType === 'job' ? 'jobs' : 'events']?.includes(resourceId || '') || false;
          }
        }
        return action === 'read' || action === 'save';

      case 'student':
        return action === 'read' || action === 'save';

      default:
        return false;
    }
  }, [user]);

  const login = useCallback(async (email: string, _password: string) => {
    try {
      setIsLoading(true);
      // Mock login - in a real app, this would be an API call
      let mockUser: User;

      // Demo users for testing different roles
      const demoUsers: Record<string, User> = {
        'g6@gmail.com': {
          id: 'admin-1',
          name: 'G6 Admin',
          email: 'g6@gmail.com',
          role: 'admin',
          status: 'active',
          permissions: ['all'],
        } as AdminUser,
        'employer@demo.com': {
          id: 'employer-1',
          name: 'Employer User',
          email: 'employer@demo.com',
          role: 'employer',
          status: 'active',
          companyId: 'company-1',
          company: 'Demo Company',
          managedItems: {
            jobs: [],
            events: [],
          }
        } as EmployerUser,
        'student@demo.com': {
          id: 'student-1',
          name: 'Student User',
          email: 'student@demo.com',
          role: 'student',
          status: 'active',
          major: 'Computer Science',
          graduationYear: 2024,
          savedItems: {
            jobs: [],
            companies: [],
            events: [],
          }
        } as StudentUser,
      };

      mockUser = demoUsers[email] || {
        id: Date.now().toString(),
        name: 'New Student',
        email: email,
        role: 'student',
        status: 'active',
        savedItems: {
          jobs: [],
          companies: [],
          events: [],
        }
      } as StudentUser;

      if (mockUser.status !== 'active') {
        throw new Error('Account is not active');
      }

      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async ({
    name,
    email,
    password: _password, // Ignore password in mock implementation
    role,
    company
  }: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'employer' | 'admin';
    company?: string;
  }) => {
    try {
      setIsLoading(true);
      console.log('Registering user with data:', { name, email, role, company });
      
      let mockUser: User;

      switch (role) {
        case 'employer':
          mockUser = {
            id: Date.now().toString(),
            name,
            email,
            role,
            status: 'active',
            companyId: company ? `company-${Date.now()}` : undefined,
            company,
            managedItems: {
              jobs: [],
              events: [],
            },
          } as EmployerUser;
          break;

        case 'student':
          mockUser = {
            id: Date.now().toString(),
            name,
            email,
            role,
            status: 'active',
            savedItems: {
              jobs: [],
              companies: [],
              events: [],
            },
          } as StudentUser;
          break;

        default:
          throw new Error('Invalid role');
      }

      console.log('Mock user created:', mockUser);

      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      if (!user) throw new Error('No user logged in');

      const updatedUser = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateUser,
      checkPermission,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
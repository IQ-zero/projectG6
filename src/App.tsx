import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import Events from './pages/Events';
import Companies from './pages/Companies';
import JobListings from './pages/JobListings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import SavedItems from './pages/SavedItems';
import Courses from './pages/Courses'; // Import the Courses page
import Admin from './pages/Admin'; // Import the Admin page
import { useAuth } from './context/AuthContext';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/app/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="resume" element={<ResumeBuilder />} />
              <Route path="events" element={<Events />} />
              <Route path="companies" element={<Companies />} />
              <Route path="jobs" element={<JobListings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="saved" element={<SavedItems />} />
              <Route path="courses" element={<Courses />} /> {/* Add route for Courses page */}
              <Route path="admin" element={<Admin />} /> {/* Add route for Admin page */}
            </Route>
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
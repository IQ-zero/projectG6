import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Job, Event, Notification, JobApplication, Resume } from '../types';
import { mockJobs, mockEvents, mockNotifications } from '../data/mockData';

interface UserContextType {
  savedJobs: Job[];
  appliedJobs: JobApplication[];
  registeredEvents: Event[];
  notifications: Notification[];
  resumes: Resume[];
  saveJob: (job: Job) => void;
  unsaveJob: (jobId: string) => void;
  applyToJob: (jobId: string, resumeId: string) => void;
  registerForEvent: (eventId: string) => void;
  unregisterFromEvent: (eventId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
  addResume: (resume: Resume) => void;
  updateResume: (resumeId: string, updatedResume: Resume) => void;
  deleteResume: (resumeId: string) => void;
}

const UserContext = createContext<UserContextType>({
  savedJobs: [],
  appliedJobs: [],
  registeredEvents: [],
  notifications: [],
  resumes: [],
  saveJob: () => {},
  unsaveJob: () => {},
  applyToJob: () => {},
  registerForEvent: () => {},
  unregisterFromEvent: () => {},
  markNotificationAsRead: () => {},
  clearAllNotifications: () => {},
  addResume: () => {},
  updateResume: () => {},
  deleteResume: () => {},
});

export const useUserData = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<JobApplication[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);

  // Initialize with mock data
  useEffect(() => {
    if (isAuthenticated && user) {
      try {
        setSavedJobs(mockJobs.slice(0, 3).map(job => ({ ...job, saved: true })));
        setRegisteredEvents(mockEvents.slice(0, 2).map(event => ({ ...event, registered: true })));
        setNotifications(mockNotifications);

        const mockApplications: JobApplication[] = mockJobs.slice(0, 2).map(job => ({
          id: `app-${job.id}`,
          jobId: job.id,
          userId: user.id,
          resumeId: 'resume-1',
          status: Math.random() > 0.5 ? 'applied' : 'review',
          appliedDate: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date().toISOString(),
        }));
        setAppliedJobs(mockApplications);
      } catch (error) {
        console.error('Error initializing user data:', error);
      }
    }
  }, [isAuthenticated, user]);

  const saveJob = useCallback((job: Job) => {
    setSavedJobs(prev => [...prev, { ...job, saved: true }]);
  }, []);

  const unsaveJob = useCallback((jobId: string) => {
    setSavedJobs(prev => prev.filter(job => job.id !== jobId));
  }, []);

  const applyToJob = useCallback((jobId: string, resumeId: string) => {
    const newApplication: JobApplication = {
      id: `app-${Date.now()}`,
      jobId,
      userId: user?.id || '',
      resumeId,
      status: 'applied',
      appliedDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    setAppliedJobs(prev => [...prev, newApplication]);

    const job = mockJobs.find(j => j.id === jobId);
    if (job) {
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        userId: user?.id || '',
        type: 'application_update',
        title: 'Application Submitted',
        message: `Your application for ${job.title} at ${job.company.name} has been submitted successfully.`,
        read: false,
        timestamp: new Date().toISOString(),
        link: '/app/jobs',
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      try {
        const storedEvents = localStorage.getItem('registeredEvents');
        if (storedEvents) {
          setRegisteredEvents(JSON.parse(storedEvents));
        }
      } catch (error) {
        console.error('Error loading registered events from localStorage:', error);
      }
    }
  }, [isAuthenticated, user]);

  const registerForEvent = useCallback((eventId: string) => {
    const event = mockEvents.find(e => e.id === eventId);
    if (event && !registeredEvents.some(e => e.id === eventId)) {
      const updatedEvents = [...registeredEvents, event];
      setRegisteredEvents(updatedEvents);
      localStorage.setItem('registeredEvents', JSON.stringify(updatedEvents));

      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        userId: user?.id || '',
        type: 'event_reminder',
        title: 'Event Registration Confirmed',
        message: `You're registered for ${event.title} on ${event.date}. We'll send you a reminder before the event.`,
        read: false,
        timestamp: new Date().toISOString(),
        link: '/app/events',
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  }, [registeredEvents, user]);

  const unregisterFromEvent = useCallback((eventId: string) => {
    const updatedEvents = registeredEvents.filter(event => event.id !== eventId);
    setRegisteredEvents(updatedEvents);
    localStorage.setItem('registeredEvents', JSON.stringify(updatedEvents));
  }, [registeredEvents]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  }, []);

  const addResume = useCallback((resume: Resume) => {
    setResumes(prev => [...prev, resume]);
  }, []);

  const updateResume = useCallback((resumeId: string, updatedResume: Resume) => {
    setResumes(prev => 
      prev.map(resume => (resume.id === resumeId ? { ...resume, ...updatedResume } : resume))
    );
  }, []);

  const deleteResume = useCallback((resumeId: string) => {
    setResumes(prev => prev.filter(resume => resume.id !== resumeId));
  }, []);

  return (
    <UserContext.Provider
      value={{
        savedJobs,
        appliedJobs,
        registeredEvents,
        notifications,
        resumes,
        saveJob,
        unsaveJob,
        applyToJob,
        registerForEvent,
        unregisterFromEvent,
        markNotificationAsRead,
        clearAllNotifications,
        addResume,
        updateResume,
        deleteResume,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
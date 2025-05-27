export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'employer' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
}

export interface StudentUser extends BaseUser {
  role: 'student';
  major?: string;
  graduationYear?: number;
  skills?: string[];
  savedItems?: {
    jobs?: string[];
    companies?: string[];
    events?: string[];
  };
}

export interface EmployerUser extends BaseUser {
  role: 'employer';
  companyId?: string;
  company?: string;
  position?: string;
  department?: string;
  managedItems?: {
    jobs?: string[];
    events?: string[];
  };
}

export interface AdminUser extends BaseUser {
  role: 'admin';
  permissions?: string[];
}

export type User = StudentUser | EmployerUser | AdminUser;

export interface Job {
  id: string;
  title: string;
  company: Company;
  location: string;
  type: 'fulltime' | 'parttime' | 'internship' | 'contract';
  description: string;
  requirements: string[];
  salary?: string;
  postedDate: string;
  deadline?: string;
  tags: string[];
  applied?: boolean;
  saved?: boolean;
  experience?: string;
  level?: 'entry' | 'mid' | 'senior' | 'lead';
  skills?: string[];
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  description: string;
  industry: string[];
  location: string;
  website: string;
  size?: string;
  founded?: number;
  alumni?: number;
  openPositions?: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  type: 'workshop' | 'career_fair' | 'info_session' | 'networking' | 'other';
  capacity?: number;
  registeredCount?: number;
  image?: string;
  requirements?: string[];
  tags?: string[];
  company?: Company;
  startTime?: string;
  endTime?: string;
  host?: string;
  virtual?: boolean;
  attendees?: number;
  link?: string;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  education: Education[];
  experience: Experience[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  location?: string;
  achievements?: string[];
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  location?: string;
  description: string[];
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  startDate?: string;
  endDate?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  expires?: string;
  link?: string;
}

export interface Appointment {
  id: string;
  advisorId: string;
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'resume_review' | 'career_guidance' | 'mock_interview' | 'job_search';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  virtual?: boolean;
  link?: string;
}

export interface Advisor {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  specialization: string[];
  bio: string;
  availability: AvailabilitySlot[];
  rating?: number;
}

export interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'application_update' | 'event_reminder' | 'message' | 'appointment' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  resumeId: string;
  coverLetterId?: string;
  status: 'applied' | 'review' | 'interview' | 'offer' | 'rejected';
  appliedDate: string;
  lastUpdated: string;
  notes?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  image?: string;
}
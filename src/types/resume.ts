export interface PersonalInfo {
  fullName?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
}

export interface Education {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface Experience {
  jobTitle: string;
  companyName: string;
  description: string;
}

export interface Skill {
  skillName: string;
}

export interface Project {
  title: string;
  description: string;
}

export interface ResumeData {
  personal: PersonalInfo;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  projects: Project[];
}

export interface Resume {
  id: number;
  title: string;
  lastUpdated: string;
  data: ResumeData;
}

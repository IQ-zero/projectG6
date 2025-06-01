import { useState, useCallback, useEffect } from 'react';
import { FileText, Plus, Trash2, Download, Eye, Save, CheckCircle, AlertCircle, Copy, ChevronRight, Star, User, Briefcase, GraduationCap, Layout } from 'lucide-react';
import { Resume, Education, Experience, Project } from '../types';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserContext';

const ResumeBuilder = () => {
  const { user } = useAuth();
  const { resumes: userResumes, addResume, updateResume, deleteResume } = useUserData();
  const [activeSection, setActiveSection] = useState('personal');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  // Personal info state for the current resume
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
  });

  // Template configurations
  const templates = {
    modern: {
      id: 'modern',
      name: 'Modern',
      description: 'Clean and contemporary design',
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#0f172a',
        background: '#ffffff',
        text: '#1e293b'
      },
      fonts: {
        heading: 'font-bold',
        body: 'font-normal'
      }
    },
    classic: {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional and professional',
      colors: {
        primary: '#1f2937',
        secondary: '#6b7280',
        accent: '#374151',
        background: '#ffffff',
        text: '#111827'
      },
      fonts: {
        heading: 'font-semibold',
        body: 'font-normal'
      }
    },
    creative: {
      id: 'creative',
      name: 'Creative',
      description: 'Bold and innovative design',
      colors: {
        primary: '#7c3aed',
        secondary: '#a78bfa',
        accent: '#5b21b6',
        background: '#faf5ff',
        text: '#581c87'
      },
      fonts: {
        heading: 'font-bold',
        body: 'font-normal'
      }
    },
    minimal: {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple and elegant',
      colors: {
        primary: '#000000',
        secondary: '#737373',
        accent: '#404040',
        background: '#ffffff',
        text: '#262626'
      },
      fonts: {
        heading: 'font-light',
        body: 'font-light'
      }
    },
    corporate: {
      id: 'corporate',
      name: 'Corporate',
      description: 'Professional business style',
      colors: {
        primary: '#1e40af',
        secondary: '#60a5fa',
        accent: '#1d4ed8',
        background: '#f8fafc',
        text: '#0f172a'
      },
      fonts: {
        heading: 'font-semibold',
        body: 'font-normal'
      }
    },
    tech: {
      id: 'tech',
      name: 'Tech',
      description: 'Modern tech industry focused',
      colors: {
        primary: '#059669',
        secondary: '#10b981',
        accent: '#047857',
        background: '#f0fdf4',
        text: '#064e3b'
      },
      fonts: {
        heading: 'font-bold',
        body: 'font-mono'
      }
    }
  } as const;

  // Load user's resumes from context or create default
  useEffect(() => {
    if (userResumes && userResumes.length > 0) {
      setResumes(userResumes);
      setCurrentResume(userResumes[0]);
      // Set personal info from user data
      setPersonalInfo({
        fullName: user?.name || '',
        title: '',
        email: user?.email || '',
        phone: user?.phoneNumber || '',
        location: user?.location || '',
        summary: user?.bio || '',
      });
    } else if (user) {
      // Create a default resume for new users
      const defaultResume: Resume = {
        id: Date.now().toString(),
        userId: user.id,
        title: `${user.name || 'My'} Resume`,
        education: [],
        experience: [],
        skills: [],
        projects: [],
        certifications: [],
        summary: user.bio || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setResumes([defaultResume]);
      setCurrentResume(defaultResume);
      setPersonalInfo({
        fullName: user.name || '',
        title: '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        location: user.location || '',
        summary: user.bio || '',
      });
    }
  }, [userResumes, user]);

  // Enhanced sections with role-specific customization
  const getSections = () => {
    const baseSections = [
      { id: 'personal', title: 'Personal Info', icon: User, description: 'Basic contact information' },
    ];

    // Role-specific section ordering and content
    if (user?.role === 'student') {
      baseSections.push(
        { id: 'education', title: 'Education', icon: GraduationCap, description: 'Academic background & achievements' },
        { id: 'projects', title: 'Projects', icon: FileText, description: 'Academic & personal projects' },
        { id: 'experience', title: 'Experience', icon: Briefcase, description: 'Internships & work experience' },
        { id: 'skills', title: 'Skills', icon: Star, description: 'Technical & soft skills' }
      );
    } else if (user?.role === 'employer') {
      baseSections.push(
        { id: 'experience', title: 'Experience', icon: Briefcase, description: 'Professional & leadership experience' },
        { id: 'education', title: 'Education', icon: GraduationCap, description: 'Educational background' },
        { id: 'skills', title: 'Skills', icon: Star, description: 'Management & technical skills' },
        { id: 'achievements', title: 'Achievements', icon: Star, description: 'Key accomplishments & awards' }
      );
    } else {
      // Default/admin sections
      baseSections.push(
        { id: 'experience', title: 'Experience', icon: Briefcase, description: 'Work history' },
        { id: 'education', title: 'Education', icon: GraduationCap, description: 'Academic background' },
        { id: 'skills', title: 'Skills', icon: Star, description: 'Technical & soft skills' },
        { id: 'projects', title: 'Projects', icon: FileText, description: 'Notable projects' }
      );
    }

    return baseSections;
  };

  const sections = getSections();

  // Progress calculation
  const calculateProgress = useCallback(() => {
    if (!currentResume) return 0;
    
    let completed = 0;
    let total = 0;
    
    // Personal Info (weighted more heavily as it's essential)
    if (personalInfo.fullName && personalInfo.email && personalInfo.phone) {
      completed += 2;
    } else if (personalInfo.fullName && personalInfo.email) {
      completed += 1;
    }
    total += 2;
    
    // Experience (critical for all roles)
    if (currentResume.experience && currentResume.experience.length > 0) {
      const hasCompleteExperience = currentResume.experience.some(exp => 
        exp.position && exp.company && exp.startDate
      );
      completed += hasCompleteExperience ? 2 : 1;
    }
    total += 2;
    
    // Education (important for students, less for experienced professionals)
    if (currentResume.education && currentResume.education.length > 0) {
      const hasCompleteEducation = currentResume.education.some(edu => 
        edu.institution && edu.degree
      );
      const weight = user?.role === 'student' ? 2 : 1;
      completed += hasCompleteEducation ? weight : Math.floor(weight / 2);
      total += weight;
    } else {
      total += user?.role === 'student' ? 2 : 1;
    }
    
    // Skills (essential for all)
    if (currentResume.skills && currentResume.skills.length >= 3) {
      completed += 2;
    } else if (currentResume.skills && currentResume.skills.length > 0) {
      completed += 1;
    }
    total += 2;
    
    // Projects (more important for students and tech roles)
    if (user?.role === 'student' || selectedTemplate === 'tech') {
      if (currentResume.projects && currentResume.projects.length > 0) {
        const hasCompleteProject = currentResume.projects.some(proj => 
          proj.title && proj.description
        );
        completed += hasCompleteProject ? 2 : 1;
      }
      total += 2;
    }
    
    // Template selection
    if (selectedTemplate) {
      completed += 1;
    }
    total += 1;
    
    // Summary/Objective (bonus points)
    if (personalInfo.summary && personalInfo.summary.length > 50) {
      completed += 1;
    }
    total += 1;
    
    return Math.min(Math.round((completed / total) * 100), 100);
  }, [currentResume, personalInfo, user?.role, selectedTemplate]);

  const handleNext = useCallback(() => {
    const currentIndex = sections.findIndex((section) => section.id === activeSection);
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].id);
    }
  }, [activeSection, sections]);

  const handlePrevious = useCallback(() => {
    const currentIndex = sections.findIndex((section) => section.id === activeSection);
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1].id);
    }
  }, [activeSection, sections]);

  const handleSaveAndFinish = useCallback(() => {
    if (!currentResume) return;
    
    // Validate required fields
    const errors: Record<string, string> = {};
    
    if (!personalInfo.fullName) {
      errors.fullName = 'Full name is required';
    }
    if (!personalInfo.email) {
      errors.email = 'Email is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setActiveSection('personal');
      return;
    }
    
    setValidationErrors({});
    
    // Update resume with personal info and save
    const updatedResume = {
      ...currentResume,
      title: personalInfo.fullName || 'Untitled Resume',
      summary: personalInfo.summary,
      updatedAt: new Date().toISOString(),
    };
    
    // Update or add resume to context
    if (userResumes?.some(r => r.id === currentResume.id)) {
      updateResume(currentResume.id, updatedResume);
    } else {
      addResume(updatedResume);
    }
    
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  }, [currentResume, personalInfo, userResumes, updateResume, addResume]);

  const handlePersonalInfoChange = useCallback((field: string, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear validation errors when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const addEducation = useCallback(() => {
    if (!currentResume) return;
    
    const newEducation: Education = {
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
    };
    
    setCurrentResume(prev => prev ? {
      ...prev,
      education: [...prev.education, newEducation],
      updatedAt: new Date().toISOString(),
    } : null);
  }, [currentResume]);

  const removeEducation = useCallback((index: number) => {
    if (!currentResume) return;
    
    setCurrentResume(prev => prev ? {
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
      updatedAt: new Date().toISOString(),
    } : null);
  }, [currentResume]);

  const updateEducation = useCallback((index: number, field: keyof Education, value: string) => {
    if (!currentResume) return;
    
    setCurrentResume(prev => {
      if (!prev) return null;
      const updatedEducation = [...prev.education];
      updatedEducation[index] = {
        ...updatedEducation[index],
        [field]: value,
      };
      return {
        ...prev,
        education: updatedEducation,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [currentResume]);

  const addExperience = useCallback(() => {
    if (!currentResume) return;
    
    const newExperience: Experience = {
      company: '',
      position: '',
      startDate: '',
      description: [],
    };
    
    setCurrentResume(prev => prev ? {
      ...prev,
      experience: [...prev.experience, newExperience],
      updatedAt: new Date().toISOString(),
    } : null);
  }, [currentResume]);

  const removeExperience = useCallback((index: number) => {
    if (!currentResume) return;
    
    setCurrentResume(prev => prev ? {
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
      updatedAt: new Date().toISOString(),
    } : null);
  }, [currentResume]);

  const updateExperience = useCallback((index: number, field: keyof Experience, value: string | string[]) => {
    if (!currentResume) return;
    
    setCurrentResume(prev => {
      if (!prev) return null;
      const updatedExperience = [...prev.experience];
      updatedExperience[index] = {
        ...updatedExperience[index],
        [field]: value,
      };
      return {
        ...prev,
        experience: updatedExperience,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [currentResume]);

  const addSkill = useCallback((skill: string) => {
    if (!currentResume) return;
    
    // Add empty skill that user can edit
    setCurrentResume(prev => prev ? {
      ...prev,
      skills: [...prev.skills, skill || 'New Skill'],
      updatedAt: new Date().toISOString(),
    } : null);
  }, [currentResume]);

  const updateSkill = useCallback((index: number, value: string) => {
    if (!currentResume) return;
    
    setCurrentResume(prev => {
      if (!prev) return null;
      const updatedSkills = [...prev.skills];
      updatedSkills[index] = value;
      return {
        ...prev,
        skills: updatedSkills,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [currentResume]);

  const removeSkill = useCallback((index: number) => {
    if (!currentResume) return;
    
    setCurrentResume(prev => prev ? {
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
      updatedAt: new Date().toISOString(),
    } : null);
  }, [currentResume]);

  const addProject = useCallback(() => {
    if (!currentResume) return;
    
    const newProject: Project = {
      title: '',
      description: '',
      technologies: [],
    };
    
    setCurrentResume(prev => prev ? {
      ...prev,
      projects: [...prev.projects, newProject],
      updatedAt: new Date().toISOString(),
    } : null);
  }, [currentResume]);

  const removeProject = useCallback((index: number) => {
    if (!currentResume) return;
    
    setCurrentResume(prev => prev ? {
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
      updatedAt: new Date().toISOString(),
    } : null);
  }, [currentResume]);

  const updateProject = useCallback((index: number, field: keyof Project, value: string | string[]) => {
    if (!currentResume) return;
    
    setCurrentResume(prev => {
      if (!prev) return null;
      const updatedProjects = [...prev.projects];
      updatedProjects[index] = {
        ...updatedProjects[index],
        [field]: value,
      };
      return {
        ...prev,
        projects: updatedProjects,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [currentResume]);

  // Auto-save functionality
  useEffect(() => {
    if (!currentResume || !user) return;
    
    const autoSaveTimer = setTimeout(() => {
      // Update resume with current personal info
      const updatedResume = {
        ...currentResume,
        summary: personalInfo.summary,
        updatedAt: new Date().toISOString(),
      };
      
      // Only auto-save if there are changes and basic info is present
      if (personalInfo.fullName || personalInfo.email) {
        if (userResumes?.some(r => r.id === currentResume.id)) {
          updateResume(currentResume.id, updatedResume);
        }
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
    
    return () => clearTimeout(autoSaveTimer);
  }, [currentResume, personalInfo, userResumes, updateResume, user]);

  const handlePreview = useCallback(() => {
    if (!currentResume) return;
    
    const selectedTemplateConfig = templates[selectedTemplate as keyof typeof templates] || templates.modern;
    
    // Create a formatted preview of the resume
    const resumeData = {
      personalInfo,
      education: currentResume.education,
      experience: currentResume.experience,
      skills: currentResume.skills,
      projects: currentResume.projects,
      summary: personalInfo.summary
    };
    
    // Open a new window with the resume preview
    const previewWindow = window.open('', '_blank', 'width=800,height=1000');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${personalInfo.fullName || 'Resume'} - Preview</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: ${selectedTemplateConfig.colors.text};
              background: ${selectedTemplateConfig.colors.background};
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
            }
            
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding: 30px 0;
              border-bottom: 2px solid ${selectedTemplateConfig.colors.primary};
              background: ${selectedTemplateConfig.colors.background};
            }
            
            .name {
              font-size: 2.5rem;
              font-weight: bold;
              color: ${selectedTemplateConfig.colors.primary};
              margin-bottom: 8px;
              ${selectedTemplateConfig.fonts.heading === 'font-light' ? 'font-weight: 300;' : ''}
              ${selectedTemplateConfig.fonts.heading === 'font-bold' ? 'font-weight: 700;' : ''}
              ${selectedTemplateConfig.fonts.heading === 'font-semibold' ? 'font-weight: 600;' : ''}
            }
            
            .title {
              font-size: 1.2rem;
              color: ${selectedTemplateConfig.colors.secondary};
              margin-bottom: 10px;
              font-style: italic;
            }
            
            .contact {
              font-size: 1rem;
              color: ${selectedTemplateConfig.colors.secondary};
              margin-top: 10px;
            }
            
            .section {
              margin-bottom: 35px;
              page-break-inside: avoid;
            }
            
            .section-title {
              font-size: 1.4rem;
              font-weight: ${selectedTemplateConfig.fonts.heading === 'font-bold' ? '700' : '600'};
              color: ${selectedTemplateConfig.colors.primary};
              margin-bottom: 20px;
              padding-bottom: 8px;
              border-bottom: 1px solid ${selectedTemplateConfig.colors.primary};
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .summary {
              font-size: 1rem;
              line-height: 1.7;
              color: ${selectedTemplateConfig.colors.text};
              margin-bottom: 10px;
              text-align: justify;
            }
            
            .item {
              margin-bottom: 25px;
              padding-left: 15px;
              border-left: 3px solid ${selectedTemplateConfig.colors.accent};
            }
            
            .item-header {
              font-size: 1.1rem;
              font-weight: 600;
              color: ${selectedTemplateConfig.colors.accent};
              margin-bottom: 5px;
            }
            
            .item-details {
              font-size: 0.95rem;
              color: ${selectedTemplateConfig.colors.secondary};
              margin-bottom: 10px;
              font-style: italic;
            }
            
            .item ul {
              margin-left: 20px;
              margin-top: 8px;
            }
            
            .item li {
              margin-bottom: 5px;
              color: ${selectedTemplateConfig.colors.text};
            }
            
            .skills {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
              gap: 10px;
              margin-top: 10px;
            }
            
            .skill {
              background: ${selectedTemplateConfig.colors.primary}15;
              padding: 8px 12px;
              border-radius: 20px;
              font-size: 0.9rem;
              color: ${selectedTemplateConfig.colors.primary};
              text-align: center;
              font-weight: 500;
            }
            
            .technologies {
              margin-top: 8px;
              font-size: 0.9rem;
              color: ${selectedTemplateConfig.colors.secondary};
            }
            
            @media print {
              body {
                margin: 0;
                padding: 20px;
                font-size: 12px;
              }
              .header {
                margin-bottom: 25px;
                padding: 20px 0;
              }
              .name {
                font-size: 2rem;
              }
              .section {
                margin-bottom: 20px;
              }
              .section-title {
                font-size: 1.2rem;
              }
            }
            
            /* Template-specific styles */
            ${selectedTemplate === 'creative' ? `
              .header {
                background: linear-gradient(135deg, ${selectedTemplateConfig.colors.primary}, ${selectedTemplateConfig.colors.secondary});
                color: white;
                border-radius: 15px;
                border: none;
              }
              .header .name, .header .title, .header .contact {
                color: white;
              }
            ` : ''}
            
            ${selectedTemplate === 'minimal' ? `
              .header {
                border-bottom: 1px solid #e5e5e5;
              }
              .section-title {
                border-bottom: none;
                font-weight: 300;
                font-size: 1.2rem;
              }
              .item {
                border-left: none;
                padding-left: 0;
              }
            ` : ''}
            
            ${selectedTemplate === 'corporate' ? `
              .header {
                background: ${selectedTemplateConfig.colors.background};
                border: 2px solid ${selectedTemplateConfig.colors.primary};
                border-radius: 10px;
              }
              .section {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
            ` : ''}
            
            ${selectedTemplate === 'tech' ? `
              body {
                font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
              }
              .section-title {
                background: ${selectedTemplateConfig.colors.primary};
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                border: none;
              }
            ` : ''}
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="name">${personalInfo.fullName || 'Your Name'}</h1>
            ${personalInfo.title ? `<div class="title">${personalInfo.title}</div>` : ''}
            <div class="contact">
              ${personalInfo.email ? `Email: ${personalInfo.email}` : ''}
              ${personalInfo.phone ? ` | Phone: ${personalInfo.phone}` : ''}
              ${personalInfo.location ? ` | Location: ${personalInfo.location}` : ''}
            </div>
          </div>
          
          ${personalInfo.summary ? `
            <div class="section">
              <h2 class="section-title">Professional Summary</h2>
              <div class="summary">${personalInfo.summary}</div>
            </div>
          ` : ''}
          
          ${resumeData.education.length > 0 ? `
            <div class="section">
              <h2 class="section-title">Education</h2>
              ${resumeData.education.map(edu => `
                <div class="item">
                  <div class="item-header">${edu.degree} ${edu.field ? `in ${edu.field}` : ''}</div>
                  <div class="item-details">
                    ${edu.institution} | ${edu.startDate}${edu.endDate ? ` - ${edu.endDate}` : ' - Present'}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${resumeData.experience.length > 0 ? `
            <div class="section">
              <h2 class="section-title">Work Experience</h2>
              ${resumeData.experience.map(exp => `
                <div class="item">
                  <div class="item-header">${exp.position}</div>
                  <div class="item-details">
                    ${exp.company} | ${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ' - Present'}
                  </div>
                  ${exp.description.length > 0 ? `
                    <ul style="margin: 10px 0;">
                      ${exp.description.map(desc => `<li>${desc}</li>`).join('')}
                    </ul>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${resumeData.skills.length > 0 ? `
            <div class="section">
              <h2 class="section-title">Skills</h2>
              <div class="skills">
                ${resumeData.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          
          ${resumeData.projects.length > 0 ? `
            <div class="section">
              <h2 class="section-title">Projects</h2>
              ${resumeData.projects.map(project => `
                <div class="item">
                  <div class="item-header">${project.title}</div>
                  <div>${project.description}</div>
                  ${project.technologies && project.technologies.length > 0 ? `
                    <div class="item-details">Technologies: ${project.technologies.join(', ')}</div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          <script>
            window.print();
          </script>
        </body>
        </html>
      `);
      previewWindow.document.close();
    }
  }, [currentResume, personalInfo]);

  const handleTemplateSelect = useCallback(() => {
    setShowTemplateModal(true);
  }, []);

  const selectTemplate = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
    setShowTemplateModal(false);
    
    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    
    // Update current resume with template selection
    if (currentResume) {
      const updatedResume = {
        ...currentResume,
        template: templateId
      };
      setCurrentResume(updatedResume);
      updateResume(currentResume.id, updatedResume);
    }
  }, [currentResume, updateResume]);

  const handleDownloadPDF = useCallback(() => {
    if (!currentResume) return;
    
    const selectedTemplateConfig = templates[selectedTemplate as keyof typeof templates] || templates.modern;
    
    const resumeData = {
      personalInfo,
      education: currentResume.education,
      experience: currentResume.experience,
      skills: currentResume.skills,
      projects: currentResume.projects,
      summary: personalInfo.summary
    };
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${personalInfo.fullName || 'Resume'} - ${selectedTemplateConfig.name} Template</title>
          <meta charset="UTF-8">
          <style>
            @media print {
              body { margin: 0; }
              @page { 
                size: A4; 
                margin: 0.75in; 
              }
              .no-print { display: none; }
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: ${selectedTemplateConfig.fonts.body === 'font-mono' ? 'Monaco, Consolas, monospace' : 
                           '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'};
              line-height: 1.5;
              color: ${selectedTemplateConfig.colors.text};
              font-size: 11pt;
              background: ${selectedTemplateConfig.colors.background};
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 8.5in;
              margin: 0 auto;
              background: ${selectedTemplateConfig.colors.background};
            }
            .header {
              text-align: center;
              padding-bottom: 20pt;
              margin-bottom: 25pt;
              ${selectedTemplate === 'creative' ? 
                `background: linear-gradient(135deg, ${selectedTemplateConfig.colors.primary}, ${selectedTemplateConfig.colors.accent});
                 color: white;
                 padding: 30pt 20pt;
                 margin: -20px -20px 25pt -20px;
                 border-radius: 0 0 15pt 15pt;` :
                selectedTemplate === 'minimal' ?
                `border-bottom: 1pt solid ${selectedTemplateConfig.colors.primary};` :
                `border-bottom: 3pt solid ${selectedTemplateConfig.colors.primary};`
              }
            }
            .name {
              font-size: ${selectedTemplate === 'creative' ? '28pt' : '24pt'};
              font-weight: ${selectedTemplateConfig.fonts.heading === 'font-light' ? '300' : 
                           selectedTemplateConfig.fonts.heading === 'font-bold' ? '700' : '600'};
              color: ${selectedTemplate === 'creative' ? 'white' : selectedTemplateConfig.colors.primary};
              margin: 0 0 8pt 0;
              ${selectedTemplate === 'tech' ? 'font-family: Monaco, Consolas, monospace;' : ''}
            }
            .title {
              font-size: 14pt;
              color: ${selectedTemplate === 'creative' ? 'rgba(255,255,255,0.9)' : selectedTemplateConfig.colors.secondary};
              margin: 0 0 15pt 0;
              font-weight: normal;
            }
            .contact-info {
              font-size: 10pt;
              color: ${selectedTemplate === 'creative' ? 'rgba(255,255,255,0.8)' : selectedTemplateConfig.colors.secondary};
              line-height: 1.4;
            }
            .section {
              margin-bottom: 25pt;
              ${selectedTemplate === 'corporate' ? 
                `background: ${selectedTemplateConfig.colors.background};
                 border: 1pt solid ${selectedTemplateConfig.colors.secondary}30;
                 padding: 15pt;
                 border-radius: 8pt;
                 box-shadow: 0 2pt 4pt rgba(0,0,0,0.1);` : ''
              }
            }
            .section-title {
              font-size: 14pt;
              font-weight: ${selectedTemplateConfig.fonts.heading === 'font-light' ? '400' : '600'};
              color: ${selectedTemplateConfig.colors.primary};
              margin: 0 0 12pt 0;
              padding-bottom: 6pt;
              border-bottom: ${selectedTemplate === 'minimal' ? '0.5pt' : '1pt'} solid ${selectedTemplateConfig.colors.primary};
              ${selectedTemplate === 'tech' ? 'font-family: Monaco, Consolas, monospace;' : ''}
            }
            .entry {
              margin-bottom: 15pt;
              ${selectedTemplate === 'minimal' ? 'padding-left: 0;' : 'padding-left: 15pt;'}
              ${selectedTemplate === 'classic' ? 'border-left: 2pt solid ' + selectedTemplateConfig.colors.accent + ';' : ''}
            }
            .entry-title {
              font-size: 12pt;
              font-weight: 600;
              color: ${selectedTemplateConfig.colors.accent};
              margin: 0 0 4pt 0;
            }
            .entry-subtitle {
              font-size: 11pt;
              color: ${selectedTemplateConfig.colors.secondary};
              margin: 0 0 8pt 0;
              font-style: italic;
            }
            .entry-description {
              font-size: 10pt;
              color: ${selectedTemplateConfig.colors.text};
              line-height: 1.4;
              margin: 0;
            }
            .skills-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(150pt, 1fr));
              gap: 8pt;
              margin-top: 10pt;
            }
            .skill-item {
              background: ${selectedTemplateConfig.colors.primary}15;
              color: ${selectedTemplateConfig.colors.accent};
              padding: 6pt 12pt;
              border-radius: 15pt;
              font-size: 10pt;
              text-align: center;
              border: 1pt solid ${selectedTemplateConfig.colors.primary}30;
            }
            .summary {
              font-size: 11pt;
              line-height: 1.6;
              color: ${selectedTemplateConfig.colors.text};
              background: ${selectedTemplateConfig.colors.primary}08;
              padding: 15pt;
              border-radius: 8pt;
              margin-bottom: 20pt;
              ${selectedTemplate === 'creative' ? 'border-left: 4pt solid ' + selectedTemplateConfig.colors.accent + ';' : ''}
            }
            .date-range {
              font-size: 9pt;
              color: ${selectedTemplateConfig.colors.secondary};
              float: right;
              ${selectedTemplate === 'tech' ? 'font-family: Monaco, Consolas, monospace;' : ''}
            }
            .download-info {
              position: fixed;
              top: 10px;
              right: 10px;
              background: ${selectedTemplateConfig.colors.primary};
              color: white;
              padding: 10px;
              border-radius: 5px;
              font-size: 10pt;
              z-index: 1000;
            }
          </style>
        </head>
        <body>
          <div class="download-info no-print">
            <strong>Ready to print!</strong><br>
            Use Ctrl+P or Cmd+P to save as PDF
          </div>
          <div class="container">
            <div class="header">
              <h1 class="name">${personalInfo.fullName || 'Your Name'}</h1>
              <div class="title">${personalInfo.title || 'Professional Title'}</div>
              <div class="contact-info">
                ${personalInfo.email ? personalInfo.email : ''} 
                ${personalInfo.phone ? ' • ' + personalInfo.phone : ''} 
                ${personalInfo.location ? ' • ' + personalInfo.location : ''}
              </div>
            </div>
            
            ${personalInfo.summary ? `
            <div class="summary">
              <strong>Professional Summary</strong><br>
              ${personalInfo.summary}
            </div>
            ` : ''}
            
            ${resumeData.experience && resumeData.experience.length > 0 ? `
            <div class="section">
              <h2 class="section-title">Professional Experience</h2>
              ${resumeData.experience.map(exp => `
                <div class="entry">
                  <div class="date-range">${exp.startDate} - ${exp.endDate || 'Present'}</div>
                  <div class="entry-title">${exp.position}</div>
                  <div class="entry-subtitle">${exp.company}</div>
                  ${exp.description ? `<div class="entry-description">${exp.description}</div>` : ''}
                </div>
              `).join('')}
            </div>
            ` : ''}
            
            ${resumeData.education && resumeData.education.length > 0 ? `
            <div class="section">
              <h2 class="section-title">Education</h2>
              ${resumeData.education.map(edu => `
                <div class="entry">
                  <div class="date-range">${edu.startDate} - ${edu.endDate || 'Present'}</div>
                  <div class="entry-title">${edu.degree} ${edu.field ? 'in ' + edu.field : ''}</div>
                  <div class="entry-subtitle">${edu.institution}</div>
                </div>
              `).join('')}
            </div>
            ` : ''}
            
            ${resumeData.skills && resumeData.skills.length > 0 ? `
            <div class="section">
              <h2 class="section-title">Skills & Expertise</h2>
              <div class="skills-grid">
                ${resumeData.skills.map(skill => `
                  <div class="skill-item">${skill}</div>
                `).join('')}
              </div>
            </div>
            ` : ''}
            
            ${resumeData.projects && resumeData.projects.length > 0 ? `
            <div class="section">
              <h2 class="section-title">Notable Projects</h2>
              ${resumeData.projects.map(project => `
                <div class="entry">
                  <div class="entry-title">${project.title}</div>
                  ${project.technologies ? `<div class="entry-subtitle">Technologies: ${project.technologies}</div>` : ''}
                  ${project.description ? `<div class="entry-description">${project.description}</div>` : ''}
                  ${project.link ? `<div class="entry-description"><strong>URL:</strong> ${project.link}</div>` : ''}
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      
      // Auto-trigger print dialog after a short delay
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    }
  }, [currentResume, personalInfo, selectedTemplate, templates]);

  const createNewResume = useCallback(() => {
    const newResume: Resume = {
      id: Date.now().toString(),
      userId: user?.id || '',
      title: 'Untitled Resume',
      education: [],
      experience: [],
      skills: [],
      projects: [],
      certifications: [],
      summary: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setResumes((prev) => [...prev, newResume]);
    setCurrentResume(newResume);
    setActiveSection('personal');
  }, [user]);

  const duplicateResume = useCallback((resume: Resume) => {
    const duplicatedResume: Resume = {
      ...resume,
      id: Date.now().toString(),
      title: `${resume.title} (Copy)`,
      updatedAt: new Date().toISOString(),
    };
    setResumes((prev) => [...prev, duplicatedResume]);
    setCurrentResume(duplicatedResume);
  }, []);

  if (!currentResume) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>;
  }

  const progress = calculateProgress();
  const currentSectionIndex = sections.findIndex(s => s.id === activeSection);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
            <p className="mt-2 text-gray-600">Create and manage your professional resumes</p>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Profile Completion</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              className="btn btn-outline text-sm py-1.5" 
              onClick={handleTemplateSelect}
              aria-label="Choose template"
            >
              <Layout size={16} className="mr-2" />
              Templates
            </button>
            <button 
              className="btn btn-outline text-sm py-1.5" 
              onClick={handlePreview} 
              aria-label="Preview resume"
            >
              <Eye size={16} className="mr-2" />
              Preview
            </button>
          </div>
        </div>
        
        {showSuccessMessage && (
          <div className="mt-4 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg flex items-center" role="alert" aria-live="assertive">
            <CheckCircle size={20} className="mr-2" />
            Resume saved successfully!
          </div>
        )}
        
        {Object.keys(validationErrors).length > 0 && (
          <div className="mt-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg" role="alert">
            <div className="flex items-center mb-2">
              <AlertCircle size={20} className="mr-2" />
              Please fix the following errors:
            </div>
            <ul className="list-disc list-inside text-sm">
              {Object.entries(validationErrors).map(([field, error]) => (
                <li key={field}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Saved Resumes */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-semibold mb-4">My Resumes ({resumes.length})</h2>
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`p-4 border rounded-lg transition-all cursor-pointer ${
                    currentResume.id === resume.id
                      ? 'border-primary-300 bg-primary-50 shadow-sm'
                      : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
                  }`}
                  onClick={() => setCurrentResume(resume)}
                  aria-label={`Select resume: ${resume.title}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center flex-1">
                      <FileText size={20} className="text-primary-600 mr-3 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium truncate">{resume.title}</h3>
                        <p className="text-sm text-gray-500">Updated: {new Date(resume.updatedAt).toLocaleDateString()}</p>
                        <div className="flex items-center mt-2">
                          <div className="flex-1 mr-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-500">Completion</span>
                              <span className={`text-xs font-medium ${
                                calculateProgress() >= 80 ? 'text-green-600' :
                                calculateProgress() >= 50 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {calculateProgress()}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  calculateProgress() >= 80 ? 'bg-green-500' :
                                  calculateProgress() >= 50 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${calculateProgress()}%` }}
                              />
                            </div>
                            {calculateProgress() < 100 && (
                              <div className="text-xs text-gray-400 mt-1">
                                {calculateProgress() < 50 ? 'Getting started...' :
                                 calculateProgress() < 80 ? 'Almost there!' :
                                 'Nearly complete!'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <button 
                        className="p-1 text-gray-400 hover:text-primary-600" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview();
                        }}
                        aria-label="Preview resume"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        className="p-1 text-gray-400 hover:text-primary-600" 
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateResume(resume);
                        }}
                        aria-label="Duplicate resume"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (resumes.length > 1) {
                            setResumes((prev) => prev.filter((r) => r.id !== resume.id));
                            if (currentResume.id === resume.id) {
                              setCurrentResume(resumes.find(r => r.id !== resume.id) || resumes[0]);
                            }
                            deleteResume && deleteResume(resume.id.toString());
                          }
                        }}
                        aria-label="Delete resume"
                        disabled={resumes.length <= 1}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors flex items-center justify-center"
                onClick={createNewResume}
                aria-label="Create new resume"
              >
                <Plus size={20} className="mr-2" />
                Create New Resume
              </button>
            </div>
          </div>
        </div>

        {/* Resume Editor */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Resume Editor</h2>
              <div className="flex space-x-3">
                <button 
                  className="btn btn-outline text-sm py-1.5" 
                  onClick={handlePreview} 
                  aria-label="Preview resume"
                >
                  <Eye size={16} className="mr-2" />
                  Preview
                </button>
                <button 
                  className="btn btn-primary text-sm py-1.5" 
                  onClick={handleDownloadPDF}
                  aria-label="Download resume as PDF"
                >
                  <Download size={16} className="mr-2" />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Section Navigation with Progress */}
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
              {sections.map((section, index) => {
                const isActive = activeSection === section.id;
                const isCompleted = index < currentSectionIndex || 
                  (section.id === 'personal' && personalInfo.fullName && personalInfo.email) ||
                  (section.id === 'education' && currentResume.education && currentResume.education.length > 0) ||
                  (section.id === 'experience' && currentResume.experience && currentResume.experience.length > 0) ||
                  (section.id === 'skills' && currentResume.skills && currentResume.skills.length > 0) ||
                  (section.id === 'projects' && currentResume.projects && currentResume.projects.length > 0);
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    aria-label={`Navigate to section: ${section.title}`}
                  >
                    <section.icon size={16} className={`mr-2 ${isCompleted ? 'text-green-600' : ''}`} />
                    {section.title}
                    {isCompleted && <CheckCircle size={14} className="ml-2 text-green-600" />}
                  </button>
                );
              })}
            </div>

            {/* Section Content */}
            <div className="space-y-6 min-h-[400px]">
              {/* Personal Info */}
              {activeSection === 'personal' && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
                    <p className="text-sm text-gray-600">Add your basic contact information and professional summary.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        className={`input ${validationErrors.fullName ? 'border-red-300 focus:border-red-500' : ''}`}
                        value={personalInfo.fullName || ''}
                        onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                        placeholder="John Doe"
                        aria-label="Full name"
                      />
                      {validationErrors.fullName && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.fullName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Professional Title
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={personalInfo.title || ''}
                        onChange={(e) => handlePersonalInfoChange('title', e.target.value)}
                        placeholder="Software Engineer"
                        aria-label="Professional title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        className={`input ${validationErrors.email ? 'border-red-300 focus:border-red-500' : ''}`}
                        value={personalInfo.email || ''}
                        onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                        placeholder="john@example.com"
                        aria-label="Email"
                      />
                      {validationErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        className="input"
                        value={personalInfo.phone || ''}
                        onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                        placeholder="(123) 456-7890"
                        aria-label="Phone number"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        className="input"
                        value={personalInfo.location || ''}
                        onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                        placeholder="City, State, Country"
                        aria-label="Location"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Professional Summary
                    </label>
                    <textarea
                      className="input min-h-[120px]"
                      value={personalInfo.summary || ''}
                      onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                      placeholder="Write a brief professional summary that highlights your key skills, experience, and career objectives..."
                      aria-label="Professional summary"
                    ></textarea>
                    <p className="mt-1 text-xs text-gray-500">
                      Tip: Keep it concise (2-3 sentences) and focus on your unique value proposition.
                    </p>
                  </div>
                </div>
              )}

              {/* Education */}
              {activeSection === 'education' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Education History</h3>
                      <p className="text-sm text-gray-600">Add your educational background and achievements.</p>
                    </div>
                    <button
                      className="btn btn-outline text-sm py-1.5"
                      onClick={addEducation}
                      aria-label="Add education entry"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Education
                    </button>
                  </div>
                  
                  {currentResume.education && currentResume.education.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <GraduationCap size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>No education entries yet. Click "Add Education" to get started.</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {(currentResume.education || []).map((edu, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900">Education #{index + 1}</h4>
                          <button
                            className="text-gray-400 hover:text-red-600"
                            onClick={() => removeEducation(index)}
                            aria-label={`Remove education entry ${index + 1}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            className="input"
                            placeholder="Institution Name"
                            value={edu.institution}
                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                            aria-label={`Education institution ${index + 1}`}
                          />
                          <input
                            type="text"
                            className="input"
                            placeholder="Degree & Major"
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            aria-label={`Education degree ${index + 1}`}
                          />
                          <input
                            type="text"
                            className="input"
                            placeholder="Field of Study"
                            value={edu.field}
                            onChange={(e) => updateEducation(index, 'field', e.target.value)}
                            aria-label={`Education field ${index + 1}`}
                          />
                          <input
                            type="text"
                            className="input"
                            placeholder="Start Date (e.g., Sep 2020)"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                            aria-label={`Education start date ${index + 1}`}
                          />
                          <input
                            type="text"
                            className="input"
                            placeholder="End Date (e.g., May 2024 or Expected)"
                            value={edu.endDate || ''}
                            onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                            aria-label={`Education end date ${index + 1}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {activeSection === 'experience' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
                      <p className="text-sm text-gray-600">Add your professional work history and achievements.</p>
                    </div>
                    <button
                      className="btn btn-outline text-sm py-1.5"
                      onClick={addExperience}
                      aria-label="Add experience entry"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Experience
                    </button>
                  </div>
                  
                  {currentResume.experience && currentResume.experience.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>No work experience yet. Click "Add Experience" to get started.</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {(currentResume.experience || []).map((exp, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium text-gray-900">Experience #{index + 1}</h4>
                          <button 
                            className="text-gray-400 hover:text-red-600"
                            onClick={() => removeExperience(index)}
                            aria-label={`Remove experience entry ${index + 1}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <input
                            type="text"
                            className="input"
                            placeholder="Job Title"
                            value={exp.position}
                            onChange={(e) => updateExperience(index, 'position', e.target.value)}
                            aria-label={`Experience job title ${index + 1}`}
                          />
                          <input
                            type="text"
                            className="input"
                            placeholder="Company Name"
                            value={exp.company}
                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                            aria-label={`Experience company name ${index + 1}`}
                          />
                          <input
                            type="text"
                            className="input"
                            placeholder="Start Date"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                            aria-label={`Experience start date ${index + 1}`}
                          />
                          <input
                            type="text"
                            className="input"
                            placeholder="End Date (or 'Present')"
                            value={exp.endDate || ''}
                            onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                            aria-label={`Experience end date ${index + 1}`}
                          />
                        </div>
                        
                        <textarea
                          className="input min-h-[120px] mb-4"
                          placeholder="Describe your responsibilities, achievements, and impact. Use bullet points and quantify results when possible..."
                          value={exp.description.join('\n')}
                          onChange={(e) => updateExperience(index, 'description', e.target.value.split('\n'))}
                          aria-label={`Experience description ${index + 1}`}
                        ></textarea>
                        
                        <p className="text-xs text-gray-500">
                          Tip: Use action verbs and quantify your achievements (e.g., "Increased sales by 25%")
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {activeSection === 'skills' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Skills</h3>
                      <p className="text-sm text-gray-600">Add your technical and soft skills.</p>
                    </div>
                    <button
                      className="btn btn-outline text-sm py-1.5"
                      onClick={() => addSkill('')}
                      aria-label="Add skill"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Skill
                    </button>
                  </div>
                  
                  {currentResume.skills && currentResume.skills.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Star size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>No skills added yet. Click "Add Skill" to showcase your abilities.</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(currentResume.skills || []).map((skill, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-900">Skill #{index + 1}</h4>
                          <button
                            className="text-gray-400 hover:text-red-600"
                            onClick={() => removeSkill(index)}
                            aria-label={`Remove skill ${index + 1}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <input
                          type="text"
                          className="input"
                          placeholder="Skill Name (e.g., JavaScript, Project Management)"
                          value={skill}
                          onChange={(e) => updateSkill(index, e.target.value)}
                          aria-label={`Skill name ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {activeSection === 'projects' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Projects</h3>
                      <p className="text-sm text-gray-600">Showcase your notable projects and achievements.</p>
                    </div>
                    <button
                      className="btn btn-outline text-sm py-1.5"
                      onClick={addProject}
                      aria-label="Add project"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Project
                    </button>
                  </div>
                  
                  {currentResume.projects && currentResume.projects.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>No projects added yet. Click "Add Project" to showcase your work.</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {(currentResume.projects || []).map((project, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium text-gray-900">Project #{index + 1}</h4>
                          <button
                            className="text-gray-400 hover:text-red-600"
                            onClick={() => removeProject(index)}
                            aria-label={`Remove project ${index + 1}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          <input
                            type="text"
                            className="input"
                            placeholder="Project Title"
                            value={project.title}
                            onChange={(e) => updateProject(index, 'title', e.target.value)}
                            aria-label={`Project title ${index + 1}`}
                          />
                          
                          <textarea
                            className="input min-h-[100px]"
                            placeholder="Describe the project, your role, technologies used, and impact..."
                            value={project.description}
                            onChange={(e) => updateProject(index, 'description', e.target.value)}
                            aria-label={`Project description ${index + 1}`}
                          ></textarea>
                          
                          <input
                            type="text"
                            className="input"
                            placeholder="Technologies Used (comma-separated)"
                            value={project.technologies?.join(', ') || ''}
                            onChange={(e) => updateProject(index, 'technologies', e.target.value.split(',').map(tech => tech.trim()).filter(Boolean))}
                            aria-label={`Project technologies ${index + 1}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
                <button 
                  className={`btn btn-outline ${currentSectionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handlePrevious}
                  disabled={currentSectionIndex === 0}
                  aria-label="Go to previous section"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{currentSectionIndex + 1} of {sections.length}</span>
                  <div className="flex space-x-1">
                    {sections.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index <= currentSectionIndex ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                {activeSection !== 'projects' ? (
                  <button 
                    className="btn btn-primary flex items-center" 
                    onClick={handleNext} 
                    aria-label="Save and go to next section"
                  >
                    Save & Next
                    <ChevronRight size={16} className="ml-1" />
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary flex items-center" 
                    onClick={handleSaveAndFinish} 
                    aria-label="Save and finish resume"
                  >
                    <Save size={16} className="mr-2" />
                    Save & Finish
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close template modal"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 mt-2">Select a professional template for your resume</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Template Options with Previews */}
                {Object.entries(templates).map(([templateId, template]) => (
                  <div
                    key={templateId}
                    className={`border-2 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer ${
                      selectedTemplate === templateId 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => selectTemplate(templateId)}
                  >
                    {/* Template Preview */}
                    <div 
                      className="aspect-[3/4] rounded-md mb-4 p-4 text-xs overflow-hidden relative"
                      style={{ 
                        backgroundColor: template.colors.background,
                        color: template.colors.text,
                        border: `1px solid ${template.colors.secondary}20`
                      }}
                    >
                      {/* Header Section */}
                      <div 
                        className="mb-2 p-2 rounded"
                        style={{ 
                          backgroundColor: templateId === 'creative' 
                            ? `linear-gradient(135deg, ${template.colors.primary}, ${template.colors.accent})` 
                            : template.colors.primary,
                          color: templateId === 'creative' || templateId === 'tech' 
                            ? '#ffffff' 
                            : template.colors.background
                        }}
                      >
                        <div className={`text-sm ${template.fonts.heading} truncate`}>John Doe</div>
                        <div className="text-xs opacity-80 truncate">Software Developer</div>
                      </div>
                      
                      {/* Content Sections */}
                      <div className="space-y-2">
                        <div>
                          <div 
                            className={`text-xs ${template.fonts.heading} mb-1 border-b`}
                            style={{ 
                              color: template.colors.primary,
                              borderColor: `${template.colors.secondary}40`
                            }}
                          >
                            Experience
                          </div>
                          <div className="text-xs opacity-70 truncate">Senior Developer</div>
                          <div className="text-xs opacity-50 truncate">Tech Company</div>
                        </div>
                        
                        <div>
                          <div 
                            className={`text-xs ${template.fonts.heading} mb-1 border-b`}
                            style={{ 
                              color: template.colors.primary,
                              borderColor: `${template.colors.secondary}40`
                            }}
                          >
                            Skills
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {['React', 'Node.js', 'Python'].map((skill, index) => (
                              <span 
                                key={index}
                                className="text-xs px-1 py-0.5 rounded"
                                style={{ 
                                  backgroundColor: `${template.colors.secondary}20`,
                                  color: template.colors.accent
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Selected indicator */}
                      {selectedTemplate === templateId && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle size={16} className="text-blue-500 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900 flex items-center justify-center gap-2">
                        {template.name}
                        {selectedTemplate === templateId && <Star size={16} className="text-yellow-500 fill-current" />}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      
                      {/* Color palette preview */}
                      <div className="flex justify-center gap-1 mt-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: template.colors.primary }}
                          title="Primary Color"
                        />
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: template.colors.secondary }}
                          title="Secondary Color"
                        />
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: template.colors.accent }}
                          title="Accent Color"
                        />
                      </div>
                      
                      <button
                        className={`w-full mt-3 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                          selectedTemplate === templateId
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectTemplate(templateId);
                        }}
                      >
                        {selectedTemplate === templateId ? 'Selected' : 'Select Template'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;
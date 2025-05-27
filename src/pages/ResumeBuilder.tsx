import { useState, useCallback } from 'react';
import { FileText, Plus, Trash2, Download, Eye, Edit2 } from 'lucide-react';
import { Resume, ResumeData } from '../types/resume';

const ResumeBuilder = () => {
  const [activeSection, setActiveSection] = useState('personal');
  const [resumes, setResumes] = useState<Resume[]>([
    {
      id: 1,
      title: 'Software Engineer',
      lastUpdated: '2 days ago',
      data: {
        personal: {},
        projects: [],
        skills: [],
        experience: [],
        education: [],
      },
    },
  ]);
  const [currentResume, setCurrentResume] = useState<Resume>(resumes[0]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const sections = [
    { id: 'personal', title: 'Personal Info' },
    { id: 'education', title: 'Education' },
    { id: 'experience', title: 'Experience' },
    { id: 'skills', title: 'Skills' },
    { id: 'projects', title: 'Projects' },
  ];

  const handleNext = useCallback(() => {
    const currentIndex = sections.findIndex((section) => section.id === activeSection);
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].id);
    }
  }, [activeSection, sections]);

  const handleSaveAndFinish = useCallback(() => {
    const updatedResumes = resumes.map((resume) =>
      resume.id === currentResume.id
        ? { ...resume, title: currentResume.data.personal?.fullName || 'Untitled Resume', lastUpdated: 'Just now' }
        : resume
    );
    setResumes(updatedResumes);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000); // Hide message after 3 seconds
  }, [resumes, currentResume]);

  const handleInputChange = useCallback((section: keyof ResumeData, field: string, value: string) => {
    setCurrentResume((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [section]: {
          ...prev.data[section],
          [field]: value,
        },
      },
    }));
  }, []);

  const addItem = useCallback((section: keyof ResumeData, newItem: any) => {
    setCurrentResume((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [section]: [...(prev.data[section] as any[]), newItem],
      },
    }));
  }, []);

  const removeItem = useCallback((section: keyof ResumeData, index: number) => {
    setCurrentResume((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [section]: (prev.data[section] as any[]).filter((_, i) => i !== index),
      },
    }));
  }, []);

  const handlePreview = useCallback(() => {
    alert('Preview functionality is not implemented yet.');
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
        <p className="mt-2 text-gray-600">Create and manage your professional resumes</p>
        {showSuccessMessage && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg" role="alert" aria-live="assertive">
            Resume saved successfully!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Saved Resumes */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-semibold mb-4">My Resumes</h2>
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    currentResume.id === resume.id
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                  onClick={() => setCurrentResume(resume)}
                  aria-label={`Select resume: ${resume.title}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <FileText size={20} className="text-primary-600 mr-3" />
                      <div>
                        <h3 className="font-medium">{resume.title}</h3>
                        <p className="text-sm text-gray-500">Last updated: {resume.lastUpdated}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-primary-600" aria-label="Preview resume">
                        <Eye size={16} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-primary-600" aria-label="Edit resume">
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-error-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResumes((prev) => prev.filter((r) => r.id !== resume.id));
                        }}
                        aria-label="Delete resume"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors flex items-center justify-center"
                onClick={() => {
                  const newResume: Resume = {
                    id: Date.now(),
                    title: 'Untitled Resume',
                    lastUpdated: 'Just now',
                    data: { personal: {}, projects: [], skills: [], experience: [], education: [] },
                  };
                  setResumes((prev) => [...prev, newResume]);
                  setCurrentResume(newResume);
                }}
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
                <button className="btn btn-outline text-sm py-1.5" onClick={handlePreview} aria-label="Preview resume">
                  <Eye size={16} className="mr-2" />
                  Preview
                </button>
                <button className="btn btn-primary text-sm py-1.5" aria-label="Download resume as PDF">
                  <Download size={16} className="mr-2" />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Section Navigation */}
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    activeSection === section.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label={`Navigate to section: ${section.title}`}
                >
                  {section.title}
                </button>
              ))}
            </div>

            {/* Section Content */}
            <div className="space-y-6">
              {/* Personal Info */}
              {activeSection === 'personal' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      className="input"
                      value={currentResume.data.personal?.fullName || ''}
                      onChange={(e) =>
                        handleInputChange('personal', 'fullName', e.target.value)
                      }
                      placeholder="John Doe"
                      aria-label="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
                    <input
                      type="text"
                      className="input"
                      value={currentResume.data.personal?.title || ''}
                      onChange={(e) =>
                        handleInputChange('personal', 'title', e.target.value)
                      }
                      placeholder="Software Engineer"
                      aria-label="Professional title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="input"
                      value={currentResume.data.personal?.email || ''}
                      onChange={(e) =>
                        handleInputChange('personal', 'email', e.target.value)
                      }
                      placeholder="john@example.com"
                      aria-label="Email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      className="input"
                      value={currentResume.data.personal?.phone || ''}
                      onChange={(e) =>
                        handleInputChange('personal', 'phone', e.target.value)
                      }
                      placeholder="(123) 456-7890"
                      aria-label="Phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      className="input"
                      value={currentResume.data.personal?.location || ''}
                      onChange={(e) =>
                        handleInputChange('personal', 'location', e.target.value)
                      }
                      placeholder="City, State"
                      aria-label="Location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                    <textarea
                      className="input min-h-[100px]"
                      value={currentResume.data.personal?.summary || ''}
                      onChange={(e) =>
                        handleInputChange('personal', 'summary', e.target.value)
                      }
                      placeholder="Write a brief professional summary..."
                      aria-label="Professional summary"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Education */}
              {activeSection === 'education' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Education History</h3>
                    <button
                      className="btn btn-outline text-sm py-1.5"
                      onClick={() =>
                        addItem('education', { institution: '', degree: '', startDate: '', endDate: '', gpa: '' })
                      }
                      aria-label="Add education entry"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Education
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(currentResume.data.education || []).map((edu, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <input
                          type="text"
                          className="input"
                          placeholder="Institution Name"
                          value={edu.institution}
                          onChange={(e) => {
                            const updatedEducation = [...currentResume.data.education];
                            updatedEducation[index].institution = e.target.value;
                            setCurrentResume((prev) => ({
                              ...prev,
                              data: { ...prev.data, education: updatedEducation },
                            }));
                          }}
                          aria-label={`Education institution ${index + 1}`}
                        />
                        <input
                          type="text"
                          className="input mt-2"
                          placeholder="Degree & Major"
                          value={edu.degree}
                          onChange={(e) => {
                            const updatedEducation = [...currentResume.data.education];
                            updatedEducation[index].degree = e.target.value;
                            setCurrentResume((prev) => ({
                              ...prev,
                              data: { ...prev.data, education: updatedEducation },
                            }));
                          }}
                          aria-label={`Education degree ${index + 1}`}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            className="input"
                            placeholder="Start Date"
                            value={edu.startDate}
                            onChange={(e) => {
                              const updatedEducation = [...currentResume.data.education];
                              updatedEducation[index].startDate = e.target.value;
                              setCurrentResume((prev) => ({
                                ...prev,
                                data: { ...prev.data, education: updatedEducation },
                              }));
                            }}
                            aria-label={`Education start date ${index + 1}`}
                          />
                          <input
                            type="text"
                            className="input"
                            placeholder="End Date (or Expected)"
                            value={edu.endDate}
                            onChange={(e) => {
                              const updatedEducation = [...currentResume.data.education];
                              updatedEducation[index].endDate = e.target.value;
                              setCurrentResume((prev) => ({
                                ...prev,
                                data: { ...prev.data, education: updatedEducation },
                              }));
                            }}
                            aria-label={`Education end date ${index + 1}`}
                          />
                        </div>
                        <input
                          type="text"
                          className="input mt-4"
                          placeholder="GPA (optional)"
                          value={edu.gpa}
                          onChange={(e) => {
                            const updatedEducation = [...currentResume.data.education];
                            updatedEducation[index].gpa = e.target.value;
                            setCurrentResume((prev) => ({
                              ...prev,
                              data: { ...prev.data, education: updatedEducation },
                            }));
                          }}
                          aria-label={`Education GPA ${index + 1}`}
                        />
                        <button
                          className="text-gray-400 hover:text-error-600 mt-2"
                          onClick={() => removeItem('education', index)}
                          aria-label={`Remove education entry ${index + 1}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {activeSection === 'experience' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Work Experience</h3>
                    <button
                      className="btn btn-outline text-sm py-1.5"
                      onClick={() =>
                        addItem('experience', { jobTitle: '', companyName: '', description: '' })
                      }
                      aria-label="Add experience entry"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Experience
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(currentResume.data.experience || []).map((exp, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <input
                              type="text"
                              className="input"
                              placeholder="Job Title"
                              value={exp.jobTitle}
                              onChange={(e) => {
                                const updatedExperience = [...currentResume.data.experience];
                                updatedExperience[index].jobTitle = e.target.value;
                                setCurrentResume((prev) => ({
                                  ...prev,
                                  data: { ...prev.data, experience: updatedExperience },
                                }));
                              }}
                              aria-label={`Experience job title ${index + 1}`}
                            />
                            <input
                              type="text"
                              className="input mt-2"
                              placeholder="Company Name"
                              value={exp.companyName}
                              onChange={(e) => {
                                const updatedExperience = [...currentResume.data.experience];
                                updatedExperience[index].companyName = e.target.value;
                                setCurrentResume((prev) => ({
                                  ...prev,
                                  data: { ...prev.data, experience: updatedExperience },
                                }));
                              }}
                              aria-label={`Experience company name ${index + 1}`}
                            />
                          </div>
                          <button className="text-gray-400 hover:text-error-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <textarea
                          className="input min-h-[100px]"
                          placeholder="Describe your responsibilities and achievements..."
                          value={exp.description}
                          onChange={(e) => {
                            const updatedExperience = [...currentResume.data.experience];
                            updatedExperience[index].description = e.target.value;
                            setCurrentResume((prev) => ({
                              ...prev,
                              data: { ...prev.data, experience: updatedExperience },
                            }));
                          }}
                          aria-label={`Experience description ${index + 1}`}
                        ></textarea>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {activeSection === 'skills' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Skills</h3>
                    <button
                      className="btn btn-outline text-sm py-1.5"
                      onClick={() => addItem('skills', { skillName: '' })}
                      aria-label="Add skill"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Skill
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(currentResume.data.skills || []).map((skill, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <input
                          type="text"
                          className="input"
                          placeholder="Skill Name"
                          value={skill.skillName}
                          onChange={(e) => {
                            const updatedSkills = [...currentResume.data.skills];
                            updatedSkills[index].skillName = e.target.value;
                            setCurrentResume((prev) => ({
                              ...prev,
                              data: { ...prev.data, skills: updatedSkills },
                            }));
                          }}
                          aria-label={`Skill name ${index + 1}`}
                        />
                        <button
                          className="text-gray-400 hover:text-error-600 mt-2"
                          onClick={() => removeItem('skills', index)}
                          aria-label={`Remove skill ${index + 1}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {activeSection === 'projects' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Projects</h3>
                    <button
                      className="btn btn-outline text-sm py-1.5"
                      onClick={() =>
                        addItem('projects', { title: '', description: '' })
                      }
                      aria-label="Add project"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Project
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(currentResume.data.projects || []).map((project, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <input
                          type="text"
                          className="input"
                          placeholder="Project Title"
                          value={project.title}
                          onChange={(e) => {
                            const updatedProjects = [...currentResume.data.projects];
                            updatedProjects[index].title = e.target.value;
                            setCurrentResume((prev) => ({
                              ...prev,
                              data: { ...prev.data, projects: updatedProjects },
                            }));
                          }}
                          aria-label={`Project title ${index + 1}`}
                        />
                        <textarea
                          className="input mt-4 min-h-[100px]"
                          placeholder="Describe the project..."
                          value={project.description}
                          onChange={(e) => {
                            const updatedProjects = [...currentResume.data.projects];
                            updatedProjects[index].description = e.target.value;
                            setCurrentResume((prev) => ({
                              ...prev,
                              data: { ...prev.data, projects: updatedProjects },
                            }));
                          }}
                          aria-label={`Project description ${index + 1}`}
                        ></textarea>
                        <button
                          className="text-gray-400 hover:text-error-600 mt-2"
                          onClick={() => removeItem('projects', index)}
                          aria-label={`Remove project ${index + 1}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-end">
                {activeSection !== 'projects' ? (
                  <button className="btn btn-primary" onClick={handleNext} aria-label="Save and go to next section">
                    Save & Next
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={handleSaveAndFinish} aria-label="Save and finish resume">
                    Save & Finish
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockJobs } from '../data/mockData';
import { Search, MapPin, Building2, Briefcase, DollarSign, Calendar, BookmarkPlus, ExternalLink, PlusCircle, Edit2, Trash2, Filter, Clock, Star, ChevronRight, X } from 'lucide-react';
import { format } from 'date-fns';
import { Job } from '../types';
import { useAuth } from '../context/AuthContext';

interface JobFormData {
  title: string;
  description: string;
  location: string;
  type: "fulltime" | "parttime" | "internship" | "contract";
  salary?: string;
  requirements: string[];
  company: string;
  deadline?: string;
  experience?: string;
  level?: "entry" | "mid" | "senior" | "lead";
  skills: string[];
}

const JobListings = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [jobs, setJobs] = useState(mockJobs);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<string | null>(null);
  const [jobFormData, setJobFormData] = useState<JobFormData>({
    title: '',
    description: '',
    location: '',
    type: 'fulltime',
    requirements: [''],
    company: '',
    skills: [''],
  });
  const [savedJobs, setSavedJobs] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('savedJobs');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  }); // Load saved jobs from localStorage
  const [selectedJob, setSelectedJob] = useState<Job | null>(null); // Define the type for selectedJob
  const [isModalOpen, setIsModalOpen] = useState(false); // State to track modal visibility
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null); // Notification state
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof JobFormData, string>>>({});
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const navigate = useNavigate();

  const jobTypes = useMemo(() => Array.from(new Set(mockJobs.map(job => job.type))).sort(), [mockJobs]);
  const companies = useMemo(() => Array.from(new Set(mockJobs.map(job => job.company.name))).sort(), [mockJobs]);

  const filteredJobs = useMemo(() => mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || job.type === selectedType;
    const matchesCompany = !selectedCompany || job.company.name === selectedCompany;
    return matchesSearch && matchesType && matchesCompany;
  }), [searchQuery, selectedType, selectedCompany, mockJobs]);

  const toggleSaveJob = useCallback((jobId: string) => {
    setSavedJobs((prev) => {
      const updated = new Set(prev);
      if (updated.has(jobId)) {
        updated.delete(jobId); // Remove job if already saved
      } else {
        updated.add(jobId); // Add job if not saved
      }
      localStorage.setItem('savedJobs', JSON.stringify(Array.from(updated))); // Persist changes immediately
      return updated;
    });
  }, []);

  const handleApplyNow = useCallback((jobId: string) => {
    navigate(`/app/jobs/${jobId}/apply`);
  }, [navigate]);

  const handleViewDetails = useCallback((job: Job) => {
    setSelectedJob(job); // Set the selected job
    setIsModalOpen(true); // Open the modal
  }, []);

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedJob(null); // Clear the selected job
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000); // Hide after 3 seconds
  };

  const startEdit = (job: Job) => {
    setEditingJob(job.id);
    setJobFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      type: job.type,
      salary: job.salary,
      requirements: job.requirements,
      company: job.company.name,
      deadline: job.deadline || '',
      experience: job.experience || '',
      level: job.level || 'entry',
      skills: job.skills || [],
    });
    setShowJobForm(true);
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof JobFormData, string>> = {};
    
    if (jobFormData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    }
    if (jobFormData.description.length < 50) {
      errors.description = 'Description must be at least 50 characters long';
    }
    if (!jobFormData.location) {
      errors.location = 'Location is required';
    }
    if (!jobFormData.salary) {
      errors.salary = 'Salary is required';
    }
    if (jobFormData.requirements.length === 0 || !jobFormData.requirements[0]) {
      errors.requirements = 'At least one requirement is needed';
    }
    if (!jobFormData.deadline) {
      errors.deadline = 'Deadline is required';
    }
    if (!jobFormData.skills || jobFormData.skills.length === 0) {
      errors.skills = 'At least one skill is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('error', 'Please fix the form errors before submitting');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newJob = {
        id: `job-${jobs.length + 1}`,
        ...jobFormData,
        postedDate: new Date().toISOString(),
        tags: jobFormData.requirements,
        company: mockJobs[0].company // Using first company as default
      };
      setJobs([...jobs, newJob]);
      // Persist the new job in mockJobs
      mockJobs.push(newJob);
      setShowJobForm(false);
      resetForm();
      showNotification('success', 'Job listing added successfully');
    } catch (error) {
      showNotification('error', 'Failed to add job listing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    if (!validateForm()) {
      showNotification('error', 'Please fix the form errors before submitting');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedJobs = jobs.map(job =>
        job.id === editingJob
          ? {
              ...job,
              title: jobFormData.title,
              description: jobFormData.description,
              location: jobFormData.location,
              type: jobFormData.type,
              salary: jobFormData.salary,
              requirements: jobFormData.requirements,
              deadline: jobFormData.deadline,
              experience: jobFormData.experience,
              level: jobFormData.level,
              skills: jobFormData.skills,
            }
          : job
      );
      setJobs(updatedJobs);
      setEditingJob(null);
      setShowJobForm(false);
      showNotification('success', 'Job listing updated successfully');
    } catch (error) {
      showNotification('error', 'Failed to update job listing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteJob = (job: Job) => {
    setJobToDelete(job);
  };

  const confirmDelete = () => {
    if (jobToDelete) {
      setJobs(jobs.filter(job => job.id !== jobToDelete.id));
      showNotification('success', 'Job listing deleted successfully');
      setJobToDelete(null);
    }
  };

  const resetForm = () => {
    setJobFormData({
      title: '',
      description: '',
      location: '',
      type: 'fulltime',
      requirements: [''],
      company: '',
      skills: [''],
    });
  };

  useEffect(() => {
    // Ensure saved jobs are loaded correctly on component mount
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      setSavedJobs(new Set(JSON.parse(saved)));
    }
  }, []);

  // Ensure saved jobs are displayed correctly
  const savedJobsList = mockJobs.filter(job => savedJobs.has(job.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 p-4 rounded shadow-lg z-50 transform transition-transform duration-300 ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Job Listings</h1>
          <p className="text-lg text-gray-600">
            Find and apply for jobs that match your skills and interests
          </p>
          <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <Briefcase size={16} />
              {filteredJobs.length} jobs available
            </span>
            <span className="flex items-center gap-2">
              <Building2 size={16} />
              {companies.length} companies hiring
            </span>
            <span className="flex items-center gap-2">
              <Star size={16} />
              {savedJobs.size} saved jobs
            </span>
          </div>
        </div>
        {(user?.role === 'employer' || user?.role === 'admin') && (
          <button
            onClick={() => setShowJobForm(true)}
            className="btn btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <PlusCircle size={20} />
            Add Job
          </button>
        )}
      </div>

      {/* Job Form Modal */}
      {showJobForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">
              {editingJob ? 'Edit Job' : 'Add New Job'}
            </h2>
            <form onSubmit={editingJob ? handleEditJob : handleAddJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Job Title *</label>
                  <input
                    type="text"
                    value={jobFormData.title}
                    onChange={(e) => {
                      setJobFormData({...jobFormData, title: e.target.value});
                      if (formErrors.title) {
                        setFormErrors({...formErrors, title: ''});
                      }
                    }}
                    className={`input w-full ${formErrors.title ? 'border-red-500' : ''}`}
                    required
                    minLength={3}
                    maxLength={100}
                    placeholder="e.g., Senior Software Engineer"
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>
                  )}
                  {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={jobFormData.type}
                    onChange={(e) => setJobFormData({...jobFormData, type: e.target.value as JobFormData['type']})}
                    className="input w-full"
                    required
                  >
                    <option value="fulltime">Full Time</option>
                    <option value="parttime">Part Time</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={jobFormData.location}
                    onChange={(e) => setJobFormData({...jobFormData, location: e.target.value})}
                    className="input w-full"
                    required
                  />
                  {formErrors.location && <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Salary</label>
                  <input
                    type="text"
                    value={jobFormData.salary}
                    onChange={(e) => setJobFormData({...jobFormData, salary: e.target.value})}
                    className="input w-full"
                    placeholder="e.g., $50,000 - $70,000"
                  />
                  {formErrors.salary && <p className="text-red-500 text-sm mt-1">{formErrors.salary}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={jobFormData.description}
                    onChange={(e) => setJobFormData({...jobFormData, description: e.target.value})}
                    className="input w-full h-24"
                    required
                  />
                  {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Requirements (one per line)</label>
                  <textarea
                    value={jobFormData.requirements.join('\n')}
                    onChange={(e) => setJobFormData({...jobFormData, requirements: e.target.value.split('\n')})}
                    className="input w-full h-24"
                    placeholder="Enter each requirement on a new line"
                    required
                  />
                  {formErrors.requirements && <p className="text-red-500 text-sm mt-1">{formErrors.requirements}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deadline</label>
                  <input
                    type="date"
                    value={jobFormData.deadline}
                    onChange={(e) => setJobFormData({...jobFormData, deadline: e.target.value})}
                    className="input w-full"
                    required
                  />
                  {formErrors.deadline && <p className="text-red-500 text-sm mt-1">{formErrors.deadline}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Experience</label>
                  <input
                    type="text"
                    value={jobFormData.experience}
                    onChange={(e) => setJobFormData({...jobFormData, experience: e.target.value})}
                    className="input w-full"
                    placeholder="e.g., 2 years"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Level</label>
                  <select
                    value={jobFormData.level}
                    onChange={(e) => setJobFormData({...jobFormData, level: e.target.value as JobFormData['level']})}
                    className="input w-full"
                    required
                  >
                    <option value="entry">Entry</option>
                    <option value="mid">Mid</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
                  <input
                    type="text"
                    value={jobFormData.skills?.join(', ') || ''}
                    onChange={(e) => setJobFormData({...jobFormData, skills: e.target.value.split(',').map(skill => skill.trim()).filter(Boolean)})}
                    className="input w-full"
                    placeholder="e.g., JavaScript, React, Node.js"
                    required
                  />
                  {formErrors.skills && <p className="text-red-500 text-sm mt-1">{formErrors.skills}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowJobForm(false);
                    setEditingJob(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingJob ? 'Saving...' : 'Adding...'}
                    </>
                  ) : (
                    editingJob ? 'Save Changes' : 'Add Job'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-8 bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Search & Filter Jobs</h2>
        </div>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search jobs by title, company, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-12 pr-4 py-3 w-full text-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl transition-all duration-200"
                aria-label="Search jobs"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 lg:w-auto">
            <div className="w-full sm:w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input w-full py-3 border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl transition-all duration-200"
                aria-label="Filter by job type"
              >
                <option value="">All Job Types</option>
                {jobTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-64">
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="input w-full py-3 border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl transition-all duration-200"
                aria-label="Filter by company"
              >
                <option value="">All Companies</option>
                {companies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="space-y-6">
        {filteredJobs.map(job => (
          <div key={job.id} className="bg-white rounded-xl shadow-soft hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-primary-200 group">
            <div className="flex items-start gap-6">
              {job.company.logo ? (
                <img
                  src={job.company.logo}
                  alt={job.company.name}
                  className="w-16 h-16 rounded-xl object-cover shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center shadow-sm">
                  <Building2 size={32} className="text-primary-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors duration-200">{job.title}</h2>
                    <p className="text-lg text-gray-600 font-medium">{job.company.name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        job.type === 'fulltime' ? 'bg-green-100 text-green-700' :
                        job.type === 'parttime' ? 'bg-blue-100 text-blue-700' :
                        job.type === 'internship' ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                      </span>
                      {job.level && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {job.level.charAt(0).toUpperCase() + job.level.slice(1)} Level
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      savedJobs.has(job.id) 
                        ? 'text-primary-600 bg-primary-50 hover:bg-primary-100' 
                        : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                    onClick={() => toggleSaveJob(job.id)}
                    aria-label={savedJobs.has(job.id) ? `Unsave job ${job.title}` : `Save job ${job.title}`}
                  >
                    <BookmarkPlus size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin size={16} className="mr-2 text-gray-400" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center text-gray-600">
                      <DollarSign size={16} className="mr-2 text-gray-400" />
                      <span className="truncate font-medium text-green-600">{job.salary}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <Clock size={16} className="mr-2 text-gray-400" />
                    <span className="truncate">Posted {format(new Date(job.postedDate), 'MMM d')}</span>
                  </div>
                  {job.deadline && (
                    <div className="flex items-center text-gray-600">
                      <Calendar size={16} className="mr-2 text-gray-400" />
                      <span className="truncate">Deadline {format(new Date(job.deadline), 'MMM d')}</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 line-clamp-2 mb-4 leading-relaxed">{job.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {job.tags.slice(0, 4).map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full font-medium hover:bg-primary-100 transition-colors duration-200"
                    >
                      {tag}
                    </span>
                  ))}
                  {job.tags.length > 4 && (
                    <span className="px-3 py-1 bg-gray-50 text-gray-600 text-sm rounded-full font-medium">
                      +{job.tags.length - 4} more
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className="btn btn-primary hover:shadow-md transition-all duration-200"
                    onClick={() => handleApplyNow(job.id)}
                    aria-label={`Apply for job ${job.title}`}
                  >
                    Apply Now
                  </button>
                  <button
                    className="btn btn-outline hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 transition-all duration-200 flex items-center gap-2"
                    onClick={() => handleViewDetails(job)}
                    aria-label={`View details for job ${job.title}`}
                    title="View more details about this job"
                  >
                    View Details
                    <ChevronRight size={16} />
                  </button>
                  {job.company.website && (
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 hover:underline transition-all duration-200"
                      aria-label={`Visit ${job.company.name} website`}
                    >
                      Company Website <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Admin controls */}
            {user?.role === 'admin' && (
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                <button
                  onClick={() => startEdit(job)}
                  className="btn btn-secondary btn-sm flex items-center gap-1 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  aria-label="Edit job"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteJob(job)}
                  className="btn btn-danger btn-sm flex items-center gap-1 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                  aria-label="Delete job"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}

            {/* Employer controls */}
            {user?.role === 'employer' && (
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                <button
                  onClick={() => startEdit(job)}
                  className="btn btn-secondary btn-sm flex items-center gap-1 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  aria-label="Edit job"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredJobs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-soft">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search filters or check back later for new opportunities</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('');
                setSelectedCompany('');
              }}
              className="btn btn-outline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Saved Jobs Section */}
      {savedJobsList.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <BookmarkPlus size={20} className="text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Saved Jobs</h2>
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {savedJobsList.length} saved
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {savedJobsList.map(job => (
              <div key={job.id} className="bg-white rounded-xl shadow-soft hover:shadow-md transition-all duration-300 p-6 border border-gray-100 hover:border-primary-200">
                <div className="flex items-start gap-4">
                  {job.company.logo ? (
                    <img
                      src={job.company.logo}
                      alt={job.company.name}
                      className="w-12 h-12 rounded-lg object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center shadow-sm">
                      <Building2 size={24} className="text-primary-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{job.title}</h3>
                        <p className="text-gray-600 font-medium">{job.company.name}</p>
                      </div>
                      <button
                        className="p-1 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200"
                        onClick={() => toggleSaveJob(job.id)}
                        aria-label="Remove from saved"
                      >
                        <BookmarkPlus size={18} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-2 text-gray-400" />
                        <span className="truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Briefcase size={14} className="mr-2 text-gray-400" />
                        <span className="truncate">{job.type}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center col-span-2">
                          <DollarSign size={14} className="mr-2 text-gray-400" />
                          <span className="truncate font-medium text-green-600">{job.salary}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="btn btn-primary btn-sm flex-1 sm:flex-none"
                        onClick={() => handleApplyNow(job.id)}
                        aria-label={`Apply for job ${job.title}`}
                      >
                        Apply Now
                      </button>
                      <button
                        className="btn btn-outline btn-sm flex items-center gap-1"
                        onClick={() => handleViewDetails(job)}
                        aria-label={`View details for job ${job.title}`}
                      >
                        View Details
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {isModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-200 flex justify-between items-start">
              <div className="flex items-start gap-4">
                {selectedJob.company.logo ? (
                  <img
                    src={selectedJob.company.logo}
                    alt={selectedJob.company.name}
                    className="w-16 h-16 rounded-xl object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center shadow-sm">
                    <Building2 size={32} className="text-primary-600" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedJob.title}</h2>
                  <p className="text-lg text-gray-600 font-medium">{selectedJob.company.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedJob.type === 'fulltime' ? 'bg-green-100 text-green-700' :
                      selectedJob.type === 'parttime' ? 'bg-blue-100 text-blue-700' :
                      selectedJob.type === 'internship' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {selectedJob.type.charAt(0).toUpperCase() + selectedJob.type.slice(1)}
                    </span>
                    {selectedJob.level && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {selectedJob.level.charAt(0).toUpperCase() + selectedJob.level.slice(1)} Level
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Briefcase size={20} className="text-primary-600" />
                      Job Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="text-gray-400" size={18} />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                          <p className="text-gray-700 font-medium">{selectedJob.location}</p>
                        </div>
                      </div>
                      {selectedJob.salary && (
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <DollarSign className="text-green-500" size={18} />
                          <div>
                            <p className="text-xs text-green-600 uppercase tracking-wide">Salary</p>
                            <p className="text-green-700 font-medium">{selectedJob.salary}</p>
                          </div>
                        </div>
                      )}
                      {selectedJob.experience && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <Calendar className="text-blue-500" size={18} />
                          <div>
                            <p className="text-xs text-blue-600 uppercase tracking-wide">Experience</p>
                            <p className="text-blue-700 font-medium">{selectedJob.experience}</p>
                          </div>
                        </div>
                      )}
                      {selectedJob.deadline && (
                        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                          <Clock className="text-orange-500" size={18} />
                          <div>
                            <p className="text-xs text-orange-600 uppercase tracking-wide">Deadline</p>
                            <p className="text-orange-700 font-medium">{format(new Date(selectedJob.deadline), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedJob.skills && selectedJob.skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Star size={20} className="text-primary-600" />
                        Required Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-2 bg-primary-50 text-primary-700 text-sm rounded-lg font-medium hover:bg-primary-100 transition-colors duration-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Job Description</h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Requirements</h3>
                    <ul className="space-y-2">
                      {selectedJob.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 leading-relaxed">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white px-8 py-6 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  className="btn btn-primary flex-1 md:flex-none px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => {
                    handleApplyNow(selectedJob.id);
                    closeModal();
                  }}
                  aria-label={`Apply for job ${selectedJob.title}`}
                >
                  Apply Now
                </button>
                {selectedJob.company.website && (
                  <a
                    href={selectedJob.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary flex items-center gap-2 hover:shadow-md transition-all duration-200"
                    aria-label={`Visit ${selectedJob.company.name} website`}
                  >
                    Visit Website <ExternalLink size={16} />
                  </a>
                )}
                <button
                  className={`btn ${
                    savedJobs.has(selectedJob.id)
                      ? 'btn-primary-outline'
                      : 'btn-outline'
                  } flex items-center gap-2 hover:shadow-md transition-all duration-200`}
                  onClick={() => toggleSaveJob(selectedJob.id)}
                  aria-label={savedJobs.has(selectedJob.id) ? 'Unsave job' : 'Save job'}
                >
                  <BookmarkPlus size={16} />
                  {savedJobs.has(selectedJob.id) ? 'Saved' : 'Save Job'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {jobToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Are you sure you want to delete the job listing for <span className="font-semibold">"{jobToDelete.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  className="btn btn-outline flex-1 hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setJobToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger flex-1 hover:shadow-md transition-all duration-200"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListings;
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockJobs } from '../data/mockData';
import { Search, MapPin, Building2, Filter, Briefcase, DollarSign, Calendar, BookmarkPlus, ExternalLink, PlusCircle, Edit2, Trash2 } from 'lucide-react';
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

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Listings</h1>
          <p className="mt-2 text-gray-600">Find and apply for jobs that match your skills and interests</p>
        </div>
        {user?.role === 'employer' && (
          <button
            onClick={() => setShowJobForm(true)}
            className="btn btn-primary flex items-center gap-2"
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
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search jobs by title, company, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
              aria-label="Search jobs"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
        <div className="w-full md:w-48">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input w-full"
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
        <div className="w-full md:w-64">
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="input w-full"
            aria-label="Filter by company"
          >
            <option value="">All Companies</option>
            {companies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Job Listings */}
      <div className="space-y-6">
        {filteredJobs.map(job => (
          <div key={job.id} className="bg-white rounded-xl shadow-soft hover:shadow-medium transition-shadow p-6">
            <div className="flex items-start gap-4">
              {job.company.logo ? (
                <img
                  src={job.company.logo}
                  alt={job.company.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Building2 size={32} className="text-primary-600" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                    <p className="text-gray-600">{job.company.name}</p>
                  </div>
                  <button
                    className={`text-gray-400 hover:text-primary-600 ${
                      savedJobs.has(job.id) ? 'text-primary-600' : ''
                    }`}
                    onClick={() => toggleSaveJob(job.id)}
                    aria-label={savedJobs.has(job.id) ? `Unsave job ${job.title}` : `Save job ${job.title}`}
                  >
                    <BookmarkPlus size={20} />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin size={16} className="mr-2 text-gray-400" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Briefcase size={16} className="mr-2 text-gray-400" />
                    {job.type}
                  </div>
                  {job.salary && (
                    <div className="flex items-center text-gray-600">
                      <DollarSign size={16} className="mr-2 text-gray-400" />
                      {job.salary}
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    Posted {format(new Date(job.postedDate), 'MMM d, yyyy')}
                  </div>
                </div>

                <p className="mt-4 text-gray-600 line-clamp-2">{job.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {job.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleApplyNow(job.id)}
                    aria-label={`Apply for job ${job.title}`}
                  >
                    Apply Now
                  </button>
                  <button
                    className="btn btn-outline hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    onClick={() => handleViewDetails(job)}
                    aria-label={`View details for job ${job.title}`}
                    title="View more details about this job"
                  >
                    View Details
                  </button>
                  {job.company.website && (
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                      aria-label={`Visit ${job.company.name} website`}
                    >
                      Company Website <ExternalLink size={14} className="ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Admin controls */}
            {user?.role === 'admin' && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                <button
                  onClick={() => startEdit(job)}
                  className="btn btn-secondary btn-sm flex items-center gap-1"
                  aria-label="Edit job"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteJob(job)}
                  className="btn btn-danger btn-sm flex items-center gap-1"
                  aria-label="Delete job"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}

            {/* Employer controls */}
            {user?.role === 'employer' && job.postedBy === user.id && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                <button
                  onClick={() => startEdit(job)}
                  className="btn btn-secondary btn-sm flex items-center gap-1"
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
          <div className="text-center py-12">
            <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        )}
      </div>

      {/* Saved Jobs Section */}
      {savedJobsList.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Saved Jobs</h2>
          <div className="space-y-6">
            {savedJobsList.map(job => (
              <div key={job.id} className="bg-white rounded-xl shadow-soft hover:shadow-medium transition-shadow p-6">
                <div className="flex items-start gap-4">
                  {job.company.logo ? (
                    <img
                      src={job.company.logo}
                      alt={job.company.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Building2 size={32} className="text-primary-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                    <p className="text-gray-600">{job.company.name}</p>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin size={16} className="mr-2 text-gray-400" />
                        {job.location}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Briefcase size={16} className="mr-2 text-gray-400" />
                        {job.type}
                      </div>
                      {job.salary && (
                        <div className="flex items-center text-gray-600">
                          <DollarSign size={16} className="mr-2 text-gray-400" />
                          {job.salary}
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        Posted {format(new Date(job.postedDate), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <p className="mt-4 text-gray-600 line-clamp-2">{job.description}</p>
                    <div className="mt-6 flex flex-wrap items-center gap-4">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleApplyNow(job.id)}
                        aria-label={`Apply for job ${job.title}`}
                      >
                        Apply Now
                      </button>
                      <button
                        className="btn btn-outline hover:bg-primary-50 hover:text-primary-700 transition-colors"
                        onClick={() => handleViewDetails(job)}
                        aria-label={`View details for job ${job.title}`}
                        title="View more details about this job"
                      >
                        View Details
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
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex justify-between items-start bg-white pb-4 mb-4 border-b">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{selectedJob.title}</h2>
                <p className="text-lg text-gray-600">{selectedJob.company.name}</p>
              </div>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Job Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-gray-400" size={18} />
                    <span className="text-gray-700">{selectedJob.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="text-gray-400" size={18} />
                    <span className="text-gray-700">{selectedJob.type}</span>
                  </div>
                  {selectedJob.salary && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="text-gray-400" size={18} />
                      <span className="text-gray-700">{selectedJob.salary}</span>
                    </div>
                  )}
                  {selectedJob.experience && (
                    <div className="flex items-center gap-2">
                      <Calendar className="text-gray-400" size={18} />
                      <span className="text-gray-700">{selectedJob.experience} experience</span>
                    </div>
                  )}
                  {selectedJob.level && (
                    <div className="flex items-center gap-2">
                      <Building2 className="text-gray-400" size={18} />
                      <span className="text-gray-700">{selectedJob.level} level</span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap mb-6">{selectedJob.description}</p>

                <h3 className="text-lg font-semibold mb-4">Requirements</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {selectedJob.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="sticky bottom-0 flex flex-wrap items-center gap-4 mt-8 pt-4 bg-white border-t">
              <button
                className="btn btn-primary flex-1 md:flex-none"
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
                  className="btn btn-secondary flex items-center gap-2"
                  aria-label={`Visit ${selectedJob.company.name} website`}
                >
                  Visit Website <ExternalLink size={16} />
                </a>
              )}
              <div className="flex-1 md:flex-none">
                <button
                  className={`w-full md:w-auto btn ${
                    savedJobs.has(selectedJob.id)
                      ? 'btn-primary-outline'
                      : 'btn-outline'
                  }`}
                  onClick={() => toggleSaveJob(selectedJob.id)}
                  aria-label={savedJobs.has(selectedJob.id) ? 'Unsave job' : 'Save job'}
                >
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the job listing for "{jobToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="btn btn-outline"
                onClick={() => setJobToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListings;
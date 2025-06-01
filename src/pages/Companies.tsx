import React, { useState, useMemo, useEffect } from 'react';
import { mockCompanies } from '../data/mockData';
import { Building2, MapPin, Globe, Users, Search, Briefcase, BookmarkPlus, Edit2, Plus, Eye, X, Calendar, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Company, EmployerUser } from '../types';

const Companies = () => {
  const { user, checkPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [selectedCompanyDetails, setSelectedCompanyDetails] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  // Initialize savedCompanies state using localStorage
  const [savedCompanies, setSavedCompanies] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('savedCompanies');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set<string>();
    }
  });
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Load saved companies from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('savedCompanies');
    if (saved) {
      setSavedCompanies(new Set(JSON.parse(saved)));
    }
  }, []);

  const industries = useMemo(() => 
    Array.from(new Set(mockCompanies.flatMap(company => company.industry))).sort(),
    []
  );

  const filteredCompanies = useMemo(() => 
    companies.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry = !selectedIndustry || company.industry.includes(selectedIndustry);
      return matchesSearch && matchesIndustry;
    }),
    [searchQuery, selectedIndustry, companies]
  );

  const canAddCompany = checkPermission('create', 'company');
  const isEmployerWithCompany = user?.role === 'employer' && (user as EmployerUser).companyId;

  const [companyForm, setCompanyForm] = useState<Partial<Company>>({
    name: '',
    description: '',
    industry: [],
    location: '',
    website: '',
    size: '',
    founded: new Date().getFullYear(),
  });

  const handleSaveCompany = async (companyId: string) => {
    try {
      const updatedSaved = new Set(savedCompanies);
      if (updatedSaved.has(companyId)) {
        updatedSaved.delete(companyId);
        showNotification('success', 'Company removed from saved items');
      } else {
        updatedSaved.add(companyId);
        showNotification('success', 'Company saved successfully');
      }

      setSavedCompanies(updatedSaved);
      localStorage.setItem('savedCompanies', JSON.stringify(Array.from(updatedSaved)));
    } catch (error) {
      console.error('Failed to save company:', error);
      showNotification('error', 'Failed to save company');
    }
  };

  const handleViewCompanyDetails = (company: Company) => {
    setSelectedCompanyDetails(company);
  };

  const closeCompanyDetails = () => {
    setSelectedCompanyDetails(null);
  };

  const handleSubmitCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkPermission('create', 'company')) return;

    setIsLoading(true);
    try {
      // Here you would typically make an API call to create/update the company
      // For now, we'll just simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingCompany) {
        // Update existing company
        setCompanies(prev => prev.map(company => company.id === editingCompany.id ? { ...editingCompany, ...companyForm } : company));
        showNotification('success', 'Company updated successfully');
      } else {
        // Create new company
        const newCompany = {
          id: `company-${Date.now()}`,
          name: companyForm.name || 'Unnamed Company',
          description: companyForm.description || 'No description provided.',
          industry: companyForm.industry || ['General'],
          location: companyForm.location || 'Unknown',
          website: companyForm.website || 'N/A',
          ...companyForm,
        };
        setCompanies(prev => [...prev, newCompany]);
        showNotification('success', 'Company created successfully');
      }

      setShowCompanyForm(false);
      setEditingCompany(null);
      setCompanyForm({
        name: '',
        description: '',
        industry: [],
        location: '',
        website: '',
        size: '',
        founded: new Date().getFullYear(),
      });

      // Force a re-render
      window.location.reload();
    } catch (error) {
      console.error('Failed to submit company:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditCompany = (company: Company) => {
    setEditingCompany(company);
    setCompanyForm({
      name: company.name,
      description: company.description,
      industry: company.industry,
      location: company.location,
      website: company.website,
      size: company.size,
      founded: company.founded,
    });
    setShowCompanyForm(true);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="mt-2 text-gray-600">
            Discover companies and explore opportunities
          </p>
        </div>
        {canAddCompany && !isEmployerWithCompany && (
          <button
            onClick={() => setShowCompanyForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Company
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search companies by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
              aria-label="Search companies"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
        <div className="w-full md:w-64">
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="input w-full"
            aria-label="Filter by industry"
          >
            <option value="">All Industries</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Company Form Modal */}
      {showCompanyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">
              {editingCompany ? 'Edit Company' : 'Add New Company'}
            </h2>
            <form onSubmit={handleSubmitCompany} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    value={companyForm.description}
                    onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                    className="input w-full h-24"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Industry *</label>
                  <select
                    multiple
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({
                      ...companyForm,
                      industry: Array.from(e.target.selectedOptions, option => option.value)
                    })}
                    className="input w-full h-24"
                    required
                  >
                    {industries.map(industry => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location *</label>
                  <input
                    type="text"
                    value={companyForm.location}
                    onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <input
                    type="url"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                    className="input w-full"
                    placeholder="https://"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company Size</label>
                  <select
                    value={companyForm.size}
                    onChange={(e) => setCompanyForm({ ...companyForm, size: e.target.value })}
                    className="input w-full"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1001+">1001+ employees</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Founded Year</label>
                  <input
                    type="number"
                    value={companyForm.founded}
                    onChange={(e) => setCompanyForm({ ...companyForm, founded: parseInt(e.target.value) })}
                    className="input w-full"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCompanyForm(false);
                    setEditingCompany(null);
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
                      {editingCompany ? 'Saving...' : 'Creating...'}
                    </>
                  ) : (
                    editingCompany ? 'Save Changes' : 'Create Company'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Company Details Modal */}
      {selectedCompanyDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                {selectedCompanyDetails.logo ? (
                  <img
                    src={selectedCompanyDetails.logo}
                    alt={selectedCompanyDetails.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Building2 size={32} className="text-primary-600" />
                  </div>
                )}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedCompanyDetails.name}</h2>
                  <p className="text-lg text-gray-600">{selectedCompanyDetails.industry.join(', ')}</p>
                </div>
              </div>
              <button
                onClick={closeCompanyDetails}
                className="text-gray-400 hover:text-gray-600 p-2"
                aria-label="Close details"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Company Overview */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Company Overview</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedCompanyDetails.description}</p>
                </div>

                {/* Basic Information */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <MapPin size={20} className="text-gray-400 mr-3" />
                      <span className="text-gray-700">{selectedCompanyDetails.location}</span>
                    </div>
                    
                    {selectedCompanyDetails.size && (
                      <div className="flex items-center">
                        <Users size={20} className="text-gray-400 mr-3" />
                        <span className="text-gray-700">{selectedCompanyDetails.size} employees</span>
                      </div>
                    )}
                    
                    {selectedCompanyDetails.founded && (
                      <div className="flex items-center">
                        <Calendar size={20} className="text-gray-400 mr-3" />
                        <span className="text-gray-700">Founded in {selectedCompanyDetails.founded}</span>
                      </div>
                    )}
                    
                    {selectedCompanyDetails.website && (
                      <div className="flex items-center">
                        <Globe size={20} className="text-gray-400 mr-3" />
                        <a
                          href={selectedCompanyDetails.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Industries */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Industries</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompanyDetails.industry.map((industry, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                      >
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-6">
                {/* Open Positions */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Open Positions</h3>
                  <div className="flex items-center p-4 bg-green-50 rounded-lg">
                    <Briefcase size={24} className="text-green-600 mr-3" />
                    <div>
                      <p className="text-lg font-semibold text-green-800">
                        {selectedCompanyDetails.openPositions || 0} positions available
                      </p>
                      <p className="text-sm text-green-600">Discover available opportunities</p>
                    </div>
                  </div>
                </div>

                {/* Company Stats (Mock Data) */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Company Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">4.5</div>
                      <div className="text-sm text-blue-600">Employee Rating</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">85%</div>
                      <div className="text-sm text-purple-600">Satisfaction Rate</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">12</div>
                      <div className="text-sm text-orange-600">Years Avg Experience</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">95%</div>
                      <div className="text-sm text-green-600">Retention Rate</div>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-indigo-600">78%</div>
                      <div className="text-sm text-indigo-600">Graduate Hiring Rate</div>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-teal-600">65%</div>
                      <div className="text-sm text-teal-600">Fresh Graduate %</div>
                    </div>
                  </div>
                </div>

                {/* Benefits (Mock Data) */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Benefits & Perks</h3>
                  <div className="space-y-2">
                    {[
                      'Comprehensive health insurance',
                      'Flexible vacation',
                      'Training programs',
                      'Creative work environment',
                      'Excellent promotion opportunities'
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center">
                        <Award size={16} className="text-green-500 mr-2" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => handleSaveCompany(selectedCompanyDetails.id)}
                className={`btn flex items-center gap-2 ${
                  savedCompanies.has(selectedCompanyDetails.id) 
                    ? 'btn-secondary' 
                    : 'btn-primary'
                }`}
              >
                <BookmarkPlus size={20} />
                {savedCompanies.has(selectedCompanyDetails.id) ? 'Remove from Saved' : 'Save Company'}
              </button>
              
              {selectedCompanyDetails.website && (
                <a
                  href={selectedCompanyDetails.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Globe size={20} />
                  Visit Website
                </a>
              )}
              
              <button
                onClick={closeCompanyDetails}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Companies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <div key={company.id} className="bg-white rounded-xl shadow-soft hover:shadow-medium transition-shadow p-6">
            {/* Company Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Building2 size={24} className="text-primary-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{company.name}</h3>
                  <p className="text-sm text-gray-600">{company.industry.join(', ')}</p>
                </div>
              </div>
              {/* Save Button - Available for all users */}
              <button
                onClick={() => handleSaveCompany(company.id)}
                className={`text-gray-400 hover:text-primary-600 ${
                  savedCompanies.has(company.id) ? 'text-primary-600' : ''
                }`}
                aria-label={savedCompanies.has(company.id) ? 'Unsave company' : 'Save company'}
              >
                <BookmarkPlus size={20} />
              </button>
            </div>

            {/* Company Description */}
            <p className="mt-4 text-gray-600 line-clamp-3">{company.description}</p>

            {/* Company Details */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <MapPin size={16} className="mr-2" />
                {company.location}
              </div>
              {company.size && (
                <div className="flex items-center text-gray-600">
                  <Users size={16} className="mr-2" />
                  {company.size}
                </div>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-primary-600 hover:text-primary-700"
                >
                  <Globe size={16} className="mr-2" />
                  Website
                </a>
              )}
              <div className="flex items-center text-gray-600">
                <Briefcase size={16} className="mr-2" />
                {company.openPositions || 0} Open Positions
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleViewCompanyDetails(company)}
                className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
              >
                <Eye size={16} />
                View Details
              </button>
            </div>

            {/* Employer Edit Controls */}
            {(user?.role === 'employer' && (user as EmployerUser).companyId === company.id) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => startEditCompany(company)}
                  className="text-gray-400 hover:text-primary-600 flex items-center gap-2"
                  aria-label="Edit company"
                >
                  <Edit2 size={16} />
                  Edit Company
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredCompanies.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No companies found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;
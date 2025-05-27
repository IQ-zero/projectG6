import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockJobs, mockEvents, mockCompanies } from '../data/mockData';
import { Building2, Briefcase, MapPin, DollarSign, Calendar, ExternalLink, Users, Clock, Trash2, BookmarkX } from 'lucide-react';
import { format } from 'date-fns';

const SavedItems = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'jobs' | 'events' | 'companies'>('jobs');

  // Get saved items from localStorage
  const savedItems = useMemo(() => {
    try {
      return {
        jobs: new Set(JSON.parse(localStorage.getItem('savedJobs') || '[]')),
        events: new Set(JSON.parse(localStorage.getItem('savedEvents') || '[]')),
        companies: new Set(JSON.parse(localStorage.getItem('savedCompanies') || '[]')),
      };
    } catch (error) {
      console.error('Failed to load saved items:', error);
      return {
        jobs: new Set<string>(),
        events: new Set<string>(),
        companies: new Set<string>(),
      };
    }
  }, []);

  const savedJobDetails = useMemo(() => 
    mockJobs.filter(job => savedItems.jobs.has(job.id)), 
    [savedItems.jobs]
  );

  const savedEventDetails = useMemo(() => 
    mockEvents.filter(event => savedItems.events.has(event.id)), 
    [savedItems.events]
  );

  const savedCompanyDetails = useMemo(() => 
    mockCompanies.filter(company => savedItems.companies.has(company.id)), 
    [savedItems.companies]
  );

  const handleRemoveItem = async (type: 'jobs' | 'events' | 'companies', id: string) => {
    try {
      const key = `saved${type.charAt(0).toUpperCase() + type.slice(1)}`;
      const currentItems = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
      currentItems.delete(id);
      localStorage.setItem(key, JSON.stringify(Array.from(currentItems)));

      // Force a re-render
      window.location.reload();
    } catch (error) {
      console.error(`Failed to remove saved ${type.slice(0, -1)}:`, error);
    }
  };

  const getTotalCount = () => {
    return savedJobDetails.length + savedEventDetails.length + savedCompanyDetails.length;
  };

  const EmptyState = ({ type }: { type: string }) => (
    <div className="text-center py-12">
      <BookmarkX className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No saved {type}</h3>
      <p className="mt-1 text-sm text-gray-500">
        Start saving {type} you're interested in to see them here.
      </p>
      <div className="mt-6">
        <button
          type="button"
          onClick={() => navigate(`/${type.toLowerCase()}`)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          Browse {type}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Saved Items</h1>
        <p className="mt-2 text-gray-600">
          {getTotalCount()} items saved to your profile
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'jobs'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Jobs ({savedJobDetails.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'events'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Events ({savedEventDetails.length})
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'companies'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Companies ({savedCompanyDetails.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <>
            {savedJobDetails.length === 0 ? (
              <EmptyState type="Jobs" />
            ) : (
              savedJobDetails.map(job => (
                <div key={job.id} className="bg-white rounded-xl shadow-soft p-6">
                  <div className="flex justify-between">
                    <div className="flex gap-4">
                      {job.company.logo ? (
                        <img
                          src={job.company.logo}
                          alt={job.company.name}
                          className="h-12 w-12 rounded"
                        />
                      ) : (
                        <Building2 className="h-12 w-12 text-gray-400" />
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                        <p className="text-gray-600">{job.company.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem('jobs', job.id)}
                      className="text-red-600 hover:text-red-700 flex items-center"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Remove
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin size={16} className="mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign size={16} className="mr-2" />
                      {job.salary}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Briefcase size={16} className="mr-2" />
                      {job.type}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar size={16} className="mr-2" />
                      {format(new Date(job.postedDate), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <>
            {savedEventDetails.length === 0 ? (
              <EmptyState type="Events" />
            ) : (
              savedEventDetails.map(event => (
                <div key={event.id} className="bg-white rounded-xl shadow-soft p-6">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                      <p className="text-gray-600">{event.organizer}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem('events', event.id)}
                      className="text-red-600 hover:text-red-700 flex items-center"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Remove
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin size={16} className="mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar size={16} className="mr-2" />
                      {format(new Date(event.date), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock size={16} className="mr-2" />
                      {event.time}
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <>
            {savedCompanyDetails.length === 0 ? (
              <EmptyState type="Companies" />
            ) : (
              savedCompanyDetails.map(company => (
                <div key={company.id} className="bg-white rounded-xl shadow-soft p-6">
                  <div className="flex justify-between">
                    <div className="flex gap-4">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="h-12 w-12 rounded"
                        />
                      ) : (
                        <Building2 className="h-12 w-12 text-gray-400" />
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{company.name}</h3>
                        <p className="text-gray-600">{company.industry.join(', ')}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem('companies', company.id)}
                      className="text-red-600 hover:text-red-700 flex items-center"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Remove
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin size={16} className="mr-2" />
                      {company.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users size={16} className="mr-2" />
                      {company.size || 'Size not specified'}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Building2 size={16} className="mr-2" />
                      Founded {company.founded || 'N/A'}
                    </div>
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary-600 hover:text-primary-700"
                      >
                        <ExternalLink size={16} className="mr-2" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SavedItems;

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockJobs, mockCompanies, mockEvents, mockCourses } from '../data/mockData';
import { Users, Building2, Calendar, Briefcase, Settings, Search, Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import type { User, Job, Company, Event, Course, StudentUser, EmployerUser } from '../types';

type ResourceType = 'users' | 'companies' | 'jobs' | 'events' | 'courses';
type ResourceItem = User | Company | Job | Event | Course;

interface NotificationState {
  type: 'success' | 'error';
  message: string;
}

type LoadingState = {
  [K in ResourceType]: boolean;
} & {
  general: boolean;
};

// Type guards
const isUser = (item: ResourceItem): item is User => 'email' in item;
const isCompany = (item: ResourceItem): item is Company => 'industry' in item;
const isJob = (item: ResourceItem): item is Job => 'title' in item && 'company' in item;
const isEvent = (item: ResourceItem): item is Event => 'date' in item && 'organizer' in item;
const isCourse = (item: ResourceItem): item is Course => 'title' in item && 'tags' in item;

const Admin = () => {
  const { user, checkPermission } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ResourceType>('users');
  const [searchQuery, setSearchQuery] = useState('');  const [loadingState, setLoadingState] = useState<LoadingState>({
    users: false,
    companies: false,
    jobs: false,
    events: false,
    courses: false,
    general: false
  });
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const setResourceLoading = (resource: ResourceType | 'general', loading: boolean) => {
    setLoadingState(prev => ({ ...prev, [resource]: loading }));
  };

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'student',
      status: 'active',
      major: 'Computer Science',
      graduationYear: 2024,
    } as StudentUser,
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@company.com',
      role: 'employer',
      status: 'active',
      company: 'Tech Corp',
      companyId: 'company-1',
    } as EmployerUser,
  ]);

  const [companies, setCompanies] = useState(mockCompanies);
  const [jobs, setJobs] = useState(mockJobs);
  const [events, setEvents] = useState(mockEvents);
  const [courses, setCourses] = useState(mockCourses);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const getCurrentResource = (): ResourceItem[] => {
    switch (activeTab) {
      case 'users':
        return users;
      case 'companies':
        return companies;
      case 'jobs':
        return jobs;
      case 'events':
        return events;
      case 'courses':
        return courses;
      default:
        return [];
    }
  };
  const handleDelete = async (type: ResourceType, id: string) => {
    if (!checkPermission('delete', type)) {
      showNotification('error', 'You do not have permission to delete this item');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    setResourceLoading(type, true);
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      switch (type) {
        case 'users':
          setUsers(users.filter(user => user.id !== id));
          break;
        case 'companies':
          setCompanies(companies.filter(company => company.id !== id));
          break;
        case 'jobs':
          setJobs(jobs.filter(job => job.id !== id));
          break;
        case 'events':
          setEvents(events.filter(event => event.id !== id));
          break;
        case 'courses':
          setCourses(courses.filter(course => course.id !== id));
          break;
      }

      showNotification('success', `${type.slice(0, -1)} deleted successfully`);
    } catch (error) {
      console.error('Delete failed:', error);
      showNotification('error', `Failed to delete ${type.slice(0, -1)}`);
    } finally {
      setResourceLoading(type, false);
    }
  };
  const handleStatusChange = async (userId: string, newStatus: User['status']) => {
    if (!checkPermission('edit', 'users')) {
      showNotification('error', 'You do not have permission to change user status');
      return;
    }

    setResourceLoading('users', true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      showNotification('success', 'User status updated successfully');
    } catch (error) {
      console.error('Status update failed:', error);
      showNotification('error', 'Failed to update user status');
    } finally {
      setResourceLoading('users', false);
    }
  };
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const items = getCurrentResource();

    return items.filter(item => {
      if (isUser(item)) {
        return item.name.toLowerCase().includes(query) ||
               item.email.toLowerCase().includes(query);
      }
      if (isCompany(item)) {
        return item.name.toLowerCase().includes(query) ||
               (item.description?.toLowerCase() ?? '').includes(query);
      }
      if (isJob(item)) {
        return item.title.toLowerCase().includes(query) ||
               (item.company?.name?.toLowerCase() ?? '').includes(query);
      }
      if (isEvent(item)) {
        return item.title.toLowerCase().includes(query) ||
               (item.description?.toLowerCase() ?? '').includes(query);
      }
      if (isCourse(item)) {
        return item.title.toLowerCase().includes(query) ||
               item.tags.some(tag => tag.toLowerCase().includes(query));
      }
      return false;
    });
  }, [activeTab, searchQuery, users, companies, jobs, events, courses]);

  const getStatusBadgeClass = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const renderTableContent = () => {
    if (filteredItems.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="px-6 py-12">
            <div className="text-center">
              <Settings size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No items found</h3>
              <p className="text-gray-600">Try adjusting your search or add new items</p>
            </div>
          </td>
        </tr>
      );
    }

    return filteredItems.map((item) => {      if (isUser(item)) {
        return (
          <tr key={item.id}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">{item.name}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">{item.email}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">{item.role}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <select
                value={item.status}
                onChange={(e) => handleStatusChange(item.id, e.target.value as User['status'])}
                className={`text-sm rounded-full px-2 py-1 ${getStatusBadgeClass(item.status)}`}
                disabled={loadingState.users}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                onClick={() => navigate(`/users/${item.id}/edit`)}
                className="text-primary-600 hover:text-primary-900 mx-2"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete('users', item.id)}
                className="text-red-600 hover:text-red-900 mx-2"
                disabled={loadingState.users}
              >
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        );
      }      if (isCompany(item)) {
        return (
          <tr key={item.id}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                {item.logo ? (
                  <img
                    src={item.logo}
                    alt={item.name}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <Building2 size={24} className="text-gray-400" />
                )}
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">{item.industry.join(', ')}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">{item.location}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                onClick={() => navigate(`/companies/${item.id}/edit`)}
                className="text-primary-600 hover:text-primary-900 mx-2"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete('companies', item.id)}
                className="text-red-600 hover:text-red-900 mx-2"
                disabled={loadingState.companies}
              >
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        );
      }      if (isJob(item)) {
        return (
          <tr key={item.id}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">{item.title}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">{item.company?.name ?? 'Unknown Company'}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">{item.type}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">{item.location}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                onClick={() => navigate(`/jobs/${item.id}/edit`)}
                className="text-primary-600 hover:text-primary-900 mx-2"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete('jobs', item.id)}
                className="text-red-600 hover:text-red-900 mx-2"
                disabled={loadingState.jobs}
              >
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        );
      }      if (isEvent(item)) {
        return (
          <tr key={item.id}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">{item.title}</div>
              <div className="text-sm text-gray-500">{item.organizer}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">
                {new Date(item.date).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-500">{item.time}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">{item.location}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">{item.type}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                onClick={() => navigate(`/events/${item.id}/edit`)}
                className="text-primary-600 hover:text-primary-900 mx-2"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete('events', item.id)}
                className="text-red-600 hover:text-red-900 mx-2"
                disabled={loadingState.events}
              >
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        );
      }      if (isCourse(item)) {
        return (
          <tr key={item.id}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">{item.title}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">{item.tags.join(', ')}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">{item.difficulty}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                onClick={() => navigate(`/courses/${item.id}/edit`)}
                className="text-primary-600 hover:text-primary-900 mx-2"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete('courses', item.id)}
                className="text-red-600 hover:text-red-900 mx-2"
                disabled={loadingState.courses}
              >
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        );
      }

      return null;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage users, companies, jobs, events, and courses</p>
      </div>

      <div className="mb-8">
        <nav className="flex space-x-4" aria-label="Tabs">
          {(['users', 'companies', 'jobs', 'events', 'courses'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'users' && <Users size={20} />}
              {tab === 'companies' && <Building2 size={20} />}
              {tab === 'jobs' && <Briefcase size={20} />}
              {tab === 'events' && <Calendar size={20} />}
              {tab === 'courses' && <BookOpen size={20} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
        <button
          onClick={() => navigate(`/${activeTab}/new`)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add {activeTab.slice(0, -1)}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {activeTab === 'users' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </>
                )}
                {activeTab === 'companies' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  </>
                )}
                {activeTab === 'jobs' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  </>
                )}
                {activeTab === 'events' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  </>
                )}
                {activeTab === 'courses' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                  </>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {renderTableContent()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;

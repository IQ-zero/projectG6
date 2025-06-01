import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockJobs, mockCompanies, mockEvents, mockCourses } from '../data/mockData';
import { 
  Users, Building2, Calendar, Briefcase, Settings, Search, Plus, Edit2, Trash2, BookOpen,
  TrendingUp, Eye, BarChart3, AlertTriangle, ExternalLink,
  CheckCircle, UserCheck, Mail
} from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';
import type { User, Job, Company, Event, Course, StudentUser, EmployerUser } from '../types';

type ResourceType = 'dashboard' | 'users' | 'companies' | 'jobs' | 'events' | 'courses';
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

// Analytics and Statistics interfaces
interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalJobs: number;
  recentJobs: number;
  totalEvents: number;
  upcomingEvents: number;
  totalCompanies: number;
  totalCourses: number;
  userGrowth: number;
  jobGrowth: number;
}

// Type guards
const isUser = (item: ResourceItem): item is User => 'email' in item;
const isCompany = (item: ResourceItem): item is Company => 'industry' in item;
const isJob = (item: ResourceItem): item is Job => 'title' in item && 'company' in item;
const isEvent = (item: ResourceItem): item is Event => 'date' in item && 'organizer' in item;
const isCourse = (item: ResourceItem): item is Course => 'title' in item && 'tags' in item;

const Admin = () => {
  const { user, checkPermission } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ResourceType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>({
    dashboard: false,
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

  // Calculate dashboard statistics
  const dashboardStats = useMemo((): DashboardStats => {
    const recentDate = subDays(new Date(), 30);
    
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      totalJobs: jobs.length,
      recentJobs: jobs.filter(j => isAfter(new Date(j.postedDate), recentDate)).length,
      totalEvents: events.length,
      upcomingEvents: events.filter(e => isAfter(new Date(e.date), new Date())).length,
      totalCompanies: companies.length,
      totalCourses: courses.length,
      userGrowth: 12.5, // Mock percentage
      jobGrowth: 8.3,   // Mock percentage
    };  }, [users, jobs, events, companies, courses]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Bulk Actions
  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.size === 0) return;

    setResourceLoading('general', true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      switch (bulkAction) {
        case 'delete':
          if (activeTab === 'users') {
            setUsers(users.filter(user => !selectedItems.has(user.id)));
          } else if (activeTab === 'jobs') {
            setJobs(jobs.filter(job => !selectedItems.has(job.id)));
          }
          showNotification('success', `${selectedItems.size} items deleted successfully`);
          break;
        case 'activate':
          if (activeTab === 'users') {
            setUsers(users.map(user => 
              selectedItems.has(user.id) ? { ...user, status: 'active' as const } : user
            ));
          }
          showNotification('success', `${selectedItems.size} users activated`);
          break;
        case 'deactivate':
          if (activeTab === 'users') {
            setUsers(users.map(user => 
              selectedItems.has(user.id) ? { ...user, status: 'inactive' as const } : user
            ));
          }
          showNotification('success', `${selectedItems.size} users deactivated`);
          break;
      }

      setSelectedItems(new Set());
      setBulkAction('');
    } catch (error) {
      showNotification('error', 'Bulk action failed');
    } finally {
      setResourceLoading('general', false);
    }
  };

  // Export functionality
  const handleExport = () => {
    const dataToExport = filteredItems.map(item => {
      if (isUser(item)) {
        return {
          id: item.id,
          name: item.name,
          email: item.email,
          role: item.role,
          status: item.status
        };
      }
      return item;
    });

    const csv = [
      Object.keys(dataToExport[0] || {}).join(','),
      ...dataToExport.map(item => Object.values(item).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();    window.URL.revokeObjectURL(url);
  };

  // Resource management functions
  const getCurrentResource = (): ResourceItem[] => {
    switch (activeTab) {
      case 'dashboard':
        return [];
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

  // Filtering logic
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const items = getCurrentResource();

    if (activeTab === 'dashboard') return [];

    let filtered = items.filter(item => {
      if (isUser(item)) {
        return item.name.toLowerCase().includes(query) ||
               item.email.toLowerCase().includes(query);
      }
      if (isCompany(item)) {
        return item.name.toLowerCase().includes(query) ||
               (item.description?.toLowerCase() ?? '').includes(query);
      }      if (isJob(item)) {
        const companyName = typeof item.company === 'string' ? item.company : item.company?.name || '';
        return item.title.toLowerCase().includes(query) ||
               companyName.toLowerCase().includes(query) ||
               item.location.toLowerCase().includes(query);
      }
      if (isEvent(item)) {
        return item.title.toLowerCase().includes(query) ||
               item.organizer.toLowerCase().includes(query) ||
               item.location.toLowerCase().includes(query);
      }
      if (isCourse(item)) {
        return item.title.toLowerCase().includes(query) ||
               (item.description?.toLowerCase() ?? '').includes(query);
      }
      return false;
    });

    // Apply filters
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => {
        if (isUser(item)) {
          return item.status === statusFilter;
        }
        return true;
      });
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = dateFilter === 'week' ? subDays(now, 7) : subDays(now, 30);
      
      filtered = filtered.filter(item => {
        if (isJob(item)) {
          return isAfter(new Date(item.postedDate), filterDate);
        }
        if (isEvent(item)) {
          return isAfter(new Date(item.date), now);
        }
        return true;
      });
    }    return filtered;
  }, [searchQuery, statusFilter, dateFilter, users, companies, jobs, events, courses, activeTab]);
  // StatCard component for dashboard
  const StatCard = ({ title, value, change, icon: Icon, color }: {
    title: string;
    value: number;
    change?: number;
    icon: React.ComponentType<any>;
    color: string;
  }) => (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-sm text-green-600">+{change}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  // Dashboard render function
  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={dashboardStats.totalUsers}
          change={dashboardStats.userGrowth}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Jobs"
          value={dashboardStats.totalJobs}
          change={dashboardStats.jobGrowth}
          icon={Briefcase}
          color="bg-green-500"
        />
        <StatCard
          title="Companies"
          value={dashboardStats.totalCompanies}
          icon={Building2}
          color="bg-purple-500"
        />
        <StatCard
          title="Upcoming Events"
          value={dashboardStats.upcomingEvents}
          icon={Calendar}
          color="bg-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('users')}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UserCheck size={20} className="mr-2 text-blue-600" />
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Briefcase size={20} className="mr-2 text-green-600" />
            Review Jobs
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar size={20} className="mr-2 text-orange-600" />
            Manage Events
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full mr-3">
                <CheckCircle size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">New user registered</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full mr-3">
                <Briefcase size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">New job posting created</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-full mr-3">
                <Calendar size={16} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Event scheduled</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle size={20} className="text-green-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Database</span>
            </div>
            <span className="text-xs text-green-600 font-medium">Healthy</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle size={20} className="text-green-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">API Services</span>
            </div>
            <span className="text-xs text-green-600 font-medium">Online</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle size={20} className="text-yellow-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Storage</span>
            </div>
            <span className="text-xs text-yellow-600 font-medium">75% Used</span>
          </div>        </div>      </div>
    </div>
  );

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
    }    return filteredItems.map((item) => {
      if (isUser(item)) {
        return (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={() => handleSelectItem(item.id)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  {item.avatar ? (
                    <img src={item.avatar} alt={item.name} className="h-10 w-10 rounded-full" />
                  ) : (
                    <span className="text-primary-700 font-medium">
                      {item.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.email}</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                item.role === 'admin' ? 'bg-red-100 text-red-800' :
                item.role === 'employer' ? 'bg-blue-100 text-blue-800' : 
                'bg-green-100 text-green-800'
              }`}>
                {item.role}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <select
                value={item.status}
                onChange={(e) => handleStatusChange(item.id, e.target.value as User['status'])}
                className={`text-xs rounded-full px-3 py-1 border-0 font-medium ${getStatusBadgeClass(item.status)}`}
                disabled={loadingState.users}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">
                {format(new Date(), 'MMM d, yyyy')}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div className="flex items-center justify-end space-x-2">
                <button
                  className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button
                  className="text-blue-400 hover:text-blue-600 p-1 rounded"
                  title="Send Email"
                >
                  <Mail size={16} />
                </button>
                <button
                  onClick={() => navigate(`/users/${item.id}/edit`)}
                  className="text-primary-600 hover:text-primary-900 p-1 rounded"
                  title="Edit User"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete('users', item.id)}
                  className="text-red-600 hover:text-red-900 p-1 rounded"
                  disabled={loadingState.users}
                  title="Delete User"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        );
      }      if (isCompany(item)) {
        return (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={() => handleSelectItem(item.id)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  {item.logo ? (
                    <img src={item.logo} alt={item.name} className="h-10 w-10 rounded-lg" />
                  ) : (
                    <Building2 size={20} className="text-gray-400" />
                  )}
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.size} employees</div>
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
              <div className="flex items-center justify-end space-x-2">
                <button
                  className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  title="Visit Website"
                >
                  <ExternalLink size={16} />
                </button>
                <button
                  onClick={() => navigate(`/companies/${item.id}/edit`)}
                  className="text-primary-600 hover:text-primary-900 p-1 rounded"
                  title="Edit Company"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete('companies', item.id)}
                  className="text-red-600 hover:text-red-900 p-1 rounded"
                  disabled={loadingState.companies}
                  title="Delete Company"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        );
      }      if (isJob(item)) {
        return (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={() => handleSelectItem(item.id)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">{item.title}</div>
              <div className="text-sm text-gray-500">{item.type}</div>
            </td>            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">{typeof item.company === 'string' ? item.company : item.company?.name || 'Unknown Company'}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">{item.type}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">{item.location}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div className="flex items-center justify-end space-x-2">
                <button
                  className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => navigate(`/jobs/${item.id}/edit`)}
                  className="text-primary-600 hover:text-primary-900 p-1 rounded"
                  title="Edit Job"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete('jobs', item.id)}
                  className="text-red-600 hover:text-red-900 p-1 rounded"
                  disabled={loadingState.jobs}
                  title="Delete Job"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        );
      }      if (isEvent(item)) {
        return (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={() => handleSelectItem(item.id)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">{item.title}</div>
              <div className="text-sm text-gray-500">{item.organizer}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">
                {format(new Date(item.date), 'MMM d, yyyy')}
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
              <div className="flex items-center justify-end space-x-2">
                <button
                  className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => navigate(`/events/${item.id}/edit`)}
                  className="text-primary-600 hover:text-primary-900 p-1 rounded"
                  title="Edit Event"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete('events', item.id)}
                  className="text-red-600 hover:text-red-900 p-1 rounded"
                  disabled={loadingState.events}
                  title="Delete Event"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        );
      }      if (isCourse(item)) {
        return (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={() => handleSelectItem(item.id)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">{item.title}</div>
              <div className="text-sm text-gray-500">{item.difficulty} Level</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {tag}
                  </span>
                ))}
                {item.tags.length > 2 && (
                  <span className="text-xs text-gray-500">+{item.tags.length - 2} more</span>
                )}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                item.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                item.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {item.difficulty}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div className="flex items-center justify-end space-x-2">
                <button
                  className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => navigate(`/courses/${item.id}/edit`)}
                  className="text-primary-600 hover:text-primary-900 p-1 rounded"
                  title="Edit Course"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete('courses', item.id)}
                  className="text-red-600 hover:text-red-900 p-1 rounded"
                  disabled={loadingState.courses}
                  title="Delete Course"
                >
                  <Trash2 size={16} />
                </button>
              </div>
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
      </div>      <div className="mb-8">
        <nav className="flex space-x-4" aria-label="Tabs">
          {(['dashboard', 'users', 'companies', 'jobs', 'events', 'courses'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'dashboard' && <BarChart3 size={20} />}
              {tab === 'users' && <Users size={20} />}
              {tab === 'companies' && <Building2 size={20} />}
              {tab === 'jobs' && <Briefcase size={20} />}
              {tab === 'events' && <Calendar size={20} />}
              {tab === 'courses' && <BookOpen size={20} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}        </nav>
      </div>

      {activeTab === 'dashboard' ? (
        renderDashboard()
      ) : (
        <>          <div className="mb-8 flex flex-col md:flex-row gap-4">
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
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Settings size={20} />
                Filters
              </button>
              <button
                onClick={() => navigate(`/${activeTab}/new`)}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Add {activeTab.slice(0, -1)}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeTab === 'users' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                )}
                
                {(activeTab === 'jobs' || activeTab === 'events') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Range
                    </label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm"
                    >
                      <option value="all">All Time</option>
                      <option value="week">Past Week</option>
                      <option value="month">Past Month</option>
                    </select>
                  </div>
                )}
                
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setDateFilter('all');
                      setSearchQuery('');
                    }}
                    className="btn btn-secondary w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}<div className="bg-white rounded-xl shadow-soft overflow-hidden">
            {/* Bulk Actions Bar */}
            {selectedItems.size > 0 && (
              <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-blue-900">
                      {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <select
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value)}
                      className="text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Choose action...</option>
                      {activeTab === 'users' && (
                        <>
                          <option value="activate">Activate</option>
                          <option value="deactivate">Deactivate</option>
                        </>
                      )}
                      <option value="delete">Delete</option>
                    </select>
                    <button
                      onClick={handleBulkAction}
                      disabled={!bulkAction || loadingState.general}
                      className="btn btn-primary text-sm"
                    >
                      {loadingState.general ? 'Processing...' : 'Apply'}
                    </button>
                    <button
                      onClick={handleExport}
                      className="btn btn-secondary text-sm flex items-center gap-2"
                    >
                      <ExternalLink size={16} />
                      Export
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </th>                {activeTab === 'users' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
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
            </thead>            <tbody className="bg-white divide-y divide-gray-200">
              {renderTableContent()}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default Admin;

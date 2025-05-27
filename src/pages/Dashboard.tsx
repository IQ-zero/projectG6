import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserContext';
import { mockJobs } from '../data/mockData';
import { Briefcase, Calendar, FileCheck, Target, TrendingUp, Building2, Award } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { appliedJobs, savedJobs, registeredEvents } = useUserData();

  // Featured jobs - just a few from our mock data
  const featuredJobs = mockJobs.slice(0, 3);

  // Filter upcoming events to include only registered ones
  const upcomingEvents = registeredEvents
    .filter(event => new Date(event.date) >= new Date()) // Ensure the event date is in the future
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome section */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.name.split(' ')[0]}!</h1>
              <p className="mt-2 text-primary-100">Your career journey is on track. Here's what's happening.</p>
            </div>
            <div className="flex space-x-3">
              <Link to="/app/jobs" className="btn bg-white text-primary-700 hover:bg-primary-50">
                Browse Jobs
              </Link>
              <Link to="/app/resume" className="btn bg-primary-500 text-white hover:bg-primary-400">
                Update Resume
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center p-4">
          <div className="p-3 rounded-full bg-primary-100 mr-3">
            <Briefcase size={20} className="text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Applications</p>
            <p className="text-xl font-semibold">{appliedJobs.length}</p>
          </div>
        </div>
        
        <div className="card flex items-center p-4">
          <div className="p-3 rounded-full bg-secondary-100 mr-3">
            <FileCheck size={20} className="text-secondary-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Saved Jobs</p>
            <p className="text-xl font-semibold">{savedJobs.length}</p>
          </div>
        </div>
        
        <div className="card flex items-center p-4">
          <div className="p-3 rounded-full bg-accent-100 mr-3">
            <Calendar size={20} className="text-accent-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Upcoming Events</p>
            <p className="text-xl font-semibold">{registeredEvents.length}</p>
          </div>
        </div>
        
        <div className="card flex items-center p-4">
          <div className="p-3 rounded-full bg-success-100 mr-3">
            <Target size={20} className="text-success-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Profile Strength</p>
            <p className="text-xl font-semibold">70%</p>
          </div>
        </div>
      </section>

      {/* Application status */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Application Status</h2>
          <Link to="/app/jobs" className="text-primary-600 text-sm hover:underline">
            View All
          </Link>
        </div>
        
        {appliedJobs.length > 0 ? (
          <div className="space-y-3">
            {appliedJobs.map(application => {
              const job = mockJobs.find(j => j.id === application.jobId);
              return job ? (
                <div key={application.id} className="card p-4 hover:shadow-medium transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {job.company.logo ? (
                        <img 
                          src={job.company.logo} 
                          alt={job.company.name} 
                          className="w-10 h-10 rounded object-cover mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center mr-3">
                          <Building2 size={20} className="text-gray-500" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.company.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`badge ${
                        application.status === 'applied' ? 'badge-primary' :
                        application.status === 'review' ? 'badge-warning' :
                        application.status === 'interview' ? 'badge-accent' :
                        application.status === 'offer' ? 'badge-success' :
                        'badge-error'
                      }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Applied on {new Date(application.appliedDate).toLocaleDateString()}
                    </p>
                    <Link to={`/app/jobs/${job.id}`} className="text-primary-600 text-sm hover:underline">
                      View Details
                    </Link>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        ) : (
          <div className="card p-6 text-center">
            <Briefcase size={24} className="mx-auto mb-2 text-gray-400" />
            <h3 className="font-medium text-gray-700 mb-1">No applications yet</h3>
            <p className="text-sm text-gray-500 mb-4">Start applying to jobs to track your applications here.</p>
            <Link to="/app/jobs" className="btn btn-primary">
              Browse Jobs
            </Link>
          </div>
        )}
      </section>

      {/* Two column layout for recommended jobs and events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended jobs */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recommended For You</h2>
            <Link to="/app/jobs" className="text-primary-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {featuredJobs.map(job => (
              <div key={job.id} className="card p-4 hover:shadow-medium transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex">
                    {job.company.logo ? (
                      <img 
                        src={job.company.logo} 
                        alt={job.company.name} 
                        className="w-12 h-12 rounded object-cover mr-4"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center mr-4">
                        <Building2 size={24} className="text-gray-500" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{job.title}</h3>
                      <p className="text-sm text-gray-600 mb-1">{job.company.name} • {job.location}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="badge badge-primary">{job.type}</span>
                        {job.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="badge badge-secondary">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-success-600">{job.salary}</p>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button className="btn btn-outline text-sm py-1.5 px-3">Save</button>
                  <Link to={`/app/jobs/${job.id}`} className="btn btn-primary text-sm py-1.5 px-3">
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming events and skills */}
        <section className="space-y-6">
          {/* Upcoming events */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Upcoming Events</h2>
              <Link to="/app/events" className="text-primary-600 text-sm hover:underline">
                View All
              </Link>
            </div>
            
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <div key={event.id} className="card p-4 hover:shadow-medium transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`badge ${
                        event.type === 'workshop' ? 'badge-primary' :
                        event.type === 'career_fair' ? 'badge-secondary' :
                        event.type === 'info_session' ? 'badge-accent' :
                        'badge-success'
                      }`}>
                        {event.type.replace('_', ' ')}
                      </span>
                      <p className="text-sm text-gray-500">{event.date}</p>
                    </div>
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {event.startTime} - {event.endTime}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {event.virtual ? 'Virtual Event' : event.location}
                    </p>
                    <div className="mt-3">
                      <Link to={`/app/events/${event.id}`} className="text-primary-600 text-sm hover:underline">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card p-6 text-center">
                  <Calendar size={24} className="mx-auto mb-2 text-gray-400" />
                  <h3 className="font-medium text-gray-700 mb-1">No upcoming events</h3>
                  <p className="text-sm text-gray-500 mb-4">Register for events to see them here.</p>
                  <Link to="/app/events" className="btn btn-primary">
                    Browse Events
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Skills section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Skills Progress</h2>
              <Link to="/app/profile" className="text-primary-600 text-sm hover:underline">
                Update Skills
              </Link>
            </div>
            
            <div className="card p-4">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">JavaScript</span>
                    <span className="text-sm text-gray-500">85%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-primary-500 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">React</span>
                    <span className="text-sm text-gray-500">70%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-secondary-500 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Node.js</span>
                    <span className="text-sm text-gray-500">60%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-accent-500 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
              
              {/* Divider between Skills Progress and Recommended Courses */}
              <div className="mt-6 border-t border-gray-200"></div>

              {/* Recommended Courses */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Award size={18} className="text-accent-500 mr-2" />
                    <span className="text-lg font-semibold">Recommended Courses</span>
                  </div>
                  <Link to="/app/courses" className="text-primary-600 text-sm hover:underline bg-white px-3 py-1 rounded shadow hover:shadow-md transition-shadow">
                    View All
                  </Link>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <li className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <Link to="/app/learning/advanced-react-patterns" className="block text-sm font-medium text-gray-800 hover:text-primary-600">
                      Advanced React Patterns
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">Master advanced techniques in React development.</p>
                  </li>
                  <li className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <Link to="/app/learning/full-stack-js" className="block text-sm font-medium text-gray-800 hover:text-primary-600">
                      Full-Stack JavaScript Development
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">Learn to build full-stack applications with JavaScript.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Career insights */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Career Insights</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4 flex flex-col items-center text-center">
            <div className="p-3 rounded-full bg-primary-100 mb-3">
              <TrendingUp size={24} className="text-primary-600" />
            </div>
            <h3 className="font-medium mb-1">Industry Trends</h3>
            <p className="text-sm text-gray-600">
              Tech job postings are up 15% this quarter. Data science roles growing fastest.
            </p>
          </div>
          
          <div className="card p-4 flex flex-col items-center text-center">
            <div className="p-3 rounded-full bg-secondary-100 mb-3">
              <Building2 size={24} className="text-secondary-600" />
            </div>
            <h3 className="font-medium mb-1">Top Hiring Companies</h3>
            <p className="text-sm text-gray-600">
              TechVision, FinanceHub, and MediHealth have the most open positions this month.
            </p>
          </div>
          
          <div className="card p-4 flex flex-col items-center text-center">
            <div className="p-3 rounded-full bg-accent-100 mb-3">
              <Award size={24} className="text-accent-600" />
            </div>
            <h3 className="font-medium mb-1">In-Demand Skills</h3>
            <p className="text-sm text-gray-600">
              Cloud computing, data analysis, and AI/ML top the list of most requested skills.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
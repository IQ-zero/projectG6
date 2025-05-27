import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Briefcase, FileText, Calendar, Building2, MessagesSquare, ChevronRight, CheckCircle, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <GraduationCap size={32} className="text-primary-600" />
              <span className="ml-2 text-xl font-bold text-primary-900">CareerConnect</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#benefits" className="text-gray-600 hover:text-gray-900">Benefits</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900">Testimonials</a>
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
            <div className="md:hidden">
              {/* Mobile menu button would go here */}
              <button className="text-gray-600 hover:text-gray-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Your Career Journey <span className="text-primary-600">Starts Here</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-2xl">
                CareerConnect helps university students build their professional profile, connect with employers, and land their dream jobs.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
                  Get Started
                </Link>
                <a href="#features" className="btn btn-outline text-lg px-8 py-3">
                  Learn More
                </a>
              </div>
              <div className="mt-8">
                <p className="text-sm text-gray-600 flex items-center">
                  <CheckCircle size={16} className="text-success-500 mr-2" />
                  Trusted by 50+ universities and 10,000+ students
                </p>
              </div>
            </div>
            <div className="lg:w-1/2 lg:pl-8 animate-fade-in">
              <img 
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Students using CareerConnect" 
                className="rounded-xl shadow-xl"
              />
            </div>
          </div>
        </div>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary-50 rounded-bl-full -z-10 opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-secondary-50 rounded-tr-full -z-10 opacity-70"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Everything You Need to Succeed</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              CareerConnect provides all the tools and resources you need to launch your career.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-soft p-6 transition-all hover:shadow-medium">
              <div className="p-3 bg-primary-100 rounded-full w-fit mb-4">
                <FileText size={24} className="text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Resume Builder</h3>
              <p className="text-gray-600">
                Create professional resumes with our easy-to-use builder. Get AI-powered feedback to make your resume stand out.
              </p>
              <Link to="/register" className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700">
                Learn more <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-soft p-6 transition-all hover:shadow-medium">
              <div className="p-3 bg-secondary-100 rounded-full w-fit mb-4">
                <Briefcase size={24} className="text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Job Matching</h3>
              <p className="text-gray-600">
                Get personalized job recommendations based on your skills, interests, and career goals.
              </p>
              <Link to="/register" className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700">
                Learn more <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-soft p-6 transition-all hover:shadow-medium">
              <div className="p-3 bg-accent-100 rounded-full w-fit mb-4">
                <Building2 size={24} className="text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Company Insights</h3>
              <p className="text-gray-600">
                Research companies, connect with alumni, and discover insider information to ace your interviews.
              </p>
              <Link to="/register" className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700">
                Learn more <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-soft p-6 transition-all hover:shadow-medium">
              <div className="p-3 bg-success-100 rounded-full w-fit mb-4">
                <Calendar size={24} className="text-success-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Career Events</h3>
              <p className="text-gray-600">
                Stay updated on career fairs, workshops, and networking events. Never miss an opportunity to connect.
              </p>
              <Link to="/register" className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700">
                Learn more <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-soft p-6 transition-all hover:shadow-medium">
              <div className="p-3 bg-warning-100 rounded-full w-fit mb-4">
                <MessagesSquare size={24} className="text-warning-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Career Coaching</h3>
              <p className="text-gray-600">
                Book sessions with career advisors for personalized guidance on your career journey.
              </p>
              <Link to="/register" className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700">
                Learn more <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-soft p-6 transition-all hover:shadow-medium">
              <div className="p-3 bg-error-100 rounded-full w-fit mb-4">
                <Briefcase size={24} className="text-error-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">One-Click Apply</h3>
              <p className="text-gray-600">
                Apply to multiple jobs with a single click. Save time and focus on preparing for interviews.
              </p>
              <Link to="/register" className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700">
                Learn more <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0 order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why Students Love CareerConnect</h2>
              <div className="mt-8 space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                      <CheckCircle size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium text-gray-900">Time-saving Tools</h3>
                    <p className="mt-2 text-gray-600">
                      Our platform automates the job search process so you can focus on what matters most.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                      <CheckCircle size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium text-gray-900">Personalized Guidance</h3>
                    <p className="mt-2 text-gray-600">
                      Get tailored recommendations based on your unique skills and career goals.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                      <CheckCircle size={24} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium text-gray-900">Exclusive Opportunities</h3>
                    <p className="mt-2 text-gray-600">
                      Access jobs and internships not available on public job boards.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link to="/register" className="btn btn-primary inline-flex items-center">
                  Start Your Journey <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 lg:pl-12 order-1 lg:order-2">
              <img 
                src="https://media.licdn.com/dms/image/v2/C4D12AQF8X-IE2UEdtg/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1577585480813?e=2147483647&v=beta&t=sSBYtsrymJsza2R5dh5UTI_mcBqSADdPBgZsEdm_d1s" 
                alt="Students using CareerConnect" 
                className="rounded-xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Success Stories</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from students who launched their careers with CareerConnect.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-soft p-6 relative">
              <div className="absolute -top-5 left-6">
                <div className="w-10 h-10 rounded-full overflow-hidden border-4 border-white shadow-sm">
                  <img 
                    src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150" 
                    alt="Student" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="pt-6">
                <p className="text-gray-600 italic mb-4">
                  "CareerConnect helped me land my dream internship at Google. The resume builder and interview prep resources were game-changers!"
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">Emily Chen</h4>
                    <p className="text-sm text-gray-500">Computer Science, Class of 2023</p>
                  </div>
                  <div className="flex text-warning-500">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-soft p-6 relative">
              <div className="absolute -top-5 left-6">
                <div className="w-10 h-10 rounded-full overflow-hidden border-4 border-white shadow-sm">
                  <img 
                    src="https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150" 
                    alt="Student" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="pt-6">
                <p className="text-gray-600 italic mb-4">
                  "The career coaching sessions were invaluable. My advisor helped me navigate multiple job offers and negotiate a higher salary!"
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">James Wilson</h4>
                    <p className="text-sm text-gray-500">Business Administration, Class of 2022</p>
                  </div>
                  <div className="flex text-warning-500">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-soft p-6 relative">
              <div className="absolute -top-5 left-6">
                <div className="w-10 h-10 rounded-full overflow-hidden border-4 border-white shadow-sm">
                  <img 
                    src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150" 
                    alt="Student" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="pt-6">
                <p className="text-gray-600 italic mb-4">
                  "As a first-generation college student, I had no idea where to start. CareerConnect guided me through every step of my job search."
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">Sophia Martinez</h4>
                    <p className="text-sm text-gray-500">Psychology, Class of 2023</p>
                  </div>
                  <div className="flex text-warning-500">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Launch Your Career?</h2>
          <p className="mt-4 text-xl text-primary-100 max-w-3xl mx-auto">
            Join thousands of students who have found their dream jobs through CareerConnect.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link to="/register" className="btn bg-white text-primary-700 hover:bg-primary-50 text-lg px-8 py-3">
              Sign Up Now
            </Link>
            <Link to="/login" className="btn border-2 border-white text-white hover:bg-primary-700 text-lg px-8 py-3">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <GraduationCap size={28} className="text-white" />
                <span className="ml-2 text-xl font-bold text-white">CareerConnect</span>
              </div>
              <p className="text-sm">
                Connecting university students with career opportunities and resources.
              </p>
              <div className="mt-4 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">For Students</a></li>
                <li><a href="#" className="hover:text-white">For Employers</a></li>
                <li><a href="#" className="hover:text-white">For Universities</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Career Guides</a></li>
                <li><a href="#" className="hover:text-white">Resume Templates</a></li>
                <li><a href="#" className="hover:text-white">Interview Tips</a></li>
                <li><a href="#" className="hover:text-white">Career Resources</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} CareerConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
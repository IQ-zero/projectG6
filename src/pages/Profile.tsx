import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Phone,
  MapPin,
  Edit2,
  Save,
  GraduationCap,
  Plus,
  X,
  Globe,
  Github,
  Linkedin,
  Link as LinkIcon,
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components imports
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Textarea from '../components/common/Textarea';

interface FormData {
    // Common fields
    name: string;
    email: string;
    location: string;
    phone: string;
    bio: string;
    
    // Student-specific fields
    major?: string;
    graduationYear?: string;
    gpa?: string;
    university?: string;
    expectedSalary?: string;
    preferredJobType?: string;
    availability?: string;
    
    // Employer-specific fields
    company?: string;
    position?: string;
    department?: string;
    employmentType?: string;
    companyId?: string;
    
    // Skills and links for all users
    skills: string[];
    linkedIn: string;
    github: string;
    portfolio: string;
    newSkill: string;
    
    // Other fields
    avatar?: string;
}

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.avatar || '');
  const predefinedSkills = ['JavaScript', 'React', 'Node.js', 'Python', 'CSS', 'HTML', 'SQL'];
  
  const [formData, setFormData] = useState<FormData>({
    // Common fields
    name: user?.name || '',
    email: user?.email || '',
    location: '',
    phone: '',
    bio: '',
    
    // Initialize all fields with empty values
    major: '',
    graduationYear: '',
    gpa: '',
    university: '',
    expectedSalary: '',
    preferredJobType: '',
    availability: '',
    company: '',
    position: '',
    department: '',
    employmentType: '',
    
    // Common fields continued
    skills: [],
    linkedIn: '',
    github: '',
    portfolio: '',
    newSkill: ''
});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Handle input changes for text, number, and textarea inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: value
    }));
};

  // Handle password input changes
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Add a new skill
  const addSkill = useCallback(() => {
    if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, formData.newSkill.trim()],
        newSkill: '',
      }));
    }
  }, [formData.newSkill, formData.skills]);

  // Add a predefined skill
  const addPredefinedSkill = useCallback((skill: string) => {
    if (!formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
  }, [formData.skills]);

  // Remove a skill
  const removeSkill = useCallback((skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
        // Filter out empty fields based on user role
        const filteredData = Object.fromEntries(
            Object.entries(formData).filter(([key, _]) => {
                if (user?.role === 'student') {
                    return !['company', 'position', 'department', 'employmentType',
                            'companyId'].includes(key);
                }
                if (user?.role === 'employer') {
                    return !['major', 'graduationYear', 'gpa', 'university', 'expectedSalary',
                            'preferredJobType', 'availability'].includes(key);
                }
                if (user?.role === 'admin') {
                    // Admins only need basic info
                    return ['name', 'email', 'location', 'phone', 'bio', 'skills',
                            'linkedIn', 'github', 'portfolio'].includes(key);
                }
                return true;
            })
        );
        
        // Update the user profile
        const response = await fetch('/api/profile/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(filteredData),
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        // Show success message
        toast.success('Profile updated successfully');
        
        // Update the user context if needed
        if (updateUser) {
            updateUser({ ...user, ...filteredData });
        }

        // Exit edit mode
        setIsEditing(false);
    } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
    }
};

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        {/* Header */}
        <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-800"></div>

        {/* Profile Content */}
        <div className="px-6 py-8">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start -mt-16 mb-6">
            <div className="relative group">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={formData.name}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                  aria-label="Profile image"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-primary-100 flex items-center justify-center">
                  <User size={40} className="text-primary-600" />
                </div>
              )}
              {isEditing && (
                <label
                  htmlFor="profileImage"
                  className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full shadow-md hover:bg-primary-700 transition-colors cursor-pointer"
                  aria-label="Change profile image"
                >
                  <Edit2 size={14} />
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900" aria-label="User name">{formData.name}</h1>
              <p className="text-gray-600" aria-label="User major">{formData.major} Student</p>
              <p className="text-sm text-gray-500" aria-label="Graduation year">Class of {formData.graduationYear}</p>
              <p className="text-sm text-gray-500" aria-label="User role">Role: {user?.role || 'Not specified'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} aria-label="Profile form">
            <div className="space-y-8">
              {/* Personal Information */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm py-2 px-4 flex items-center transition-colors"
                    aria-label={isEditing ? "Save changes" : "Edit profile"}
                  >
                    {isEditing ? (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit2 size={16} className="mr-2" />
                        Edit Profile
                      </>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    {isEditing ? (
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {isEditing ? (
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="input"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    {isEditing ? (
                      <Input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="input"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center">
                        <MapPin size={16} className="mr-2 text-gray-400" />
                        {formData.location || 'Not specified'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="input"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center">
                        <Phone size={16} className="mr-2 text-gray-400" />
                        {formData.phone || 'Not specified'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  {isEditing ? (
                    <Textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="input min-h-[100px]"
                      placeholder="Write a brief bio about yourself..."
                    />
                  ) : (
                    <p className="text-gray-900">{formData.bio || 'No bio provided'}</p>
                  )}
                </div>
              </div>

              {/* Education */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Education</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <GraduationCap size={20} className="text-gray-400 mr-3 mt-1" />
                    <div>
                      {isEditing ? (
                        <div className="space-y-4">
                          <Input
                            type="text"
                            name="major"
                            value={formData.major}
                            onChange={handleInputChange}
                            className="input"
                            placeholder="Major"
                          />
                          <div className="flex items-center space-x-4">
                            <Input
                              type="number"
                              name="graduationYear"
                              value={formData.graduationYear || ''}
                              onChange={(e) =>
                                setFormData({ ...formData, graduationYear: e.target.value })
                              }
                              className="input w-32"
                              placeholder="Year"
                            />
                            <span className="text-gray-500">Expected Graduation Year</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-medium text-gray-900">{formData.major}</h3>
                          <p className="text-gray-600">University of Technology</p>
                          <p className="text-sm text-gray-500">Expected Graduation: {formData.graduationYear}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                {isEditing ? (
                  <div className="space-y-4">
                    {/* Add Custom Skill */}
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        name="newSkill"
                        value={formData.newSkill}
                        onChange={handleInputChange}
                        className="input flex-1"
                        placeholder="Add a new skill"
                        aria-label="Add a new skill"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="bg-primary-600 hover:bg-primary-700 text-white rounded-md p-2 transition-colors"
                        aria-label="Add skill"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Predefined Skills */}
                    <div className="flex flex-wrap gap-2">
                      {predefinedSkills.map((skill, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => addPredefinedSkill(skill)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            formData.skills.includes(skill)
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-primary-100 hover:text-primary-700'
                          }`}
                          aria-label={`Add predefined skill ${skill}`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>

                    {/* Selected Skills */}
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm flex items-center"
                          aria-label={`Skill: ${skill}`}
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 text-primary-400 hover:text-primary-600"
                            aria-label={`Remove skill ${skill}`}
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                        aria-label={`Skill: ${skill}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Academic Information - For Students Only */}
              {user?.role === 'student' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Academic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="university"
                          value={formData.university}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="Enter your university"
                        />
                      ) : (
                        <p className="text-gray-900">{formData.university || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="4.0"
                          name="gpa"
                          value={formData.gpa}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="Enter your GPA"
                        />
                      ) : (
                        <p className="text-gray-900">{formData.gpa || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expected Salary</label>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="expectedSalary"
                          value={formData.expectedSalary}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="e.g., $50,000 - $70,000"
                        />
                      ) : (
                        <p className="text-gray-900">{formData.expectedSalary || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Job Type</label>
                      {isEditing ? (
                        <Select
                          name="preferredJobType"
                          value={formData.preferredJobType}
                          onChange={handleInputChange}
                          className="input"
                          options={[
                            { value: '', label: 'Select job type' },
                            { value: 'fulltime', label: 'Full Time' },
                            { value: 'parttime', label: 'Part Time' },
                            { value: 'internship', label: 'Internship' },
                            { value: 'contract', label: 'Contract' }
                          ]}
                        />
                      ) : (
                        <p className="text-gray-900">{formData.preferredJobType || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="availability"
                          value={formData.availability}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="e.g., Available from June 2025"
                        />
                      ) : (
                        <p className="text-gray-900">{formData.availability || 'Not specified'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Employment Information - For Employers Only */}
              {user?.role === 'employer' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Employment Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="input"
                        />
                      ) : (
                        <p className="text-gray-900">{formData.company || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="position"
                          value={formData.position}
                          onChange={handleInputChange}
                          className="input"
                        />
                      ) : (
                        <p className="text-gray-900">{formData.position || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="input"
                        />
                      ) : (
                        <p className="text-gray-900">{formData.department || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                      {isEditing ? (
                        <Select
                          name="employmentType"
                          value={formData.employmentType}
                          onChange={handleInputChange}
                          className="input"
                          options={[
                            { value: '', label: 'Select type' },
                            { value: 'fulltime', label: 'Full Time' },
                            { value: 'parttime', label: 'Part Time' },
                            { value: 'contract', label: 'Contract' }
                          ]}
                        />
                      ) : (
                        <p className="text-gray-900">{formData.employmentType || 'Not specified'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Administrative Information - For Admins Only */}
              {user?.role === 'admin' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Administrative Information</h2>
                  <p className="text-gray-600">As an administrator, you have access to manage the platform and its users.</p>
                </div>
              )}

              {/* Change Password */}
              {isEditing && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <Input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="input"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <Input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="input"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <Input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="input"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Social Links */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Links</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <Linkedin size={16} className="mr-2" /> LinkedIn Profile
                    </label>
                    {isEditing ? (
                      <Input
                        type="url"
                        name="linkedIn"
                        value={formData.linkedIn}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="https://linkedin.com/in/username"
                      />
                    ) : (
                      <a
                        href={formData.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        <Globe size={16} className="mr-2" />
                        {formData.linkedIn || 'Not provided'}
                      </a>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <Github size={16} className="mr-2" /> GitHub Profile
                    </label>
                    {isEditing ? (
                      <Input
                        type="url"
                        name="github"
                        value={formData.github}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="https://github.com/username"
                      />
                    ) : (
                      <a
                        href={formData.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        <Globe size={16} className="mr-2" />
                        {formData.github || 'Not provided'}
                      </a>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <LinkIcon size={16} className="mr-2" /> Portfolio Website
                    </label>
                    {isEditing ? (
                      <Input
                        type="url"
                        name="portfolio"
                        value={formData.portfolio}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="https://yourportfolio.com"
                      />
                    ) : (
                      <a
                        href={formData.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        <Globe size={16} className="mr-2" />
                        {formData.portfolio || 'Not provided'}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md py-2 px-4 transition-colors"
                    aria-label="Cancel editing"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white rounded-md py-2 px-4 transition-colors"
                    aria-label="Save changes"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
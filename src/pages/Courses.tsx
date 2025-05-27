import React, { useState } from 'react';

const mockCourses = [
  { 
    title: 'Advanced React Patterns', 
    description: 'Master advanced techniques in React development.', 
    tags: ['React', 'Frontend'], 
    difficulty: 'Advanced', 
    image: 'https://via.placeholder.com/150?text=React+Patterns' 
  },
  { 
    title: 'Full-Stack JavaScript Development', 
    description: 'Learn to build full-stack applications with JavaScript.', 
    tags: ['JavaScript', 'Backend'], 
    difficulty: 'Intermediate', 
    image: 'https://via.placeholder.com/150?text=Full-Stack+JS' 
  },
  { 
    title: 'Node.js Performance Optimization', 
    description: 'Optimize Node.js applications for better performance.', 
    tags: ['Node.js', 'Backend'], 
    difficulty: 'Advanced', 
    image: 'https://via.placeholder.com/150?text=Node.js+Optimization' 
  },
  { 
    title: 'React Testing with Jest', 
    description: 'Learn to test React applications using Jest.', 
    tags: ['React', 'Testing'], 
    difficulty: 'Intermediate', 
    image: 'https://via.placeholder.com/150?text=React+Testing' 
  },
  { 
    title: 'Data Science with Python', 
    description: 'Analyze data and build models using Python.', 
    tags: ['Python', 'Data Science'], 
    difficulty: 'Beginner', 
    image: 'https://via.placeholder.com/150?text=Data+Science+Python' 
  },
];

const Courses: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredCourses =
    selectedCategory === 'All'
      ? mockCourses
      : mockCourses.filter(course => course.tags.includes(selectedCategory));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Explore Our Courses</h1>

      {/* Filter Options */}
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between">
        <label htmlFor="categoryFilter" className="block text-lg font-medium text-gray-700 mb-2 sm:mb-0">
          Filter by Category:
        </label>
        <select
          id="categoryFilter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input w-full sm:w-64 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="All">All Categories</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="Data Science">Data Science</option>
          <option value="Testing">Testing</option>
        </select>
      </div>

      {/* Course List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course, index) => (
          <div
            key={index}
            className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
          >
            <img 
              src={course.image} 
              alt={course.title} 
              className="w-full h-40 object-cover rounded-t-lg mb-4"
            />
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{course.title}</h2>
            <p className="text-sm text-gray-600 mb-4">{course.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {course.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 font-medium">Difficulty: {course.difficulty}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;

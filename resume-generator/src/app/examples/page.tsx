'use client';

import { useState } from 'react';

interface Example {
  id: number;
  title: string;
  role: string;
  industry: string;
  experience: string;
  preview: string;
}

const examples: Example[] = [
  {
    id: 1,
    title: 'Software Engineer Resume',
    role: 'Full Stack Developer',
    industry: 'Technology',
    experience: '5+ years',
    preview: '/examples/software-engineer.png',
  },
  {
    id: 2,
    title: 'Marketing Manager Resume',
    role: 'Digital Marketing Manager',
    industry: 'Marketing',
    experience: '3-5 years',
    preview: '/examples/marketing-manager.png',
  },
  {
    id: 3,
    title: 'Project Manager Resume',
    role: 'Senior Project Manager',
    industry: 'Business',
    experience: '7+ years',
    preview: '/examples/project-manager.png',
  },
  {
    id: 4,
    title: 'UX Designer Resume',
    role: 'Senior UX Designer',
    industry: 'Design',
    experience: '4+ years',
    preview: '/examples/ux-designer.png',
  },
];

export default function Examples() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'technology', label: 'Technology' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'business', label: 'Business' },
    { id: 'design', label: 'Design' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
        Resume Examples
      </h1>
      
      <div className="mb-8">
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          Browse through our collection of professionally written resume examples for various industries and experience levels.
        </p>
        
        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                selectedFilter === filter.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/20'
              }`}
              onClick={() => setSelectedFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Examples Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {examples.map((example) => (
          <div
            key={example.id}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="h-48 bg-gray-100 dark:bg-gray-700 relative">
              {/* Placeholder for example preview */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 text-6xl">
                <i className="fas fa-file-alt"></i>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                {example.title}
              </h3>
              
              <div className="space-y-2 mb-4">
                <p className="text-gray-600 dark:text-gray-300">
                  <i className="fas fa-briefcase mr-2"></i>
                  {example.role}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <i className="fas fa-industry mr-2"></i>
                  {example.industry}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <i className="fas fa-clock mr-2"></i>
                  {example.experience}
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  onClick={() => {
                    // Handle use as template
                  }}
                >
                  Use as Template
                </button>
                <button
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    // Handle preview
                  }}
                >
                  Preview
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
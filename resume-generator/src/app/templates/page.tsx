'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Template {
  id: number;
  name: string;
  description: string;
  preview: string;
  style: string;
}

const templates: Template[] = [
  {
    id: 1,
    name: 'Professional',
    description: 'Clean and modern design suitable for any industry',
    preview: '/templates/professional.png',
    style: 'bg-gradient-to-r from-blue-500 to-purple-500',
  },
  {
    id: 2,
    name: 'Creative',
    description: 'Stand out with a unique and artistic layout',
    preview: '/templates/creative.png',
    style: 'bg-gradient-to-r from-pink-500 to-orange-500',
  },
  {
    id: 3,
    name: 'Minimal',
    description: 'Simple and elegant design focusing on content',
    preview: '/templates/minimal.png',
    style: 'bg-gradient-to-r from-gray-500 to-gray-700',
  },
  {
    id: 4,
    name: 'Executive',
    description: 'Sophisticated design for senior positions',
    preview: '/templates/executive.png',
    style: 'bg-gradient-to-r from-green-500 to-teal-500',
  },
];

export default function Templates() {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white">
        Resume Templates
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`relative group rounded-2xl overflow-hidden shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${
              selectedTemplate === template.id ? 'ring-4 ring-purple-500' : ''
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className={`h-48 ${template.style}`}>
              {/* Placeholder for template preview */}
              <div className="absolute inset-0 flex items-center justify-center text-white text-6xl opacity-20">
                <i className="fas fa-file-alt"></i>
              </div>
            </div>
            
            <div className="p-6 bg-white dark:bg-gray-800">
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                {template.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {template.description}
              </p>
              
              <div className="flex space-x-4">
                <button
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  onClick={() => {
                    // Handle template selection
                  }}
                >
                  Use Template
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

      {/* Template preview modal can be added here */}
    </div>
  );
} 
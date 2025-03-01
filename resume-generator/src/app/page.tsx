'use client';

import { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  summary: string;
  skills: string;
  experience: string;
  education: string;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    summary: '',
    skills: '',
    experience: '',
    education: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${formData.name.replace(' ', '_')}_resume.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        throw new Error('Failed to generate resume');
      }
    } catch (error) {
      console.error('Error generating resume:', error);
      alert('Failed to generate resume. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-semibold text-center mb-8 text-gray-800 dark:text-white">
          Resume Generator
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-gray-700 dark:text-gray-200 font-medium">
              Full Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-200 font-medium">
              Email<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-gray-700 dark:text-gray-200 font-medium">
              Phone<span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="summary" className="block text-gray-700 dark:text-gray-200 font-medium">
              Professional Summary
            </label>
            <textarea
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white h-32"
              placeholder="e.g., Dedicated software engineer with 5+ years of experience..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="skills" className="block text-gray-700 dark:text-gray-200 font-medium">
              Skills
            </label>
            <textarea
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white h-32"
              placeholder="e.g., Python, JavaScript, Project Management..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="experience" className="block text-gray-700 dark:text-gray-200 font-medium">
              Experience
            </label>
            <textarea
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white h-32"
              placeholder="e.g., Software Engineer at Tech Corp (2020-Present)..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="education" className="block text-gray-700 dark:text-gray-200 font-medium">
              Education
            </label>
            <textarea
              id="education"
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white h-32"
              placeholder="e.g., BS in Computer Science, University Name (2016-2020)..."
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className={`w-full py-3 px-6 text-white font-medium rounded-lg transition-all duration-300 ${
              isGenerating
                ? 'bg-purple-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg'
            }`}
          >
            {isGenerating ? 'Generating...' : 'Generate Resume'}
          </button>
        </form>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800 dark:text-white">
          Live Preview
        </h2>
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              Personal Information
            </h3>
            <div className="text-gray-600 dark:text-gray-300">
              <p className="font-semibold">{formData.name || 'Your Name'}</p>
              <p>{formData.email || 'your.email@example.com'}</p>
              <p>{formData.phone || 'Your Phone'}</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              Professional Summary
            </h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {formData.summary || 'Your professional summary will appear here'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              Skills
            </h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {formData.skills || 'Your skills will appear here'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              Experience
            </h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {formData.experience || 'Your experience will appear here'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              Education
            </h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {formData.education || 'Your education will appear here'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
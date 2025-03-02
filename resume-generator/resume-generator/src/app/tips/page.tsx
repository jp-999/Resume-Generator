'use client';

interface Tip {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
}

const tips: Tip[] = [
  {
    id: 1,
    title: 'Keep it Concise',
    description: 'Limit your resume to 1-2 pages. Focus on relevant experience and achievements that directly relate to the job you're applying for.',
    icon: 'fa-file-lines',
    category: 'Format',
  },
  {
    id: 2,
    title: 'Use Action Words',
    description: 'Start bullet points with strong action verbs like "achieved," "implemented," "developed," or "managed" to highlight your accomplishments.',
    icon: 'fa-bolt',
    category: 'Content',
  },
  {
    id: 3,
    title: 'Quantify Achievements',
    description: 'Include specific numbers and metrics to demonstrate your impact, such as "increased sales by 25%" or "managed a team of 10 developers."',
    icon: 'fa-chart-line',
    category: 'Content',
  },
  {
    id: 4,
    title: 'Customize for Each Job',
    description: 'Tailor your resume to match the job description by highlighting relevant skills and experience for each application.',
    icon: 'fa-bullseye',
    category: 'Strategy',
  },
  {
    id: 5,
    title: 'Use Keywords',
    description: 'Include industry-specific keywords from the job description to pass Applicant Tracking Systems (ATS).',
    icon: 'fa-key',
    category: 'Strategy',
  },
  {
    id: 6,
    title: 'Proofread Carefully',
    description: 'Check for spelling, grammar, and formatting consistency. Have someone else review your resume as well.',
    icon: 'fa-spell-check',
    category: 'Format',
  },
];

export default function Tips() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
        Resume Writing Tips
      </h1>
      
      <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
        Follow these professional tips to create a compelling resume that stands out to employers
        and helps you land your dream job.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tips.map((tip) => (
          <div
            key={tip.id}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-600 text-xl">
                <i className={`fas ${tip.icon}`}></i>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {tip.title}
                </h3>
                <span className="text-sm text-purple-600 dark:text-purple-400">
                  {tip.category}
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300">
              {tip.description}
            </p>
          </div>
        ))}
      </div>

      {/* Additional Resources Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          Additional Resources
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <a
            href="#"
            className="block p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600">
                <i className="fas fa-book"></i>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-800 dark:text-white">
                Resume Writing Guide
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive guide with detailed instructions and best practices.
            </p>
          </a>
          
          <a
            href="#"
            className="block p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600">
                <i className="fas fa-video"></i>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-800 dark:text-white">
                Video Tutorials
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Step-by-step video guides for creating an effective resume.
            </p>
          </a>
        </div>
      </div>
    </div>
  );
} 
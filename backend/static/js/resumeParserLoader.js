/**
 * Resume Parser Library Loader
 * 
 * This script loads the resume parser library and makes it available globally.
 */

(function() {
    // Define the required components
    const components = [
        // Core parser
        '/static/lib/parse-resume-from-pdf/index.js',
        '/static/lib/parse-resume-from-pdf/read-Pdf.js',
        '/static/lib/parse-resume-from-pdf/group-text-items-into-lines.js',
        '/static/lib/parse-resume-from-pdf/group-lines-into-sections.js',
        
        // Extract resume sections
        '/static/lib/parse-resume-from-pdf/extract-resume-from-sections/index.js',
        '/static/lib/parse-resume-from-pdf/extract-resume-from-sections/extractProfile.js',
        '/static/lib/parse-resume-from-pdf/extract-resume-from-sections/extractEducation.js',
        '/static/lib/parse-resume-from-pdf/extract-resume-from-sections/extractWorkExperience.js',
        '/static/lib/parse-resume-from-pdf/extract-resume-from-sections/extractProject.js',
        '/static/lib/parse-resume-from-pdf/extract-resume-from-sections/extractSkills.js',
        
        // Utilities
        '/static/lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points.js',
        '/static/lib/parse-resume-from-pdf/extract-resume-from-sections/lib/common-features.js',
        '/static/lib/parse-resume-from-pdf/extract-resume-from-sections/lib/feature-scoring-system.js',
        '/static/lib/parse-resume-from-pdf/extract-resume-from-sections/lib/get-section-lines.js',
        '/static/lib/parse-resume-from-pdf/extract-resume-from-sections/lib/subsection.js',
        '/static/lib/deepClone.js',
        '/static/lib/constants.js'
    ];
    
    // Store loaded modules
    const modules = {};
    
    // Create global resume parser function
    window.parseResumeFromPdf = async function(fileUrl) {
        try {
            // Ensure all components are loaded
            await loadAllComponents();
            
            // Call the parser
            if (modules['parse-resume-from-pdf/index.js'] && 
                modules['parse-resume-from-pdf/index.js'].parseResumeFromPdf) {
                return await modules['parse-resume-from-pdf/index.js'].parseResumeFromPdf(fileUrl);
            } else {
                throw new Error('Resume parser library not properly loaded');
            }
        } catch (error) {
            console.error('Error in parseResumeFromPdf:', error);
            throw error;
        }
    };
    
    // Load all required components
    async function loadAllComponents() {
        try {
            console.log('Loading resume parser components...');
            for (const path of components) {
                await loadScript(path);
            }
            console.log('All resume parser components loaded successfully');
        } catch (error) {
            console.error('Failed to load resume parser components:', error);
            throw error;
        }
    }
    
    // Function to load a script
    function loadScript(path) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = path;
            script.type = 'module';
            script.onload = () => {
                const key = path.split('/').pop();
                modules[key] = window[key.replace('.js', '')];
                resolve(path);
            };
            script.onerror = () => reject(new Error(`Failed to load ${path}`));
            document.head.appendChild(script);
        });
    }
    
    // Notify that the loader is ready
    console.log('Resume parser loader initialized');
})(); 
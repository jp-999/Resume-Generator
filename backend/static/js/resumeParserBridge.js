/**
 * Resume Parser Bridge
 * 
 * This file bridges the gap between the resume parser library and the form fields
 * in the generator.html page. It converts the parsed resume data from the library format
 * to the format expected by the form.
 */

// Import the resume parser library
import { parseResumeFromPdf } from '../lib/parse-resume-from-pdf/index.js';

/**
 * Parse a resume PDF using the advanced parser library
 * @param {string} fileUrl - URL to the PDF file
 * @returns {Promise<Object>} - Parsed resume data in a format ready for form filling
 */
async function parseResumePdfWithLibrary(fileUrl) {
    try {
        console.log("Parsing resume with advanced parser library:", fileUrl);
        
        // Use the library to parse the PDF
        const parsedData = await parseResumeFromPdf(fileUrl);
        console.log("Raw parsed data from library:", parsedData);
        
        // Transform the data to match the expected format for the form
        const transformedData = transformResumeData(parsedData);
        console.log("Transformed data for form:", transformedData);
        
        return transformedData;
    } catch (error) {
        console.error("Error parsing PDF with library:", error);
        throw error;
    }
}

/**
 * Transform resume data from library format to form format
 * @param {Object} libraryData - Resume data from the parser library
 * @returns {Object} - Transformed data for form filling
 */
function transformResumeData(libraryData) {
    // Initialize the structure expected by the form
    const formData = {
        name: '',
        email: '',
        phone: '',
        summary: '',
        skills: [],
        experience: [],
        education: []
    };
    
    // Extract profile information
    if (libraryData.profile) {
        formData.name = libraryData.profile.name || '';
        formData.email = libraryData.profile.email || '';
        formData.phone = libraryData.profile.phone || '';
        formData.summary = libraryData.profile.summary || '';
    }
    
    // Extract skills
    if (libraryData.skills && libraryData.skills.featuredSkills) {
        formData.skills = libraryData.skills.featuredSkills;
    }
    
    // Extract work experience
    if (libraryData.workExperiences && Array.isArray(libraryData.workExperiences)) {
        formData.experience = libraryData.workExperiences.map(exp => ({
            company: exp.company || '',
            position: exp.jobTitle || '',
            startDate: exp.date ? formatDate(exp.date.split('-')[0]) : '',
            endDate: exp.date ? formatDate(exp.date.split('-')[1]) : '',
            description: Array.isArray(exp.descriptions) ? exp.descriptions.join('\n') : exp.descriptions || ''
        }));
    }
    
    // Extract education
    if (libraryData.educations && Array.isArray(libraryData.educations)) {
        formData.education = libraryData.educations.map(edu => ({
            institution: edu.school || '',
            degree: edu.degree || '',
            startDate: edu.date ? formatDate(edu.date.split('-')[0]) : '',
            endDate: edu.date ? formatDate(edu.date.split('-')[1]) : '',
            description: Array.isArray(edu.descriptions) ? edu.descriptions.join('\n') : edu.descriptions || ''
        }));
    }
    
    return formData;
}

/**
 * Format date string for the form inputs
 * @param {string} dateStr - Date string from the parser
 * @returns {string} - Formatted date for form input (YYYY-MM)
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    
    dateStr = dateStr.trim();
    
    // Check if it's already in YYYY-MM format
    if (/^\d{4}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }
    
    // Try to parse as a date string
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    // Extract year and month if possible
    const yearMatch = dateStr.match(/\b(20\d{2}|19\d{2})\b/);
    const monthMatch = dateStr.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i);
    
    if (yearMatch) {
        const year = yearMatch[1];
        let month = '01';
        
        if (monthMatch) {
            const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            const monthIndex = monthNames.indexOf(monthMatch[1].toLowerCase());
            if (monthIndex !== -1) {
                month = String(monthIndex + 1).padStart(2, '0');
            }
        }
        
        return `${year}-${month}`;
    }
    
    return '';
}

// Expose the function globally
window.parseResumePdfWithLibrary = parseResumePdfWithLibrary;

// Export for module usage
export { parseResumePdfWithLibrary, transformResumeData }; 
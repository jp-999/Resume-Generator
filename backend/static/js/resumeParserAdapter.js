/**
 * Resume Parser Adapter
 * 
 * This file provides an adapter to connect the resume form with either:
 * 1. The simple built-in PDF parser
 * 2. The more advanced parser from the lib folder (when available)
 */

// Ensure required functions exist
if (typeof window.updateExperiencePreview !== 'function') {
    window.updateExperiencePreview = function() {
        console.log("Updating experience preview");
        const container = document.getElementById('experience-container');
        const preview = document.getElementById('preview-experience');
        
        if (!container || !preview) {
            console.warn("Experience container or preview element not found");
            return;
        }
        
        let content = '';
        container.querySelectorAll('.experience-entry').forEach(entry => {
            const companyInput = entry.querySelector('[name="experience_company[]"]');
            const positionInput = entry.querySelector('[name="experience_position[]"]');
            const startDateInput = entry.querySelector('[name="experience_start[]"]');
            const endDateInput = entry.querySelector('[name="experience_end[]"]');
            const descriptionInput = entry.querySelector('[name="experience_description[]"]');
            
            if (!companyInput || !positionInput || !startDateInput || !endDateInput || !descriptionInput) {
                return;
            }
            
            const company = companyInput.value;
            const position = positionInput.value;
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;
            const description = descriptionInput.value;

            if (company || position || description) {
                content += `${company ? company + ' - ' : ''}${position || ''}\n`;
                content += `${startDate ? startDate : ''} ${endDate ? '- ' + endDate : ''}\n`;
                content += `${description}\n\n`;
            }
        });

        preview.innerHTML = content || 'Your experience will appear here';
    };
}

if (typeof window.updateEducationPreview !== 'function') {
    window.updateEducationPreview = function() {
        console.log("Updating education preview");
        const container = document.getElementById('education-container');
        const preview = document.getElementById('preview-education');
        
        if (!container || !preview) {
            console.warn("Education container or preview element not found");
            return;
        }
        
        let content = '';
        container.querySelectorAll('.education-entry').forEach(entry => {
            const degreeInput = entry.querySelector('[name="education_degree[]"]');
            const institutionInput = entry.querySelector('[name="education_institution[]"]');
            const startDateInput = entry.querySelector('[name="education_start[]"]');
            const endDateInput = entry.querySelector('[name="education_end[]"]');
            const descriptionInput = entry.querySelector('[name="education_description[]"]');
            
            if (!degreeInput || !institutionInput || !startDateInput || !endDateInput || !descriptionInput) {
                return;
            }
            
            const degree = degreeInput.value;
            const institution = institutionInput.value;
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;
            const description = descriptionInput.value;

            if (degree || institution || description) {
                content += `${degree ? degree + '\n' : ''}`;
                content += `${institution ? institution + '\n' : ''}`;
                content += `${startDate ? startDate : ''} ${endDate ? '- ' + endDate : ''}\n`;
                content += `${description}\n\n`;
            }
        });

        preview.innerHTML = content || 'Your education will appear here';
    };
}

if (typeof window.addEntry !== 'function') {
    window.addEntry = function(type) {
        console.log("Adding new entry for", type);
        const container = document.getElementById(`${type}-container`);
        
        if (!container) {
            console.warn(`Container for ${type} not found`);
            return;
        }
        
        const template = container.querySelector(`.${type}-entry`);
        if (!template) {
            console.warn(`Template for ${type} not found`);
            return;
        }
        
        const clone = template.cloneNode(true);
        
        // Clear all input values
        clone.querySelectorAll('input, textarea').forEach(input => {
            input.value = '';
        });
        
        // Show delete button for all entries
        const deleteButtons = container.querySelectorAll('.delete-entry');
        deleteButtons.forEach(button => button.classList.remove('hidden'));
        
        // Add delete functionality
        const deleteButton = clone.querySelector('.delete-entry');
        if (deleteButton) {
            deleteButton.classList.remove('hidden');
            deleteButton.addEventListener('click', function() {
                if (container.children.length > 1) {
                    clone.remove();
                    if (type === 'experience') {
                        window.updateExperiencePreview();
                    } else if (type === 'education') {
                        window.updateEducationPreview();
                    }
                }
            });
        }
        
        // Add the new entry to the container
        container.appendChild(clone);
    };
}

if (typeof window.updatePreviewText !== 'function') {
    window.updatePreviewText = function(previewId, text) {
        console.log("Updating preview text for", previewId);
        const preview = document.getElementById(previewId);
        if (!preview) {
            console.warn(`Preview element ${previewId} not found`);
            return;
        }
        
        preview.innerHTML = text.replace(/\n/g, '<br>');
        
        // Add animation highlight
        if (preview.classList.contains('preview-update')) {
            preview.classList.remove('preview-update');
            setTimeout(() => preview.classList.add('preview-update'), 10);
        } else {
            preview.classList.add('preview-update');
            setTimeout(() => preview.classList.remove('preview-update'), 500);
        }
    };
}

if (typeof window.fillFormWithParsedData !== 'function') {
    window.fillFormWithParsedData = function(data) {
        console.log('Filling form with parsed data:', data);

        try {
            // Reset form if needed
            document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]), textarea').forEach(input => {
                if (input.type !== 'button') {
                    input.value = '';
                }
            });
            
            // Basic Information
            if (data.name) {
                document.getElementById('name').value = data.name;
                window.updatePreviewText('preview-name', data.name);
            }
            if (data.email) {
                document.getElementById('email').value = data.email;
                window.updatePreviewText('preview-email', data.email);
            }
            if (data.phone) {
                document.getElementById('phone').value = data.phone;
                window.updatePreviewText('preview-phone', data.phone);
            }

            // Professional Summary
            if (data.summary) {
                document.getElementById('summary').value = data.summary;
                window.updatePreviewText('preview-summary', data.summary);
            }

            // Skills
            if (data.skills && data.skills.length > 0) {
                const skillsContainer = document.getElementById('skills-container');
                if (skillsContainer) {
                    const skillsEntry = skillsContainer.querySelector('.skill-entry textarea');
                    if (skillsEntry) {
                        if (Array.isArray(data.skills)) {
                            skillsEntry.value = data.skills.join('\n• ');
                        } else if (typeof data.skills === 'string') {
                            skillsEntry.value = data.skills;
                        }
                        window.updatePreviewText('preview-skills', skillsEntry.value);
                    }
                }
            }

            // Work Experience
            if (data.experience && data.experience.length > 0 && Array.isArray(data.experience)) {
                const experienceContainer = document.getElementById('experience-container');
                if (experienceContainer) {
                    // Clear existing entries except the first one
                    while (experienceContainer.children.length > 1) {
                        experienceContainer.removeChild(experienceContainer.lastChild);
                    }
                    
                    data.experience.forEach((exp, index) => {
                        if (index > 0) {
                            window.addEntry('experience');
                        }
                        
                        const entry = experienceContainer.children[index];
                        if (entry) {
                            if (exp.company) entry.querySelector('[name="experience_company[]"]').value = exp.company;
                            if (exp.position) entry.querySelector('[name="experience_position[]"]').value = exp.position;
                            if (exp.startDate) entry.querySelector('[name="experience_start[]"]').value = exp.startDate;
                            if (exp.endDate) entry.querySelector('[name="experience_end[]"]').value = exp.endDate;
                            if (exp.description) entry.querySelector('[name="experience_description[]"]').value = exp.description;
                        }
                    });
                    
                    // Update the preview
                    window.updateExperiencePreview();
                }
            }

            // Education
            if (data.education && data.education.length > 0 && Array.isArray(data.education)) {
                const educationContainer = document.getElementById('education-container');
                if (educationContainer) {
                    // Clear existing entries except the first one
                    while (educationContainer.children.length > 1) {
                        educationContainer.removeChild(educationContainer.lastChild);
                    }
                    
                    data.education.forEach((edu, index) => {
                        if (index > 0) {
                            window.addEntry('education');
                        }
                        
                        const entry = educationContainer.children[index];
                        if (entry) {
                            if (edu.degree) entry.querySelector('[name="education_degree[]"]').value = edu.degree;
                            if (edu.institution) entry.querySelector('[name="education_institution[]"]').value = edu.institution;
                            if (edu.startDate) entry.querySelector('[name="education_start[]"]').value = edu.startDate;
                            if (edu.endDate) entry.querySelector('[name="education_end[]"]').value = edu.endDate;
                            if (edu.description) entry.querySelector('[name="education_description[]"]').value = edu.description;
                        }
                    });
                    
                    // Update the preview
                    window.updateEducationPreview();
                }
            }

            console.log('Form filled successfully');
        } catch (error) {
            console.error('Error filling form with parsed data:', error);
        }
    };
}

// Only define parseAndFillResume if it doesn't already exist
if (typeof window.parseAndFillResume !== 'function') {
    console.log("Initializing parser adapter - setting up parseAndFillResume function");
    
    // Global function to parse resume PDFs using the best available parser
    window.parseAndFillResume = async function(fileUrl) {
        try {
            console.log("Adapter parsing resume:", fileUrl);
            
            let parsedData;
            
            // Try to use the advanced parser if it's available
            if (typeof window.parseResumeFromPdf === 'function') {
                console.log("Using advanced resume parser");
                try {
                    // Parse with advanced parser
                    const resumeData = await window.parseResumeFromPdf(fileUrl);
                    parsedData = transformAdvancedParserData(resumeData);
                } catch (advError) {
                    console.error("Advanced parser failed, falling back to simple parser:", advError);
                    // Fall back to simple parser
                    parsedData = await window.parseResumePdf(fileUrl);
                }
            } else {
                console.log("Using simple resume parser");
                // Use simple parser
                parsedData = await window.parseResumePdf(fileUrl);
            }
            
            // Fill the form with the parsed data
            window.fillFormWithParsedData(parsedData);
            
            return parsedData;
        } catch (error) {
            console.error("Error parsing resume:", error);
            throw error;
        }
    };
} else {
    console.log("parseAndFillResume function already exists, using existing implementation");
}

/**
 * Transform data from the advanced parser library format to form format
 */
function transformAdvancedParserData(libraryData) {
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
    
    // Add projects if available
    if (libraryData.projects && Array.isArray(libraryData.projects)) {
        formData.projects = libraryData.projects.map(proj => ({
            name: proj.project || '',
            date: proj.date || '',
            description: Array.isArray(proj.descriptions) ? proj.descriptions.join('\n') : proj.descriptions || ''
        }));
    }
    
    return formData;
}

/**
 * Format date string for the form inputs
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

/**
 * Update experience preview
 */
function updateExperiencePreview() {
    if (typeof window.updateExperiencePreview === 'function') {
        // Use the existing function if available
        window.updateExperiencePreview();
    } else {
        // Fallback implementation
        const container = document.getElementById('experience-container');
        const preview = document.getElementById('preview-experience');
        if (!container || !preview) return;
        
        let content = '';
        container.querySelectorAll('.experience-entry').forEach(entry => {
            const company = entry.querySelector('[name="experience_company[]"]').value;
            const position = entry.querySelector('[name="experience_position[]"]').value;
            const startDate = entry.querySelector('[name="experience_start[]"]').value;
            const endDate = entry.querySelector('[name="experience_end[]"]').value;
            const description = entry.querySelector('[name="experience_description[]"]').value;

            if (company || position || description) {
                content += `${company ? company + ' - ' : ''}${position || ''}\n`;
                content += `${startDate ? startDate : ''} ${endDate ? '- ' + endDate : ''}\n`;
                content += `${description}\n\n`;
            }
        });

        preview.innerHTML = content || 'Your experience will appear here';
    }
}

/**
 * Update education preview
 */
function updateEducationPreview() {
    if (typeof window.updateEducationPreview === 'function') {
        // Use the existing function if available
        window.updateEducationPreview();
    } else {
        // Fallback implementation
        const container = document.getElementById('education-container');
        const preview = document.getElementById('preview-education');
        if (!container || !preview) return;
        
        let content = '';
        container.querySelectorAll('.education-entry').forEach(entry => {
            const degree = entry.querySelector('[name="education_degree[]"]').value;
            const institution = entry.querySelector('[name="education_institution[]"]').value;
            const startDate = entry.querySelector('[name="education_start[]"]').value;
            const endDate = entry.querySelector('[name="education_end[]"]').value;
            const description = entry.querySelector('[name="education_description[]"]').value;

            if (degree || institution || description) {
                content += `${degree ? degree + '\n' : ''}`;
                content += `${institution ? institution + '\n' : ''}`;
                content += `${startDate ? startDate : ''} ${endDate ? '- ' + endDate : ''}\n`;
                content += `${description}\n\n`;
            }
        });

        preview.innerHTML = content || 'Your education will appear here';
    }
} 
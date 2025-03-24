// static/resumeParser.js

(function() {
    // File input handling
    const fileInput = document.getElementById('resumeFile');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const clearFile = document.getElementById('clearFile');
    const dropZone = document.querySelector('label[for="resumeFile"]');

    // Show selected file name
    fileInput.addEventListener('change', function(e) {
        if (this.files.length > 0) {
            fileName.textContent = this.files[0].name;
            fileInfo.classList.remove('hidden');
            showNotification('File selected: ' + this.files[0].name, 'info');
        }
    });

    // Clear selected file
    clearFile.addEventListener('click', function() {
        fileInput.value = '';
        fileInfo.classList.add('hidden');
        fileName.textContent = '';
    });

    // Drag and drop handling
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('border-purple-500', 'bg-purple-50');
    }

    function unhighlight(e) {
        dropZone.classList.remove('border-purple-500', 'bg-purple-50');
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        
        if (file) {
            // Check file type
            const fileType = file.name.split('.').pop().toLowerCase();
            if (['pdf', 'docx', 'txt'].includes(fileType)) {
                fileInput.files = dt.files;
                fileName.textContent = file.name;
                fileInfo.classList.remove('hidden');
                showNotification('File dropped: ' + file.name, 'info');
            } else {
                showNotification('Invalid file type. Please use PDF, DOCX, or TXT files.', 'error');
            }
        }
    }

    // Define the section titles mapping
    const SECTION_TITLES = {
        objective: ['objective', 'objectives'],
        summary: ['summary'],
        technology: ['technology', 'technologies'],
        experience: ['experience'],
        education: ['education'],
        skills: ['skills', 'Skills & Expertise', 'technology', 'technologies'],
        languages: ['languages'],
        courses: ['courses'],
        projects: ['projects'],
        links: ['links'],
        contacts: ['contacts'],
        positions: ['positions', 'position'],
        profiles: ['profiles', 'social connect', 'social-profiles', 'social profiles'],
        awards: ['awards'],
        honors: ['honors'],
        additional: ['additional'],
        certification: ['certification', 'certifications'],
        interests: ['interests']
    };

    // Handle resume parsing
    document.getElementById('resumeParserForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const file = fileInput.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('resume', file);

            try {
                showNotification('Parsing resume...', 'info');
                
                const response = await fetch('/parse-resume', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to parse resume. Server returned: ' + response.status);
                }

                const data = await response.json();
                console.log('Raw server response:', data);

                if (!data || Object.keys(data).length === 0) {
                    throw new Error('No data was extracted from the resume');
                }

                // Transform the parsed data to match our form structure
                const transformedData = transformResumeData(data);
                console.log('Transformed data:', transformedData);

                fillFormWithParsedData(transformedData);
                showNotification('Resume parsed successfully!', 'success');
            } catch (error) {
                console.error('Parsing error:', error);
                showNotification(error.message || 'Failed to parse resume. Please try again.', 'error');
            }
        } else {
            showNotification('Please select a file to parse', 'error');
        }
    });

    // Define a function to check if a text item is bold and uppercase
    function isSectionTitle(item) {
        return item.isBold && item.text === item.text.toUpperCase();
    }

    // Modify the transformResumeData function to include scoring
    function transformResumeData(data) {
        const transformed = {
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            summary: data.summary || data.objective || '',
            skills: data.skills || [],
            experience: data.experience || [],
            education: data.education || [],
            languages: data.languages || [],
            certifications: data.certifications || [],
            projects: data.projects || [],
            interests: data.interests || []
        };

        // Log the transformed data for debugging
        console.log('Transformed Data:', transformed);
        
        // Implement scoring logic for key attributes
        const scores = {
            nameScore: calculateScore(transformed.name),
            emailScore: calculateScore(transformed.email),
            phoneScore: calculateScore(transformed.phone),
        };

        console.log('Scores:', scores);
        return transformed;
    }

    // Function to calculate score based on certain criteria
    function calculateScore(attribute) {
        // Example scoring logic
        if (!attribute) return 0;
        let score = 0;
        if (attribute.length > 0) score += 1; // Basic presence check
        if (attribute.includes('@')) score += 2; // Email check
        if (/^\(\d{3}\) \d{3}-\d{4}$/.test(attribute)) score += 3; // Phone format check
        return score;
    }

    function extractSkillsFromData(data) {
        let skills = [];
        
        // Check all possible skill fields
        for (const field of SECTION_TITLES.skills) {
            if (data[field]) {
                if (Array.isArray(data[field])) {
                    skills = skills.concat(data[field]);
                } else if (typeof data[field] === 'string') {
                    skills = skills.concat(data[field].split(/[,;]/));
                } else if (typeof data[field] === 'object') {
                    Object.values(data[field]).forEach(value => {
                        if (Array.isArray(value)) {
                            skills = skills.concat(value);
                        } else if (typeof value === 'string') {
                            skills = skills.concat(value.split(/[,;]/));
                        }
                    });
                }
            }
        }

        // Remove duplicates and clean up
        return [...new Set(skills.map(skill => skill.trim()).filter(Boolean))];
    }

    function extractExperienceFromData(data) {
        let experience = [];
        
        if (data.experience) {
            const expData = Array.isArray(data.experience) ? data.experience : [data.experience];
            experience = expData.map(exp => ({
                company: exp.company || exp.organization || '',
                position: exp.title || exp.position || exp.role || '',
                startDate: exp.startDate || exp.start || '',
                endDate: exp.endDate || exp.end || '',
                description: Array.isArray(exp.description) ? exp.description :
                            typeof exp.description === 'string' ? [exp.description] :
                            exp.responsibilities || []
            }));
        } else if (data.positions) {
            const positions = Array.isArray(data.positions) ? data.positions : [data.positions];
            experience = positions.map(pos => ({
                company: pos.company || pos.organization || '',
                position: pos.title || pos.position || pos.role || '',
                startDate: pos.startDate || pos.start || '',
                endDate: pos.endDate || pos.end || '',
                description: Array.isArray(pos.description) ? pos.description :
                            typeof pos.description === 'string' ? [pos.description] :
                            pos.responsibilities || []
            }));
        }

        return experience;
    }

    function extractEducationFromData(data) {
        let education = [];
        
        if (data.education) {
            const eduData = Array.isArray(data.education) ? data.education : [data.education];
            education = eduData.map(edu => ({
                degree: edu.degree || edu.title || '',
                institution: edu.institution || edu.school || edu.university || '',
                startDate: edu.startDate || edu.start || '',
                endDate: edu.endDate || edu.end || '',
                description: Array.isArray(edu.description) ? edu.description :
                            typeof edu.description === 'string' ? [edu.description] :
                            []
            }));
        }

        return education;
    }

    // Function to fill form with parsed data
    function fillFormWithParsedData(data) {
        console.log('Filling form with data:', data);
        
        // Reset form fields first
        resetFormFields();

        // Fill in personal information
        document.getElementById('name').value = data.name || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('phone').value = data.phone || '';

        // Fill in summary
        document.getElementById('summary').value = data.summary || '';

        // Fill in skills
        const skillsTextarea = document.querySelector('textarea[name="skills[]"]');
        if (skillsTextarea) {
            skillsTextarea.value = data.skills.map(skill => `• ${skill}`).join('\n');
        }

        // Fill in experience
        const experienceContainer = document.getElementById('experience-container');
        data.experience.forEach((exp, index) => {
            if (index > 0) addEntry('experience'); // Add new entry if not the first
            const entry = experienceContainer.children[index];
            if (entry) {
                entry.querySelector('[name="experience_company[]"]').value = exp.company || '';
                entry.querySelector('[name="experience_position[]"]').value = exp.position || '';
                entry.querySelector('[name="experience_start[]"]').value = formatDate(exp.startDate || '');
                entry.querySelector('[name="experience_end[]"]').value = formatDate(exp.endDate || '');
                entry.querySelector('[name="experience_description[]"]').value = exp.description.join('\n') || '';
            }
        });

        // Fill in education
        const educationContainer = document.getElementById('education-container');
        data.education.forEach((edu, index) => {
            if (index > 0) addEntry('education'); // Add new entry if not the first
            const entry = educationContainer.children[index];
            if (entry) {
                entry.querySelector('[name="education_degree[]"]').value = edu.degree || '';
                entry.querySelector('[name="education_institution[]"]').value = edu.institution || '';
                entry.querySelector('[name="education_start[]"]').value = formatDate(edu.startDate || '');
                entry.querySelector('[name="education_end[]"]').value = formatDate(edu.endDate || '');
                entry.querySelector('[name="education_description[]"]').value = edu.description.join('\n') || '';
            }
        });

        // Handle additional sections similarly...
    }

    // Other functions (resetFormFields, formatDate, updatePreviewText, showNotification, etc.) remain unchanged
})();

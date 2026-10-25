/**
 * Simple Resume Parser for PDF files
 * 
 * This standalone file parses resume PDFs using PDF.js library.
 * It extracts structured information about profile, skills, education, and experience.
 */

// Global function to parse resume PDFs
window.parseResumePdf = async function(fileUrl) {
    try {
        console.log("Parsing resume from PDF:", fileUrl);
        
        // Ensure PDF.js is available
        if (!window.pdfjsLib) {
            console.error("PDF.js library not found!");
            throw new Error("PDF.js library not found!");
        }
        
        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        
        // Extract text from all pages
        let allTextItems = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            // Process text items to add position data
            const processedItems = textContent.items.map(item => {
                const { str: text, transform } = item;
                // Extract position from transform matrix
                const x = transform[4];
                const y = transform[5];
                
                return {
                    text,
                    x,
                    y,
                    hasEOL: item.hasEOL || false,
                    fontName: item.fontName || ""
                };
            });
            
            allTextItems = allTextItems.concat(processedItems);
        }
        
        // Group text items into lines
        const lines = groupTextItemsIntoLines(allTextItems);
        
        // Group lines into sections
        const sections = groupLinesIntoSections(lines);
        
        // Extract resume data from sections
        const resumeData = extractDataFromSections(sections);
        
        console.log("Parsed resume data:", resumeData);
        return resumeData;
    } catch (error) {
        console.error("Error parsing PDF:", error);
        throw error;
    }
};

/**
 * Group text items into lines
 */
function groupTextItemsIntoLines(textItems) {
    if (textItems.length === 0) return [];
    
    // Sort by Y position (top to bottom)
    textItems.sort((a, b) => b.y - a.y);
    
    const lines = [];
    let currentLine = [textItems[0]];
    let currentY = textItems[0].y;
    
    // Group by similar Y positions
    for (let i = 1; i < textItems.length; i++) {
        const item = textItems[i];
        
        // If Y position is similar to current line, add to current line
        if (Math.abs(item.y - currentY) < 3) {
            currentLine.push(item);
        } else {
            // Sort line items by X position (left to right)
            currentLine.sort((a, b) => a.x - b.x);
            lines.push(currentLine);
            
            // Start a new line
            currentLine = [item];
            currentY = item.y;
        }
    }
    
    // Add the last line
    if (currentLine.length > 0) {
        currentLine.sort((a, b) => a.x - b.x);
        lines.push(currentLine);
    }
    
    return lines;
}

/**
 * Group lines into sections
 */
function groupLinesIntoSections(lines) {
    const sections = {
        profile: [],
        education: [],
        experience: [],
        skills: [],
        summary: []
    };
    
    let currentSection = 'profile';
    
    // Basic section headers to identify
    const sectionKeywords = {
        'profile': ['profile', 'personal', 'contact', 'about me'],
        'summary': ['summary', 'objective', 'professional summary'],
        'experience': ['experience', 'employment', 'work history', 'career'],
        'education': ['education', 'academic', 'qualification', 'degree'],
        'skills': ['skills', 'expertise', 'competencies', 'technologies']
    };
    
    // Identify sections based on keywords
    for (const line of lines) {
        if (line.length === 0) continue;
        
        // Join text in the line
        const lineText = line.map(item => item.text).join(' ').toLowerCase();
        
        // Check if this line is a section header
        let isSectionHeader = false;
        for (const [section, keywords] of Object.entries(sectionKeywords)) {
            if (keywords.some(keyword => lineText.includes(keyword))) {
                currentSection = section;
                isSectionHeader = true;
                break;
            }
        }
        
        // Add the line to the current section if it's not just a header
        if (!isSectionHeader || line.length > 1) {
            if (!sections[currentSection]) {
                sections[currentSection] = [];
            }
            sections[currentSection].push(line);
        }
    }
    
    return sections;
}

/**
 * Extract structured data from sections
 */
function extractDataFromSections(sections) {
    const result = {
        name: '',
        email: '',
        phone: '',
        summary: '',
        skills: [],
        experience: [],
        education: []
    };
    
    // Extract profile information
    const profileText = sections.profile.flat().map(item => item.text).join(' ');
    
    // Extract email using regex
    const emailMatch = profileText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
        result.email = emailMatch[0];
    }
    
    // Extract phone using regex
    const phoneMatch = profileText.match(/\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/);
    if (phoneMatch) {
        result.phone = phoneMatch[0];
    }
    
    // Try to extract name (usually one of the first lines)
    if (sections.profile.length > 0 && sections.profile[0].length > 0) {
        const firstLine = sections.profile[0].map(item => item.text).join(' ');
        // Assume name is the first line if it doesn't contain email or phone
        if (!firstLine.includes('@') && !/\d{3}/.test(firstLine)) {
            result.name = firstLine;
        }
    }
    
    // Extract summary
    if (sections.summary.length > 0) {
        result.summary = sections.summary.flat().map(item => item.text).join(' ');
    }
    
    // Extract skills
    if (sections.skills.length > 0) {
        const skillsText = sections.skills.flat().map(item => item.text).join(' ');
        
        // Try to extract skills as a comma/bullet-separated list
        const skillsList = skillsText.split(/[,•]/).map(skill => skill.trim()).filter(Boolean);
        
        if (skillsList.length > 0) {
            result.skills = skillsList;
        } else {
            // Fallback to just using the whole section as one skill
            result.skills = [skillsText];
        }
    }
    
    // Extract experience
    if (sections.experience.length > 0) {
        const experienceItems = [];
        let currentExperience = null;
        
        for (const line of sections.experience) {
            if (line.length === 0) continue;
            
            const lineText = line.map(item => item.text).join(' ');
            
            // If a line has a year, it might be a new experience entry
            if (/\b(19|20)\d{2}\b/.test(lineText) && !currentExperience) {
                currentExperience = {
                    company: '',
                    position: '',
                    startDate: '',
                    endDate: '',
                    description: ''
                };
                
                // Try to extract company and position
                const parts = lineText.split(/\s+at\s+|\s+[-–—]\s+/);
                if (parts.length >= 2) {
                    currentExperience.position = parts[0];
                    currentExperience.company = parts[1];
                } else {
                    currentExperience.company = lineText;
                }
                
                // Try to extract dates
                const dateMatch = lineText.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)?\.?\s*((19|20)\d{2})\s*[-–—]?\s*(Present|Current|Now|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)?\.?\s*((19|20)\d{2})?/i);
                
                if (dateMatch) {
                    currentExperience.startDate = dateMatch[2] || '';
                    currentExperience.endDate = dateMatch[6] || dateMatch[4] || '';
                }
                
                experienceItems.push(currentExperience);
            } 
            // If we already have a current experience, add to its description
            else if (currentExperience) {
                currentExperience.description += lineText + ' ';
            }
        }
        
        result.experience = experienceItems;
    }
    
    // Extract education
    if (sections.education.length > 0) {
        const educationItems = [];
        let currentEducation = null;
        
        for (const line of sections.education) {
            if (line.length === 0) continue;
            
            const lineText = line.map(item => item.text).join(' ');
            
            // If a line has a year, it might be a new education entry
            if (/\b(19|20)\d{2}\b/.test(lineText) && !currentEducation) {
                currentEducation = {
                    institution: '',
                    degree: '',
                    startDate: '',
                    endDate: '',
                    description: ''
                };
                
                // Try to extract degree and institution
                const parts = lineText.split(/\s+at\s+|\s+[-–—]\s+/);
                if (parts.length >= 2) {
                    currentEducation.degree = parts[0];
                    currentEducation.institution = parts[1];
                } else {
                    const degreeMatch = lineText.match(/\b(Bachelor|Master|PhD|Doctor|Associate|BS|BA|MS|MA|PhD|MD|JD|BBA|BSc|MSc|BE|MBA)\b/i);
                    if (degreeMatch) {
                        currentEducation.degree = degreeMatch[0];
                        currentEducation.institution = lineText;
                    } else {
                        currentEducation.institution = lineText;
                    }
                }
                
                // Try to extract dates
                const dateMatch = lineText.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)?\.?\s*((19|20)\d{2})\s*[-–—]?\s*(Present|Current|Now|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)?\.?\s*((19|20)\d{2})?/i);
                
                if (dateMatch) {
                    currentEducation.startDate = dateMatch[2] || '';
                    currentEducation.endDate = dateMatch[6] || dateMatch[4] || '';
                }
                
                educationItems.push(currentEducation);
            } 
            // If we already have a current education, add to its description
            else if (currentEducation) {
                currentEducation.description += lineText + ' ';
            }
        }
        
        result.education = educationItems;
    }
    
    return result;
}

// Connect to the resume parser adapter if it exists
if (typeof window.parseAndFillResume !== 'function') {
    console.log("Setting up parseAndFillResume function");
    window.parseAndFillResume = async function(fileUrl) {
        try {
            console.log("Simple parser parsing resume from:", fileUrl);
            const parsedData = await window.parseResumePdf(fileUrl);
            
            // If there's a fillFormWithParsedData function available, use it
            if (typeof window.fillFormWithParsedData === 'function') {
                window.fillFormWithParsedData(parsedData);
            } else {
                // Create a simple version of the fillFormWithParsedData function
                console.log("Creating basic form filling function");
                window.fillFormWithParsedData = function(data) {
                    console.log('Filling form with parsed data:', data);
                    
                    // Basic Information
                    if (data.name) {
                        document.getElementById('name').value = data.name;
                    }
                    if (data.email) {
                        document.getElementById('email').value = data.email;
                    }
                    if (data.phone) {
                        document.getElementById('phone').value = data.phone;
                    }
                    
                    // Professional Summary
                    if (data.summary) {
                        document.getElementById('summary').value = data.summary;
                    }
                    
                    // Skills
                    if (data.skills && data.skills.length > 0) {
                        const skillsEntry = document.querySelector('[name="skills[]"]');
                        if (skillsEntry) {
                            skillsEntry.value = Array.isArray(data.skills) ? data.skills.join('\n• ') : data.skills;
                        }
                    }
                    
                    // Fill preview fields if they exist
                    ['name', 'email', 'phone', 'summary', 'skills'].forEach(field => {
                        const previewElem = document.getElementById('preview-' + field);
                        if (previewElem && data[field]) {
                            let content = data[field];
                            if (Array.isArray(content)) {
                                content = content.join('\n• ');
                            }
                            previewElem.innerHTML = content.replace(/\n/g, '<br>');
                            if (previewElem.classList.contains('preview-update')) {
                                previewElem.classList.remove('preview-update');
                                setTimeout(() => previewElem.classList.add('preview-update'), 10);
                            } else {
                                previewElem.classList.add('preview-update');
                                setTimeout(() => previewElem.classList.remove('preview-update'), 500);
                            }
                        }
                    });
                };
                
                window.fillFormWithParsedData(parsedData);
            }
            
            return parsedData;
        } catch (error) {
            console.error("Error in parseAndFillResume:", error);
            throw error;
        }
    };
    console.log("parseAndFillResume function is now available");
} 
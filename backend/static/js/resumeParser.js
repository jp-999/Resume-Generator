/**
 * Resume Parser for PDF files
 * 
 * This file contains functions to parse resume PDFs and extract structured information.
 * It uses PDF.js to extract text from PDF files and then processes the text to identify
 * different sections like profile info, skills, education, and work experience.
 */

/**
 * Parse a resume PDF file
 * @param {string} fileUrl - URL to the PDF file
 * @returns {Promise<Object>} - Parsed resume data
 */
async function parseResumePdf(fileUrl) {
    try {
        console.log("Parsing resume from PDF:", fileUrl);
        
        // Ensure PDF.js is available
        if (!window.pdfjsLib) {
            console.error("PDF.js library not found! Make sure it's loaded before calling this function.");
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
}

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
        if (!firstLine.includes('@') && !phoneMatch?.test(firstLine)) {
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
        // Split by common delimiters and clean up
        result.skills = skillsText.split(/[,•\-\n]/)
            .map(skill => skill.trim())
            .filter(skill => skill.length > 2); // Filter out short items
    }
    
    // Extract experience (simplified)
    if (sections.experience.length > 0) {
        // Group experience entries by empty lines or format changes
        const experiences = [];
        let currentExperience = {
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            description: ''
        };
        
        for (const line of sections.experience) {
            const lineText = line.map(item => item.text).join(' ');
            
            // Check for date patterns
            const dateMatch = lineText.match(/(\d{1,2}\/\d{4}|\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*-\s*(Present|\d{1,2}\/\d{4}|\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
            
            if (dateMatch) {
                // If we found dates and already have some info, push and start new experience
                if (currentExperience.company) {
                    experiences.push({...currentExperience});
                    currentExperience = {
                        company: '',
                        position: '',
                        startDate: '',
                        endDate: '',
                        description: ''
                    };
                }
                
                // Set dates
                if (dateMatch[1]) currentExperience.startDate = dateMatch[1];
                if (dateMatch[2]) currentExperience.endDate = dateMatch[2];
                
                // Company/position might be in the same line as dates
                const remainingText = lineText.replace(dateMatch[0], '').trim();
                if (remainingText) {
                    if (!currentExperience.company) {
                        currentExperience.company = remainingText;
                    } else if (!currentExperience.position) {
                        currentExperience.position = remainingText;
                    }
                }
            } else if (!currentExperience.company) {
                currentExperience.company = lineText;
            } else if (!currentExperience.position) {
                currentExperience.position = lineText;
            } else {
                // Add to description
                if (currentExperience.description) {
                    currentExperience.description += '\n';
                }
                currentExperience.description += lineText;
            }
        }
        
        // Add the last experience if not empty
        if (currentExperience.company) {
            experiences.push(currentExperience);
        }
        
        result.experience = experiences;
    }
    
    // Extract education (simplified similar to experience)
    if (sections.education.length > 0) {
        // Group education entries
        const educations = [];
        let currentEducation = {
            institution: '',
            degree: '',
            startDate: '',
            endDate: '',
            description: ''
        };
        
        for (const line of sections.education) {
            const lineText = line.map(item => item.text).join(' ');
            
            // Check for date patterns
            const dateMatch = lineText.match(/(\d{1,2}\/\d{4}|\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*-\s*(Present|\d{1,2}\/\d{4}|\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
            
            if (dateMatch) {
                // If we found dates and already have some info, push and start new education
                if (currentEducation.institution) {
                    educations.push({...currentEducation});
                    currentEducation = {
                        institution: '',
                        degree: '',
                        startDate: '',
                        endDate: '',
                        description: ''
                    };
                }
                
                // Set dates
                if (dateMatch[1]) currentEducation.startDate = dateMatch[1];
                if (dateMatch[2]) currentEducation.endDate = dateMatch[2];
                
                // Institution/degree might be in the same line as dates
                const remainingText = lineText.replace(dateMatch[0], '').trim();
                if (remainingText) {
                    if (!currentEducation.institution) {
                        currentEducation.institution = remainingText;
                    } else if (!currentEducation.degree) {
                        currentEducation.degree = remainingText;
                    }
                }
            } else if (!currentEducation.institution) {
                currentEducation.institution = lineText;
            } else if (!currentEducation.degree) {
                currentEducation.degree = lineText;
            } else {
                // Add to description
                if (currentEducation.description) {
                    currentEducation.description += '\n';
                }
                currentEducation.description += lineText;
            }
        }
        
        // Add the last education if not empty
        if (currentEducation.institution) {
            educations.push(currentEducation);
        }
        
        result.education = educations;
    }
    
    return result;
}

// Make function available globally
window.parseResumePdf = parseResumePdf;

// Also export for ES modules
export { parseResumePdf }; 
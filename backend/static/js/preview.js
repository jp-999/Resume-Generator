/**
 * Resume Preview Handler
 * Manages the live preview of resume templates
 */

class PreviewHandler {
    constructor() {
        this.previewContainer = document.querySelector('.preview-container');
        this.currentTemplate = 'classic';
        this.templates = [
            'classic',
            'modern',
            'minimal',
            'executive',
            'impact',
            'unique'
        ];
    }

    /**
     * Initialize the preview handler
     */
    init() {
        // Set initial template from localStorage or default to classic
        const savedTemplate = localStorage.getItem('selectedTemplate');
        if (savedTemplate && this.templates.includes(savedTemplate)) {
            this.currentTemplate = savedTemplate;
        }
        
        // Update preview with initial data
        this.updatePreview();
        
        console.log('Preview handler initialized with template:', this.currentTemplate);
    }

    /**
     * Set the current template
     * @param {string} templateId - The template ID to set
     */
    setTemplate(templateId) {
        if (!this.templates.includes(templateId)) {
            console.error('Invalid template ID:', templateId);
            return;
        }
        
        this.currentTemplate = templateId;
        localStorage.setItem('selectedTemplate', templateId);
        this.updatePreview();
        
        console.log('Template changed to:', templateId);
        
        // Apply template-specific animations
        if (templateId === 'impact') {
            this.applyImpactAnimations();
        } else if (templateId === 'unique') {
            this.applyUniqueAnimations();
        }
    }

    /**
     * Update the preview with current form data
     */
    updatePreview() {
        const name = document.getElementById('fullName')?.value || 'Your Name';
        const email = document.getElementById('email')?.value || 'your.email@example.com';
        const summary = document.getElementById('summary')?.value || 'Your professional summary will appear here...';
        
        // Get all dynamic sections content
        const sectionsContent = window.dynamicSections ? 
            window.dynamicSections.map(section => this.getSectionContent(section)).join('') : '';
        
        // Update preview container class
        if (this.previewContainer) {
            this.previewContainer.className = 'preview-container ' + this.currentTemplate;
            
            // Set the template structure based on current template
            const data = { name, email, summary, sectionsContent };
            this.previewContainer.innerHTML = this.getTemplateStructure(this.currentTemplate, data);
            
            // Apply template-specific animations
            if (this.currentTemplate === 'impact') {
                this.applyImpactAnimations();
            } else if (this.currentTemplate === 'unique') {
                this.applyUniqueAnimations();
            }
        }
    }
    
    /**
     * Apply animations specific to the Impact template
     */
    applyImpactAnimations() {
        // Add animation styles if they don't exist
        if (!document.getElementById('impact-animations')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'impact-animations';
            styleEl.textContent = `
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 100% 50%; }
                }
                
                @keyframes shimmer {
                    0% { background-position: 0% 0%; }
                    50% { background-position: 100% 100%; }
                    100% { background-position: 0% 0%; }
                }
                
                @keyframes nameUnderline {
                    0% { width: 0; }
                    50% { width: 100%; }
                    100% { width: 0; }
                }
                
                @keyframes skillPulse {
                    0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
                }
                
                .impact-container {
                    position: relative;
                    overflow: hidden;
                }
                
                .impact-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 100%;
                    background: linear-gradient(135deg, rgba(13, 110, 253, 0.05) 0%, rgba(13, 110, 253, 0) 50%, rgba(13, 110, 253, 0.05) 100%);
                    background-size: 200% 200%;
                    z-index: 0;
                    animation: gradientShift 8s ease-in-out infinite alternate;
                }
                
                .impact .impact-header {
                    overflow: hidden;
                }
                
                .impact .impact-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.1) 100%);
                    background-size: 200% 200%;
                    animation: shimmer 5s ease-in-out infinite;
                    z-index: 0;
                }
                
                .impact .impact-name {
                    position: relative;
                    display: inline-block;
                }
                
                .impact .impact-name::after {
                    content: '';
                    position: absolute;
                    bottom: -5px;
                    left: 0;
                    width: 0;
                    height: 3px;
                    background-color: white;
                    animation: nameUnderline 3s ease-in-out infinite;
                }
                
                .impact .impact-section {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                
                .impact .impact-section:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
                }
                
                .impact .impact-section-title::after {
                    transition: width 0.3s ease;
                }
                
                .impact .impact-section:hover .impact-section-title::after {
                    width: 100%;
                }
                
                .impact .impact-skill {
                    position: relative;
                    overflow: hidden;
                }
                
                .impact .impact-skill::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, rgba(13, 110, 253, 0), rgba(13, 110, 253, 0.1), rgba(13, 110, 253, 0));
                    transform: translateX(-100%);
                    transition: transform 0.6s ease;
                }
                
                .impact .impact-skill:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 3px 10px rgba(13, 110, 253, 0.2);
                }
                
                .impact .impact-skill:hover::before {
                    transform: translateX(100%);
                }
            `;
            document.head.appendChild(styleEl);
        }
        
        // Add staggered animation to skill items
        const skillItems = document.querySelectorAll('.impact-skill');
        skillItems.forEach((item, index) => {
            item.setAttribute('data-index', index.toString());
            setTimeout(() => {
                item.style.animation = `skillPulse 3s infinite`;
                // Add a small delay between each item's animation
                item.style.animationDelay = `${index * 0.2}s`;
            }, 50);
        });
        
        // Make sections visible with a staggered delay
        const sections = document.querySelectorAll('.impact-section');
        sections.forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            setTimeout(() => {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, 100 + (index * 150));
        });
    }
    
    /**
     * Apply animations specific to the Unique template
     */
    applyUniqueAnimations() {
        // Add animation styles if they don't exist
        if (!document.getElementById('unique-animations')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'unique-animations';
            styleEl.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes skillBarFill {
                    from { width: 0; }
                    to { width: var(--skill-width, 80%); }
                }
                
                .unique .profile {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                
                .unique .sidebar .section-title {
                    animation: slideInLeft 0.6s ease-out forwards;
                }
                
                .unique .main-section-title {
                    animation: slideInRight 0.6s ease-out forwards;
                }
                
                .unique .skill-level::before {
                    animation: skillBarFill 1s ease-out forwards;
                }
                
                .unique .timeline-item {
                    opacity: 0;
                    animation: fadeIn 0.6s ease-out forwards;
                }
                
                .unique .project-item {
                    opacity: 0;
                    animation: fadeIn 0.6s ease-out forwards;
                }
                
                .unique .interest-item {
                    opacity: 0;
                    animation: fadeIn 0.6s ease-out forwards;
                }
            `;
            document.head.appendChild(styleEl);
        }
        
        // Add staggered animations to timeline items
        const timelineItems = document.querySelectorAll('.unique .timeline-item');
        timelineItems.forEach((item, index) => {
            item.style.animationDelay = `${0.2 + (index * 0.15)}s`;
        });
        
        // Add staggered animations to project items
        const projectItems = document.querySelectorAll('.unique .project-item');
        projectItems.forEach((item, index) => {
            item.style.animationDelay = `${0.4 + (index * 0.15)}s`;
        });
        
        // Add staggered animations to interest items
        const interestItems = document.querySelectorAll('.unique .interest-item');
        interestItems.forEach((item, index) => {
            item.style.animationDelay = `${0.6 + (index * 0.1)}s`;
        });
    }

    /**
     * Get the HTML structure for a specific template
     * @param {string} template - The template ID
     * @param {object} data - The data to populate the template with
     * @returns {string} - The HTML structure
     */
    getTemplateStructure(template, data) {
        let baseStructure = '';
        
        switch(template) {
            case 'modern':
                baseStructure = `
                    <div class="modern-header bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 rounded-t-lg">
                        <h1 id="previewName" class="text-3xl font-bold mb-2">${data.name}</h1>
                        <div class="contact-info text-sm opacity-90">${data.email}</div>
                    </div>
                    <div class="modern-content p-8">
                        <div class="preview-section">
                            <h3 class="text-xl font-semibold text-purple-600 mb-4">Professional Summary</h3>
                            <div class="preview-content" id="previewSummary">${data.summary}</div>
                        </div>
                        ${data.sectionsContent}
                    </div>
                `;
                break;
                
            case 'minimal':
                baseStructure = `
                    <div class="minimal-container p-8">
                        <div class="minimal-header border-b-2 border-gray-200 pb-6 mb-6">
                            <h1 id="previewName" class="text-3xl font-light mb-2">${data.name}</h1>
                            <div class="contact-info text-gray-600">${data.email}</div>
                        </div>
                        <div class="minimal-content grid grid-cols-1 gap-8">
                            <div class="preview-section">
                                <h3 class="text-lg uppercase tracking-wider text-gray-700 mb-4">Professional Summary</h3>
                                <div class="preview-content text-gray-600" id="previewSummary">${data.summary}</div>
                            </div>
                            ${data.sectionsContent}
                        </div>
                    </div>
                `;
                break;
                
            case 'executive':
                baseStructure = `
                    <div class="executive-container">
                        <div class="header">
                            <div class="profile-image"></div>
                            <div class="header-content">
                                <h1 class="name">${data.name}</h1>
                                <div class="title">Executive Professional</div>
                                <div class="header-summary">${data.summary.substring(0, 150)}${data.summary.length > 150 ? '...' : ''}</div>
                            </div>
                        </div>
                        <div class="divider"></div>
                        <div class="content">
                            <div class="left-column">
                                <div class="section">
                                    <h2 class="section-title">Summary</h2>
                                    <p class="item-description">${data.summary}</p>
                                </div>
                                <div class="preview-section">
                                    <h2 class="section-title">Experience</h2>
                                    <div class="item-description" id="previewSummary">Add your experience in the form.</div>
                                </div>
                            </div>
                            <div class="right-column">
                                <div class="section">
                                    <h2 class="section-title">Contact</h2>
                                    <div class="contact-info">
                                        <div class="contact-item">
                                            <div class="contact-label">Email</div>
                                            <div>${data.email}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="preview-section">
                                    <h2 class="section-title">Skills</h2>
                                    <div class="item-description">Add your skills in the form.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            case 'impact':
                baseStructure = `
                    <div class="impact-container">
                        <div class="impact-header">
                            <h1 class="impact-name">${data.name}</h1>
                            <div class="impact-title">${data.email}</div>
                        </div>
                        <div class="impact-content">
                            <div class="impact-section">
                                <h3 class="impact-section-title">Professional Summary</h3>
                                <div class="preview-content" id="previewSummary">${data.summary}</div>
                            </div>
                            ${data.sectionsContent.replace(/preview-section/g, 'impact-section')
                                                 .replace(/<h3>/g, '<h3 class="impact-section-title">')
                                                 .replace(/skills-preview-list/g, 'impact-skills')
                                                 .replace(/skill-preview-item/g, 'impact-skill')}
                        </div>
                    </div>
                `;
                break;
                
            case 'unique':
                baseStructure = `
                    <div class="unique-container">
                        <div class="content-wrapper">
                            <div class="sidebar">
                                <div class="profile">
                                    <div class="profile-image"></div>
                                    <h1 class="name">${data.name}</h1>
                                    <div class="title">Professional</div>
                                </div>
                                <div class="contact">
                                    <h2 class="section-title">Contact</h2>
                                    <div class="contact-item">
                                        <div class="contact-icon">@</div>
                                        <div class="contact-text">${data.email}</div>
                                    </div>
                                </div>
                                <div class="skills">
                                    <h2 class="section-title">Skills</h2>
                                    <div class="skill-item">
                                        <div class="skill-name">Professional Skills</div>
                                        <div class="skill-level" style="--skill-width: 85%"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="main-content">
                                <div class="main-section">
                                    <h2 class="main-section-title">Professional Summary</h2>
                                    <div class="summary">${data.summary}</div>
                                </div>
                                ${data.sectionsContent.replace(/preview-section/g, 'main-section')
                                                     .replace(/<h3>/g, '<h2 class="main-section-title">')
                                                     .replace(/skills-preview-list/g, 'interests-list')
                                                     .replace(/skill-preview-item/g, 'interest-item')}
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            default: // classic
                baseStructure = `
                    <div class="classic-container p-8">
                        <h1 id="previewName" class="text-2xl font-bold mb-2">${data.name}</h1>
                        <div class="contact-info mb-6 text-gray-600" id="previewContact">${data.email}</div>
                        <div class="preview-section mb-6">
                            <h3 class="text-lg font-semibold border-b-2 border-gray-200 pb-2 mb-4">Professional Summary</h3>
                            <div class="preview-content" id="previewSummary">${data.summary}</div>
                        </div>
                        ${data.sectionsContent}
                    </div>
                `;
        }
        
        return baseStructure;
    }

    /**
     * Get the HTML content for a specific section
     * @param {object} section - The section object
     * @returns {string} - The HTML content
     */
    getSectionContent(section) {
        const sectionElement = document.getElementById(section.id);
        if (!sectionElement) return '';

        let content = '';
        switch(section.type) {
            case 'experience':
                const company = sectionElement.querySelector('input:nth-child(1)')?.value || '';
                const position = sectionElement.querySelector('input:nth-child(2)')?.value || '';
                const duration = sectionElement.querySelector('input:nth-child(3)')?.value || '';
                const description = sectionElement.querySelector('textarea')?.value || '';
                
                content = `
                    <div class="mb-4">
                        <div class="font-bold">${company}</div>
                        <div class="text-gray-600">${position}</div>
                        <div class="text-sm text-gray-500">${duration}</div>
                        <p class="mt-2">${description}</p>
                    </div>
                `;
                break;
                
            case 'skills':
                const skills = sectionElement.querySelector('input')?.value || '';
                const skillsArray = skills.split(',').map(skill => skill.trim()).filter(Boolean);
                
                content = `
                    <div class="skills-preview-list">
                        ${skillsArray.map(skill => `
                            <div class="skill-preview-item">${skill}</div>
                        `).join('')}
                    </div>
                `;
                break;
                
            default:
                const text = sectionElement.querySelector('textarea')?.value || '';
                content = `<p>${text}</p>`;
        }

        return `
            <div class="preview-section">
                <h3>${section.title}</h3>
                ${content}
            </div>
        `;
    }
}

// Initialize the preview handler when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.previewHandler = new PreviewHandler();
    window.previewHandler.init();
    
    // Make updatePreview function available globally
    window.updatePreview = () => {
        if (window.previewHandler) {
            window.previewHandler.updatePreview();
        }
    };
}); 
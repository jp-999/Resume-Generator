/**
 * Resume Parser Loader
 * 
 * This script manages loading all resume parser scripts in the correct order
 * and coordinates between the server and client-side parsers.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing Resume Parser Loader");
    
    // Global variable to track if scripts are loaded
    window.resumeParserLoaded = false;
    
    // Initialize parseAndFillResume function
    window.parseAndFillResume = async function(fileUrl) {
        console.log("parseAndFillResume called with URL:", fileUrl);
        
        // Ensure scripts are loaded
        if (!window.resumeParserLoaded) {
            await loadParserScripts();
        }
        
        if (typeof window.parseResumePdf === 'function') {
            try {
                console.log("Starting PDF parsing...");
                const parsedData = await window.parseResumePdf(fileUrl);
                console.log("PDF parsed successfully with data:", parsedData);
                
                if (typeof window.fillFormWithParsedData === 'function') {
                    console.log("Filling form with parsed data...");
                    window.fillFormWithParsedData(parsedData);
                    console.log("Form filled successfully");
                } else {
                    console.error("fillFormWithParsedData function not available");
                    throw new Error("Form filling function not available");
                }
                return parsedData;
            } catch (error) {
                console.error("Error in parseAndFillResume:", error);
                throw error;
            }
        } else {
            console.error("parseResumePdf function not available");
            throw new Error("PDF parsing function not available");
        }
    };
    
    // Helper function to load scripts in sequence
    async function loadParserScripts() {
        if (window.resumeParserLoaded) {
            console.log("Resume parser scripts already loaded");
            return;
        }
        
        console.log("Loading resume parser scripts...");
        
        try {
            // Load scripts in the correct order
            await loadScript("/static/js/uiUtils.js");
            console.log("uiUtils.js loaded successfully");
            
            await loadScript("/static/js/simpleResumeParser.js");
            console.log("simpleResumeParser.js loaded successfully");
            
            await loadScript("/static/js/resumeParserAdapter.js");
            console.log("resumeParserAdapter.js loaded successfully");
            
            window.resumeParserLoaded = true;
            console.log("All resume parser scripts loaded successfully");
        } catch (error) {
            console.error("Error loading parser scripts:", error);
            window.resumeParserLoaded = false;
            throw error;
        }
    }
    
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if script already exists
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                console.log(`Script ${src} already loaded`);
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.async = false; // Ensure scripts load in sequence
            
            script.onload = () => {
                console.log(`Script ${src} loaded successfully`);
                resolve();
            };
            
            script.onerror = (error) => {
                console.error(`Error loading script ${src}:`, error);
                reject(new Error(`Failed to load script: ${src}`));
            };
            
            document.head.appendChild(script);
        });
    }
    
    // Attempt to load all parser scripts on page load
    loadParserScripts().then(() => {
        console.log("Parser scripts preloaded successfully");
    }).catch(error => {
        console.error("Failed to preload parser scripts:", error);
    });
    
    // Add validation for the resume parser form
    const resumeParserForm = document.getElementById('resumeParserForm');
    if (resumeParserForm) {
        resumeParserForm.addEventListener('submit', function(e) {
            const fileInput = document.getElementById('resumeFile');
            if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                e.preventDefault();
                
                // Show notification
                if (typeof showNotification === 'function') {
                    showNotification('Please select a file to parse', 'error');
                } else {
                    alert('Please select a file to parse');
                }
            }
        });
    }
}); 
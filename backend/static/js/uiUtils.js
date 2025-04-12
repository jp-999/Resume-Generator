/**
 * UI Utilities for the Resume Generator
 * 
 * This file contains JavaScript implementations of React-like hooks
 * to enhance the user experience in the Resume Generator.
 */

/**
 * Tailwind Breakpoints 
 * Creates and returns functions to check if the current screen width meets certain breakpoints
 */
function initializeTailwindBreakpoints() {
    const breakpoints = {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        "2xl": 1536
    };
    
    const state = {
        isSm: false,
        isMd: false,
        isLg: false,
        isXl: false,
        is2xl: false
    };
    
    function updateBreakpoints() {
        const screenWidth = window.innerWidth;
        state.isSm = screenWidth >= breakpoints.sm;
        state.isMd = screenWidth >= breakpoints.md;
        state.isLg = screenWidth >= breakpoints.lg;
        state.isXl = screenWidth >= breakpoints.xl;
        state.is2xl = screenWidth >= breakpoints["2xl"];
        
        // Dispatch a custom event for components that need to react to breakpoint changes
        window.dispatchEvent(new CustomEvent('breakpointChange', { detail: state }));
    }
    
    // Initialize and add event listener
    updateBreakpoints();
    window.addEventListener("resize", updateBreakpoints);
    
    return state;
}

/**
 * Initialize the breakpoints and make them globally available
 */
window.tailwindBreakpoints = initializeTailwindBreakpoints();

/**
 * Autosize Textarea Height
 * Makes textareas automatically adjust their height based on content
 * 
 * @param {HTMLTextAreaElement} textarea - The textarea element to autosize
 */
function autosizeTextarea(textarea) {
    if (!textarea) return;
    
    function resizeHeight() {
        textarea.style.height = "0px";
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
    
    // Initial resize
    resizeHeight();
    
    // Listen for input events
    textarea.addEventListener('input', resizeHeight);
    
    // Listen for window resize
    const handleResize = () => resizeHeight();
    window.addEventListener('resize', handleResize);
    
    // Return a function to clean up event listeners if needed
    return function cleanup() {
        textarea.removeEventListener('input', resizeHeight);
        window.removeEventListener('resize', handleResize);
    };
}

/**
 * Apply responsive UI enhancements based on breakpoint changes
 */
function applyResponsiveUIEnhancements() {
    const { isMd, isLg } = window.tailwindBreakpoints;
    
    // Apply responsive styles to the form container
    const formContainer = document.querySelector('.bg-white');
    
    if (formContainer) {
        if (isLg) {
            // Desktop layout
            formContainer.style.maxWidth = '1200px';
            formContainer.style.margin = '0 auto';
        } else if (isMd) {
            // Tablet layout
            formContainer.style.maxWidth = '95%';
            formContainer.style.margin = '0 auto';
        } else {
            // Mobile layout
            formContainer.style.maxWidth = '100%';
            formContainer.style.margin = '0';
        }
    }
    
    // Make sections more compact on mobile
    const sections = document.querySelectorAll('.bg-gray-50');
    sections.forEach(section => {
        if (!isLg) {
            section.style.padding = '1rem';
        } else {
            section.style.padding = '1.5rem';
        }
    });
}

// Apply responsive enhancements on load and when breakpoints change
document.addEventListener('DOMContentLoaded', function() {
    applyResponsiveUIEnhancements();
    
    // Listen for breakpoint changes
    window.addEventListener('breakpointChange', applyResponsiveUIEnhancements);
    
    // Also listen for resize directly to ensure smooth transitions
    window.addEventListener('resize', applyResponsiveUIEnhancements);
    
    const textareas = document.querySelectorAll('textarea.autosize');
    textareas.forEach(textarea => {
        autosizeTextarea(textarea);
    });
    
    // Also apply to dynamically added textareas
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.nodeName === 'TEXTAREA' && node.classList.contains('autosize')) {
                            autosizeTextarea(node);
                        } else {
                            const textareas = node.querySelectorAll('textarea.autosize');
                            textareas.forEach(textarea => autosizeTextarea(textarea));
                        }
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
}); 
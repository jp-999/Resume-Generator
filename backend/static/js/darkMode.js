// Dark mode handler
class DarkModeHandler {
    constructor() {
        this.darkMode = false;
        this.init();
    }

    init() {
        // Check for saved user preference, if any
        const savedTheme = localStorage.getItem('theme');
        
        // Check if user has a system-wide dark preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Set initial theme based on saved preference or system preference
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            this.enableDarkMode();
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('theme')) {  // Only if user hasn't manually set a preference
                if (e.matches) {
                    this.enableDarkMode();
                } else {
                    this.disableDarkMode();
                }
            }
        });
    }

    enableDarkMode() {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        this.darkMode = true;
        this.updateUI();
    }

    disableDarkMode() {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        this.darkMode = false;
        this.updateUI();
    }

    toggleDarkMode() {
        if (this.darkMode) {
            this.disableDarkMode();
        } else {
            this.enableDarkMode();
        }
    }

    updateUI() {
        // Update toggle button if it exists
        const toggleBtn = document.getElementById('darkModeToggle');
        if (toggleBtn) {
            // Update icon
            const icon = toggleBtn.querySelector('i') || toggleBtn.querySelector('svg');
            if (icon) {
                if (this.darkMode) {
                    icon.className = 'fas fa-sun'; // Light icon when in dark mode
                } else {
                    icon.className = 'fas fa-moon'; // Dark icon when in light mode
                }
            }
            
            // Update any tooltip or aria-label
            toggleBtn.setAttribute('aria-label', this.darkMode ? 'Switch to light mode' : 'Switch to dark mode');
            toggleBtn.setAttribute('title', this.darkMode ? 'Switch to light mode' : 'Switch to dark mode');
        }

        // Dispatch custom event for other components that might need to react to theme changes
        document.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { isDark: this.darkMode }
        }));
    }
}

// Initialize dark mode handler
const darkModeHandler = new DarkModeHandler();

// Export for use in other files
window.darkModeHandler = darkModeHandler; 
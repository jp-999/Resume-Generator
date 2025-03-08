class DrawerHandler {
    constructor() {
        this.drawer = document.getElementById('drawer');
        this.toggleBtn = document.getElementById('drawer-toggle');
        this.closeBtn = document.getElementById('drawer-close');
        this.overlay = document.getElementById('drawer-overlay');
        this.container = document.querySelector('.container');
        this.isPermanentlyHidden = localStorage.getItem('drawerHidden') === 'true';
        this.body = document.body;
        this.mainContent = document.querySelector('.form-container');
        this.previewContainer = document.querySelector('.preview-container');
        
        // Add template options
        this.templates = [
            { id: 'classic', name: 'Classic', icon: 'fa-file-alt' },
            { id: 'modern', name: 'Modern', icon: 'fa-laptop-code' },
            { id: 'minimal', name: 'Minimal', icon: 'fa-feather' },
            { id: 'executive', name: 'Executive', icon: 'fa-briefcase' },
            { id: 'impact', name: 'Impact', icon: 'fa-bolt' }, // Impact template
            { id: 'unique', name: 'Unique', icon: 'fa-fingerprint' } // New Unique template
        ];
    }

    init() {
        // Set initial state based on saved preference
        if (this.isPermanentlyHidden) {
            this.hideDrawer();
        } else {
            this.showDrawer();
        }

        // Add event listeners
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Toggle button clicked');
                this.togglePermanentState();
            });
        }
        
        // Fix close button event listener
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close button clicked');
                this.closeDrawer();
            });
        }
        
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeDrawer());
        }
        
        // Add escape key listener
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDrawer();
            }
        });

        // Add resize listener
        window.addEventListener('resize', () => this.updateContainerPosition());
        
        // Initial update
        this.updateContainerPosition();
        this.updateToggleButton();
        
        // Render template options
        this.renderTemplateOptions();
        
        // Debug log
        console.log('Drawer handler initialized', {
            drawer: this.drawer,
            toggleBtn: this.toggleBtn,
            closeBtn: this.closeBtn,
            overlay: this.overlay,
            isPermanentlyHidden: this.isPermanentlyHidden
        });
    }
    
    // Add method to render template options
    renderTemplateOptions() {
        const templateSelector = this.drawer.querySelector('.template-selector');
        if (!templateSelector) return;
        
        // Clear existing options
        templateSelector.innerHTML = '';
        
        // Get current template
        const currentTemplate = window.currentTemplate || 'classic';
        
        // Add template options
        this.templates.forEach(template => {
            const option = document.createElement('div');
            option.className = `template-option ${template.id === currentTemplate ? 'selected' : ''}`;
            option.onclick = () => this.selectTemplate(template.id);
            
            option.innerHTML = `
                <i class="fas ${template.icon}"></i>
                <h3>${template.name}</h3>
            `;
            
            templateSelector.appendChild(option);
        });
    }
    
    // Add method to select template
    selectTemplate(templateId) {
        // Update selected template
        window.currentTemplate = templateId;
        
        // Update template options
        const options = this.drawer.querySelectorAll('.template-option');
        options.forEach(option => {
            option.classList.remove('selected');
            if (option.querySelector('h3').textContent === this.templates.find(t => t.id === templateId).name) {
                option.classList.add('selected');
            }
        });
        
        // Update preview
        if (typeof window.updatePreview === 'function') {
            window.updatePreview();
        }
    }

    toggleDrawer() {
        if (this.drawer.classList.contains('open')) {
            this.closeDrawer();
        } else {
            this.openDrawer();
        }
    }

    togglePermanentState() {
        console.log('Toggling permanent state, current state:', this.isPermanentlyHidden);
        if (this.isPermanentlyHidden) {
            this.showDrawer();
        } else {
            this.hideDrawer();
        }
        this.updateToggleButton();
    }

    openDrawer() {
        console.log('Opening drawer');
        this.drawer.classList.add('open');
        this.drawer.style.transform = 'translateX(0)';
        
        if (this.overlay) {
            this.overlay.classList.remove('hidden');
            this.overlay.style.opacity = '1';
            this.overlay.style.pointerEvents = 'auto';
        }
        
        this.body.style.overflow = 'hidden';
        
        // Update container position
        this.updateContainerPosition();
        
        // Add animation class to content
        if (this.mainContent) {
            this.mainContent.classList.add('content-shifted');
        }
        
        if (this.previewContainer) {
            this.previewContainer.classList.add('content-shifted');
        }
    }

    closeDrawer() {
        console.log('Closing drawer');
        this.drawer.classList.remove('open');
        
        if (window.innerWidth < 1024) {
            this.drawer.style.transform = 'translateX(-100%)';
            
            if (this.overlay) {
                this.overlay.style.opacity = '0';
                this.overlay.style.pointerEvents = 'none';
                setTimeout(() => {
                    this.overlay.classList.add('hidden');
                }, 300);
            }
        }
        
        this.body.style.overflow = '';
        
        // Update container position
        this.updateContainerPosition();
        
        // Remove animation class from content
        if (this.mainContent) {
            this.mainContent.classList.remove('content-shifted');
        }
        
        if (this.previewContainer) {
            this.previewContainer.classList.remove('content-shifted');
        }
    }

    hideDrawer() {
        console.log('Hiding drawer permanently');
        this.isPermanentlyHidden = true;
        localStorage.setItem('drawerHidden', 'true');
        document.body.classList.add('drawer-hidden');
        this.drawer.style.transform = 'translateX(-100%)';
        
        // Update container position
        this.updateContainerPosition();
        
        // Remove animation class from content
        if (this.mainContent) {
            this.mainContent.classList.remove('content-shifted');
        }
        
        if (this.previewContainer) {
            this.previewContainer.classList.remove('content-shifted');
        }
    }

    showDrawer() {
        console.log('Showing drawer permanently');
        this.isPermanentlyHidden = false;
        localStorage.setItem('drawerHidden', 'false');
        document.body.classList.remove('drawer-hidden');
        this.drawer.style.transform = 'translateX(0)';
        
        // Update container position
        this.updateContainerPosition();
        
        // Add animation class to content
        if (this.mainContent) {
            this.mainContent.classList.add('content-shifted');
        }
        
        if (this.previewContainer) {
            this.previewContainer.classList.add('content-shifted');
        }
    }

    updateToggleButton() {
        if (this.toggleBtn) {
            if (this.isPermanentlyHidden) {
                this.toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
                this.toggleBtn.title = 'Show Drawer';
            } else {
                this.toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
                this.toggleBtn.title = 'Hide Drawer';
            }
        }
    }

    updateContainerPosition() {
        if (!this.container) return;
        
        const isDesktop = window.innerWidth >= 1024;
        
        if (isDesktop) {
            if (!this.isPermanentlyHidden) {
                // Drawer is visible on desktop
                this.container.style.marginLeft = '300px';
                this.container.style.width = 'calc(100% - 300px)';
                this.container.style.maxWidth = 'none';
                this.container.style.transition = 'margin-left 0.4s cubic-bezier(0.16, 1, 0.3, 1), width 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            } else {
                // Drawer is hidden on desktop
                this.container.style.marginLeft = '0';
                this.container.style.width = '100%';
                this.container.style.maxWidth = '1200px';
                this.container.style.transition = 'margin-left 0.4s cubic-bezier(0.16, 1, 0.3, 1), width 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            }
        } else {
            // Mobile view
            this.container.style.marginLeft = '0';
            this.container.style.width = '100%';
            this.container.style.maxWidth = 'none';
        }
    }
}

// Initialize the drawer handler when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.drawerHandler = new DrawerHandler();
    window.drawerHandler.init();
}); 
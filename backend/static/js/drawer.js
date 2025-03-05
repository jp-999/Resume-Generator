class DrawerHandler {
    constructor() {
        this.drawer = document.getElementById('drawer');
        this.drawerToggle = document.getElementById('drawer-toggle');
        this.drawerClose = document.getElementById('drawer-close');
        this.overlay = document.getElementById('drawer-overlay');
        this.container = document.querySelector('.container');
        this.isOpen = false;
        this.isPermanentlyHidden = localStorage.getItem('drawerHidden') === 'true';
        this.init();
    }

    init() {
        // Add event listeners
        this.drawerToggle.addEventListener('click', () => this.togglePermanentState());
        this.drawerClose.addEventListener('click', () => this.closeDrawer());
        this.overlay.addEventListener('click', () => this.closeDrawer());
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeDrawer();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024 && this.isOpen) {
                this.closeDrawer();
            }
            // Update container position on resize
            this.updateContainerPosition();
        });

        // Set initial state based on saved preference
        if (this.isPermanentlyHidden) {
            this.hideDrawer();
        } else {
            this.showDrawer();
        }
    }

    updateContainerPosition() {
        if (window.innerWidth >= 1024) {
            if (this.isPermanentlyHidden) {
                this.container.style.marginLeft = 'auto';
                this.container.style.marginRight = 'auto';
                this.container.style.maxWidth = '1200px';
            } else {
                this.container.style.marginLeft = '300px';
                this.container.style.marginRight = '0';
                this.container.style.maxWidth = 'calc(1200px - 300px)';
            }
        } else {
            this.container.style.marginLeft = 'auto';
            this.container.style.marginRight = 'auto';
            this.container.style.maxWidth = '1200px';
        }
    }

    toggleDrawer() {
        if (this.isOpen) {
            this.closeDrawer();
        } else {
            this.openDrawer();
        }
    }

    openDrawer() {
        this.drawer.classList.add('translate-x-0');
        this.drawer.classList.remove('-translate-x-full');
        this.overlay.classList.remove('hidden');
        this.overlay.classList.add('opacity-100');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
        this.updateContainerPosition();
    }

    closeDrawer() {
        this.drawer.classList.remove('translate-x-0');
        this.drawer.classList.add('-translate-x-full');
        this.overlay.classList.add('hidden');
        this.overlay.classList.remove('opacity-100');
        this.isOpen = false;
        document.body.style.overflow = '';
        this.updateContainerPosition();
    }

    hideDrawer() {
        this.drawer.classList.add('hidden');
        this.isPermanentlyHidden = true;
        localStorage.setItem('drawerHidden', 'true');
        document.body.classList.add('drawer-hidden');
        this.updateToggleButton();
        this.updateContainerPosition();
    }

    showDrawer() {
        this.drawer.classList.remove('hidden');
        this.isPermanentlyHidden = false;
        localStorage.setItem('drawerHidden', 'false');
        document.body.classList.remove('drawer-hidden');
        this.updateToggleButton();
        this.updateContainerPosition();
    }

    togglePermanentState() {
        if (this.isPermanentlyHidden) {
            this.showDrawer();
        } else {
            this.hideDrawer();
        }
    }

    updateToggleButton() {
        const toggleBtn = document.getElementById('drawer-toggle');
        const icon = toggleBtn.querySelector('i');
        
        if (this.isPermanentlyHidden) {
            icon.className = 'fas fa-chevron-right';
            toggleBtn.setAttribute('title', 'Show Drawer');
        } else {
            icon.className = 'fas fa-chevron-left';
            toggleBtn.setAttribute('title', 'Hide Drawer');
        }
    }
}

// Initialize drawer handler
const drawerHandler = new DrawerHandler(); 
// Navigation Mega Menu Functionality
declare global {
    interface Window {
        navigationManager: NavigationManager;
    }
}

export class NavigationManager {
    private resizeTimer: number | undefined;

    constructor() {
        this.init();
    }

    init() {
        this.addDesktopChevrons();
        this.setupMegaMenuToggles();
        this.setupMobileAccordion();
        this.setupMobileMenuToggle();
        this.setupClickOutside();
        this.setupWindowResize();
        this.setupSearchToggle();
        this.positionMegaMenus();
    }

    /**
     * Adds chevron buttons to menu items with children in desktop view.
     * These chevrons toggle the mega menu on click.
     */
    addDesktopChevrons() {
        const dropdownToggles = document.querySelectorAll('.navbar-nav .dropdown-toggle[data-mega-menu]');
        
        dropdownToggles.forEach(toggle => {
            // Create chevron button
            const chevronBtn = document.createElement('button');
            chevronBtn.className = 'nav-chevron-btn d-none d-lg-inline-block';
            chevronBtn.innerHTML = '<svg data-v-5786bfb0="" class="chevron-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path data-v-5786bfb0="" d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
            chevronBtn.setAttribute('aria-label', 'Toggle submenu');
            chevronBtn.setAttribute('type', 'button');
            
            // Insert chevron after the toggle link
            if (toggle.parentElement) {
                toggle.parentElement.insertBefore(chevronBtn, toggle.nextSibling);
            }
        });
    }

    setupMegaMenuToggles() {
        const dropdownToggles = document.querySelectorAll('.navbar-nav .dropdown-toggle[data-mega-menu]');
        
        dropdownToggles.forEach(toggle => {
            const megaMenuId = toggle.getAttribute('data-mega-menu');
            const megaMenu = document.getElementById(megaMenuId || '');
            const dropdownItem = toggle.closest('.dropdown');
            
            // Get the mobile section ID from the mega menu ID
            const mobileSection = document.getElementById(megaMenuId?.replace('mega-menu-', 'mobile-section-') || '');
            
            // Get the chevron button (desktop only)
            const chevronBtn = toggle.parentElement?.querySelector('.nav-chevron-btn');
            
            if (megaMenu || mobileSection) {
                // Mobile click behavior on toggle link
                toggle.addEventListener('click', (e) => {
                    const isMobile = window.innerWidth <= 991;
                    
                    if (isMobile && mobileSection) {
                        e.preventDefault();
                        // Mobile behavior: toggle mobile section
                        const isOpen = mobileSection.style.display === 'block';
                        
                        // Close all other mobile sections
                        this.closeAllMobileSections();
                        
                        // Toggle current mobile section
                        if (!isOpen) {
                            mobileSection.style.display = 'block';
                            if (dropdownItem) {
                                dropdownItem.classList.add('show');
                            }
                            toggle.setAttribute('aria-expanded', 'true');
                        } else {
                            toggle.setAttribute('aria-expanded', 'false');
                        }
                    } else if (!isMobile) {
                        // Desktop: prevent default click, let link navigate normally if clicked
                        // Submenu will be handled by hover
                    }
                });

                // Desktop hover behavior on toggle link (not on mobile)
                if (megaMenu) {
                    toggle.addEventListener('mouseenter', () => {
                        if (window.innerWidth > 991) {
                            this.closeAllMegaMenus();
                            this.showMegaMenu(megaMenu);
                            if (dropdownItem) {
                                dropdownItem.classList.add('show');
                            }
                            toggle.setAttribute('aria-expanded', 'true');
                            if (chevronBtn) {
                                chevronBtn.classList.add('chevron-expanded');
                            }
                        }
                    });

                    // Close menu when hovering out of the mega menu itself
                    megaMenu.addEventListener('mouseleave', () => {
                        if (window.innerWidth > 991) {
                            this.hideMegaMenu(megaMenu);
                            if (dropdownItem) {
                                dropdownItem.classList.remove('show');
                            }
                            toggle.setAttribute('aria-expanded', 'false');
                            if (chevronBtn) {
                                chevronBtn.classList.remove('chevron-expanded');
                            }
                        }
                    });

                    // Keep menu open when hovering over the mega menu
                    megaMenu.addEventListener('mouseenter', () => {
                        if (window.innerWidth > 991) {
                            // Cancel any pending close
                        }
                    });
                }

                // Chevron button click behavior (desktop only)
                if (chevronBtn && megaMenu) {
                    chevronBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if (window.innerWidth > 991) {
                            const isOpen = megaMenu.classList.contains('show');
                            
                            // Close all other mega menus
                            this.closeAllMegaMenus();
                            
                            // Toggle current mega menu
                            if (!isOpen) {
                                this.showMegaMenu(megaMenu);
                                if (dropdownItem) {
                                    dropdownItem.classList.add('show');
                                }
                                toggle.setAttribute('aria-expanded', 'true');
                                chevronBtn.classList.add('chevron-expanded');
                            } else {
                                toggle.setAttribute('aria-expanded', 'false');
                                chevronBtn.classList.remove('chevron-expanded');
                            }
                        }
                    });
                }

                // Keyboard navigation support for accessibility
                toggle.addEventListener('keydown', (e) => {
                    const keyEvent = e as KeyboardEvent;
                    if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
                        e.preventDefault();
                        (toggle as HTMLElement).click();
                    }
                    // Escape key closes the menu
                    if (keyEvent.key === 'Escape') {
                        this.closeAllMegaMenus();
                        this.closeAllMobileSections();
                        (toggle as HTMLElement).focus();
                    }
                });
            }
        });
    }

    /**
     * Sets up mobile accordion behavior for level 3 navigation items.
     * On mobile devices (<=991px), level 2 items with children become accordion toggles
     * that show/hide their level 3 children with smooth animations.
     */
    setupMobileAccordion() {
        const mobileToggles = document.querySelectorAll('.mobile-accordion-toggle');
        
        mobileToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                // Only handle mobile accordion behavior on small screens
                if (window.innerWidth <= 991) {
                    e.preventDefault();
                    
                    const targetId = toggle.getAttribute('data-mobile-target');
                    if (!targetId) return;
                    
                    const targetElement = document.getElementById(targetId);
                    if (!targetElement) return;
                    
                    const arrow = toggle.querySelector('.mobile-accordion-arrow');
                    const isExpanded = targetElement.classList.contains('mobile-level3-show');
                    
                    // Close all other level 3 menus
                    document.querySelectorAll('.mobile-level3-show').forEach(el => {
                        if (el !== targetElement) {
                            el.classList.remove('mobile-level3-show');
                            el.classList.add('mobile-level3-hidden');
                        }
                    });
                    
                    // Reset all other arrows
                    document.querySelectorAll('.mobile-accordion-arrow').forEach(arr => {
                        if (arr !== arrow) {
                            arr.classList.remove('mobile-accordion-expanded');
                        }
                    });
                    
                    // Toggle current target
                    if (isExpanded) {
                        targetElement.classList.remove('mobile-level3-show');
                        targetElement.classList.add('mobile-level3-hidden');
                        arrow?.classList.remove('mobile-accordion-expanded');
                        toggle.setAttribute('aria-expanded', 'false');
                    } else {
                        targetElement.classList.remove('mobile-level3-hidden');
                        targetElement.classList.add('mobile-level3-show');
                        arrow?.classList.add('mobile-accordion-expanded');
                        toggle.setAttribute('aria-expanded', 'true');
                    }
                }
            });
        });
    }

    /**
     * Sets up mobile menu toggle functionality and logo resizing.
     * When mobile menu is toggled, the logo height is adjusted to 65px.
     */
    setupMobileMenuToggle() {
        const mobileToggle = document.querySelector('.navbar-toggler') as HTMLElement;
        const logo = document.querySelector('.logo-img') as HTMLElement;
        
        if (mobileToggle && logo) {
            mobileToggle.addEventListener('click', () => {
                // Check the current aria-expanded state to determine what will happen
                const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
                
                if (isExpanded) {
                    // Menu is currently open, will close - shrink logo (inverted logic fix)
                    setTimeout(() => {
                        logo.style.height = '65px';
                        logo.style.transition = 'height 0.3s ease';
                    }, 50);
                } else {
                    // Menu is currently closed, will open - restore original logo size (inverted logic fix)
                    setTimeout(() => {
                        logo.style.height = '';
                        logo.style.transition = 'height 0.3s ease';
                    }, 50);
                }
            });
        }
    }

    /**
     * Resets all mobile accordion states to their initial closed state.
     * Called when resizing from mobile to desktop to ensure clean state.
     */
    resetMobileAccordions() {
        // Reset all level 3 menus to hidden state
        document.querySelectorAll('.mobile-level3-show').forEach(el => {
            el.classList.remove('mobile-level3-show');
            el.classList.add('mobile-level3-hidden');
        });
        
        // Reset all arrows
        document.querySelectorAll('.mobile-accordion-arrow').forEach(arrow => {
            arrow.classList.remove('mobile-accordion-expanded');
        });
        
        // Reset aria-expanded attributes
        document.querySelectorAll('.mobile-accordion-toggle').forEach(toggle => {
            toggle.setAttribute('aria-expanded', 'false');
        });
    }

    /**
     * Resets the logo to its original size.
     * Called when switching from mobile to desktop view.
     */
    resetLogoSize() {
        const logo = document.querySelector('.logo-img') as HTMLElement;
        if (logo) {
            logo.style.height = '';
            logo.style.transition = 'height 0.3s ease';
        }
    }

    positionMegaMenus() {
        const navbar = document.querySelector('.navbar') as HTMLElement;
        if (navbar) {
            const navbarHeight = navbar.offsetHeight;
            const megaMenus = document.querySelectorAll('.mega-menu-container') as NodeListOf<HTMLElement>;
            
            megaMenus.forEach(menu => {
                menu.style.top = `${navbarHeight}px`;
            });
        }
    }

    showMegaMenu(megaMenu: HTMLElement) {
        megaMenu.classList.add('show');
        megaMenu.setAttribute('aria-hidden', 'false');
    }

    hideMegaMenu(megaMenu: HTMLElement) {
        megaMenu.classList.remove('show');
        megaMenu.setAttribute('aria-hidden', 'true');
    }

    closeAllMegaMenus() {
        const megaMenus = document.querySelectorAll('.mega-menu-container');
        const toggles = document.querySelectorAll('.navbar-nav .dropdown-toggle');
        const dropdowns = document.querySelectorAll('.navbar-nav .dropdown');
        const chevronBtns = document.querySelectorAll('.nav-chevron-btn');
        
        megaMenus.forEach(menu => {
            menu.classList.remove('show');
            menu.setAttribute('aria-hidden', 'true');
        });
        
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
        });
        
        toggles.forEach(toggle => {
            toggle.setAttribute('aria-expanded', 'false');
        });

        chevronBtns.forEach(btn => {
            btn.classList.remove('chevron-expanded');
        });
    }

    closeAllMobileSections() {
        const mobileSections = document.querySelectorAll('.mobile-nav-section');
        const toggles = document.querySelectorAll('.navbar-nav .dropdown-toggle');
        const dropdowns = document.querySelectorAll('.navbar-nav .dropdown');
        
        mobileSections.forEach(section => {
            (section as HTMLElement).style.display = 'none';
        });
        
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
        });
        
        toggles.forEach(toggle => {
            toggle.setAttribute('aria-expanded', 'false');
        });
    }

    setupClickOutside() {
        document.addEventListener('click', (e) => {
            const target = e.target as Element;
            if (target && !target.closest('.navbar-nav') && !target.closest('.navbar-toggler') && !target.closest('.mega-menu-container') && !target.closest('.mobile-nav-section')) {
                this.closeAllMegaMenus();
                this.closeAllMobileSections();
            }
        });
    }

    setupWindowResize() {
        window.addEventListener('resize', () => {
            if (this.resizeTimer) {
                clearTimeout(this.resizeTimer);
            }
            this.resizeTimer = window.setTimeout(() => {
                this.positionMegaMenus();
                if (window.innerWidth >= 992) {
                    // Remove mobile dropdown states on desktop
                    this.closeAllMegaMenus();
                    this.closeAllMobileSections();
                    // Reset mobile accordion states
                    this.resetMobileAccordions();
                    // Reset logo size when switching to desktop
                    this.resetLogoSize();
                }
            }, 150);
        });
    }

    setupSearchToggle() {
        const searchToggle = document.getElementById('search-toggle');
        if (searchToggle) {
            searchToggle.addEventListener('click', (e) => {
                e.preventDefault();
                // Add search functionality here
                console.log('Search toggle clicked');
                // You can emit a custom event or call a search function here
                this.triggerSearch();
            });
        }
    }

    closeAllDropdowns() {
        // Legacy method - now calls closeAllMegaMenus for compatibility
        this.closeAllMegaMenus();
    }

    triggerSearch() {
        // Emit custom event for search
        const searchEvent = new CustomEvent('navigationSearch', {
            detail: { timestamp: Date.now() }
        });
        document.dispatchEvent(searchEvent);
    }

    // Public method to close dropdowns (can be called from other scripts)
    close() {
        this.closeAllMegaMenus();
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});

// Export for use in other modules
export default NavigationManager;

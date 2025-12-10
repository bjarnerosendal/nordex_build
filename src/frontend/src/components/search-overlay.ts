// ============================================
// Search Overlay Functionality
// ============================================

export interface SearchOverlayOptions {
  searchPageUrl: string;
}

export class SearchOverlay {
  private searchToggle!: HTMLElement | null;
  private searchOverlay!: HTMLElement | null;
  private searchForm!: HTMLFormElement | null;
  private searchInput!: HTMLInputElement | null;
  private searchClose!: HTMLElement | null;
  private searchPageUrl: string;

  constructor(options: SearchOverlayOptions) {
    this.searchPageUrl = options.searchPageUrl;
    this.initializeElements();
    this.bindEvents();
  }

  private initializeElements(): void {
    this.searchToggle = document.getElementById('search-toggle');
    this.searchOverlay = document.getElementById('search-overlay');
    this.searchForm = document.getElementById('header-search-form') as HTMLFormElement;
    this.searchInput = document.getElementById('header-search-input') as HTMLInputElement;
    this.searchClose = document.getElementById('search-close');
  }

  private bindEvents(): void {
    // Open search overlay
    if (this.searchToggle && this.searchOverlay) {
      this.searchToggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.openSearch();
      });
    }

    // Close button
    if (this.searchClose) {
      this.searchClose.addEventListener('click', () => {
        this.closeSearch();
      });
    }

    // Close on overlay click (but not on content)
    if (this.searchOverlay) {
      this.searchOverlay.addEventListener('click', (e) => {
        if (e.target === this.searchOverlay) {
          this.closeSearch();
        }
      });
    }

    // Handle search form submission
    if (this.searchForm && this.searchInput) {
      this.searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.performSearch();
      });
    }

    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // ESC to close
      if (e.key === 'Escape' && this.searchOverlay?.classList.contains('active')) {
        this.closeSearch();
      }

      // Ctrl/Cmd + K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.searchToggle?.click();
      }
    });
  }

  private openSearch(): void {
    if (!this.searchOverlay || !this.searchInput) return;

    this.searchOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus input after animation
    setTimeout(() => {
      this.searchInput?.focus();
    }, 300);
  }

  private closeSearch(): void {
    if (!this.searchOverlay || !this.searchInput) return;

    this.searchOverlay.classList.remove('active');
    document.body.style.overflow = '';
    this.searchInput.value = '';
  }

  private performSearch(): void {
    if (!this.searchInput) return;

    const searchTerm = this.searchInput.value.trim();

    if (searchTerm) {
      // Redirect to search page with query parameter
      window.location.href = `${this.searchPageUrl}?search=${encodeURIComponent(searchTerm)}`;
    }
  }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if search overlay exists and get search page URL from data attribute
  const searchOverlay = document.getElementById('search-overlay');
  if (searchOverlay) {
    const searchPageUrl = searchOverlay.dataset.searchUrl;
    if (searchPageUrl) {
      new SearchOverlay({ searchPageUrl });
    }
  }
});

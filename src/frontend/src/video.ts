// ============================================
// Video Component TypeScript
// ============================================

import translationService from './translation';

interface VideoComponent {
  container: HTMLElement;
  videoId: string;
  thumbnailElement: HTMLElement;
  iframeContainer: HTMLElement;
  contentElement: HTMLElement;
  isLoaded: boolean;
}

class VideoManager {
  private videos: Map<string, VideoComponent> = new Map();
  private cookieConsentLoaded = false;
  private marketingCookiesAccepted = false;

  constructor() {
    this.init();
  }

  private init(): void {
    // Check if Cookiebot script is loaded
    this.checkCookiebot();
    
    // Initialize all video components
    this.initializeVideos();
    
    // Listen for cookie consent changes
    this.setupCookieListeners();
  }

  private checkCookiebot(): void {
    // Check if Cookiebot is available
    if (typeof (window as any).Cookiebot !== 'undefined') {
      this.cookieConsentLoaded = true;
      this.checkMarketingCookies();
    }
  }

  private checkMarketingCookies(): void {
    if (!this.cookieConsentLoaded) {
      this.marketingCookiesAccepted = true; // Default to true if no cookie consent
      return;
    }

    try {
      const cookiebot = (window as any).Cookiebot;
      // Check if marketing cookies are accepted
      this.marketingCookiesAccepted = cookiebot.consent.marketing === true;
    } catch (error) {
      console.warn('Error checking cookie consent:', error);
      this.marketingCookiesAccepted = true; // Fallback to true
    }
  }

  private setupCookieListeners(): void {
    if (!this.cookieConsentLoaded) return;

    // Listen for Cookiebot consent changes
    window.addEventListener('CookiebotOnAccept', () => {
      this.checkMarketingCookies();
      this.updateVideoStates();
    });

    window.addEventListener('CookiebotOnDecline', () => {
      this.checkMarketingCookies();
      this.updateVideoStates();
    });

    window.addEventListener('CookiebotOnDialogInit', () => {
      this.checkMarketingCookies();
      this.updateVideoStates();
    });
  }

  private initializeVideos(): void {
    const videoContainers = document.querySelectorAll('.video-block');
    
    videoContainers.forEach((element) => {
      const container = element as HTMLElement;
      const videoId = this.extractVideoIdFromContainer(container);
      if (!videoId) return;

      const thumbnailElement = container.querySelector('.video-thumbnail, .video-no-thumbnail') as HTMLElement;
      const iframeContainer = container.querySelector('.video-iframe-container') as HTMLElement;
      const contentElement = container.querySelector('.video-content') as HTMLElement;
      if (!thumbnailElement || !iframeContainer || !contentElement) return;

      const video: VideoComponent = {
        container,
        videoId,
        thumbnailElement,
        iframeContainer,
        contentElement,
        isLoaded: false
      };

      this.videos.set(container.id, video);
      this.setupVideoClickHandler(video);
    });
  }

  private extractVideoIdFromContainer(container: HTMLElement): string {
    const playButton = container.querySelector('[data-video-id]') as HTMLElement;
    return playButton?.dataset.videoId || '';
  }

  private setupVideoClickHandler(video: VideoComponent): void {
    const playButton = video.thumbnailElement.querySelector('.video-play-button') as HTMLElement;
    
    if (!playButton) return;

    playButton.addEventListener('click', (event) => {
      event.preventDefault();
      this.handleVideoPlay(video);
    });

    // Also make the entire thumbnail clickable
    video.thumbnailElement.addEventListener('click', (event) => {
      if (event.target !== playButton && !playButton.contains(event.target as Node)) {
        event.preventDefault();
        this.handleVideoPlay(video);
      }
    });
  }

  private handleVideoPlay(video: VideoComponent): void {
    if (video.isLoaded) return;
    // Check cookie consent
    if (this.cookieConsentLoaded && !this.marketingCookiesAccepted) {
      this.showCookieNotice(video);
      return;
    }

    this.loadVideo(video);
  }

  private showCookieNotice(video: VideoComponent): void {
    // Check if notice already exists
    const existingNotice = video.container.querySelector('.video-cookie-notice');
    if (existingNotice) return;

    const notice = document.createElement('div');
    notice.className = 'video-cookie-notice';
    notice.innerHTML = `
      <button type="button" class="cookie-notice-close" aria-label="${translationService.get('Video.CloseNotice')}">×</button>
      <div class="cookie-notice-icon">🍪</div>
      <div class="cookie-notice-title">${translationService.get('Video.MarketingCookiesRequired')}</div>
      <div class="cookie-notice-text">
        ${translationService.get('Video.CookieNoticeText')}
      </div>
      <div class="cookie-notice-buttons">
        <button type="button" class="cookie-notice-button" data-action="open-cookie-settings">
          ${translationService.get('Video.UpdateCookieSettings')}
        </button>
      </div>
    `;

    const settingsButton = notice.querySelector('.cookie-notice-button') as HTMLElement;
    settingsButton.addEventListener('click', () => {
      // Open cookie settings if Cookiebot is available
      if (typeof (window as any).Cookiebot !== 'undefined') {
        (window as any).Cookiebot.show();
      }
    });

    const closeButton = notice.querySelector('.cookie-notice-close') as HTMLElement;
    closeButton.addEventListener('click', () => {
      notice.remove();
    });

    video.container.appendChild(notice);
  }

  private loadVideo(video: VideoComponent): void {

    if (video.isLoaded) return;

    // Mark as loaded immediately to prevent multiple clicks
    video.isLoaded = true;

    // Add loading state
    video.container.classList.add('video-loading');

    // Create YouTube iframe with nocookie domain
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('title', translationService.get('Video.YouTubePlayer'));

    // Add iframe to container immediately
    video.iframeContainer.appendChild(iframe);

    // Wait for iframe to load
    iframe.onload = () => {
      // Hide thumbnail and show iframe
      video.thumbnailElement.style.display = 'none';
      video.iframeContainer.style.display = 'block';
      video.contentElement.style.display = 'none'; // Ensure content is behind the video

      // Remove loading state
      video.container.classList.remove('video-loading');
    };

    iframe.onerror = () => {
      console.error('Failed to load YouTube video:', video.videoId);
      video.container.classList.remove('video-loading');
      video.isLoaded = false; // Reset so user can try again
      this.showVideoError(video);
    };
  }

  private showVideoError(video: VideoComponent): void {
    const error = document.createElement('div');
    error.className = 'video-error';
    error.innerHTML = `
      <p class="text-center text-muted">
        ${translationService.get('Video.ConnectionError')}
      </p>
    `;
    
    video.iframeContainer.appendChild(error);
  }



  private updateVideoStates(): void {
    // Remove cookie notices if marketing cookies are now accepted
    if (this.marketingCookiesAccepted) {
      document.querySelectorAll('.video-cookie-notice').forEach(notice => {
        notice.remove();
      });
    }
  }

  public refreshVideos(): void {
    // Clear existing videos
    this.videos.clear();
    
    // Re-initialize
    this.initializeVideos();
  }
}

// Initialize video manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const videoManager = new VideoManager();
  
  // Make it globally available for dynamic content
  (window as any).videoManager = videoManager;
});

// Handle dynamic content updates (e.g., AJAX loaded content)
document.addEventListener('contentUpdated', () => {
  if ((window as any).videoManager) {
    (window as any).videoManager.refreshVideos();
  }
});

export default VideoManager;

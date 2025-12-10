// ============================================
// Translation Service
// ============================================

export interface Translations {
  'Video.CloseNotice': string;
  'Video.MarketingCookiesRequired': string;
  'Video.CookieNoticeText': string;
  'Video.UpdateCookieSettings': string;
  'Video.YouTubePlayer': string;
  'Video.ConnectionError': string;
  'languagePicker.toggle': string;
  'ContentResults.SearchResults': string;
  'ContentResults.Result': string;
  'ContentResults.Results': string;
  'ContentResults.Found': string;
  'ContentResults.LoadingResults': string;
  'ContentResults.NoResultsFound': string;
  'ContentResults.Previous': string;
  'ContentResults.Next': string;
  'ContentResults.Page': string;
  'ContentResults.Of': string;
  'TagFilter.TextSearch': string;
  'TagFilter.SearchInContent': string;
  'TagFilter.ClearSearch': string;
  'TagFilter.FilterByTags': string;
}

class TranslationService {
  private translations: Partial<Translations> = {};
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;
  private loadedCallbacks: (() => void)[] = [];
  private readonly CACHE_KEY = 'umbraco_translations';
  private readonly CACHE_VERSION_KEY = 'umbraco_translations_version';
  private readonly CURRENT_VERSION = '1.0'; // Increment this to invalidate cache

  async loadTranslations(culture?: string): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Try to load from cache first
    const cached = this.loadFromCache(culture);
    if (cached) {
      this.translations = cached;
      this.isLoaded = true;
      // Notify callbacks immediately
      this.loadedCallbacks.forEach(callback => callback());
      this.loadedCallbacks = [];
      return Promise.resolve();
    }

    this.loadPromise = this.fetchTranslations(culture);
    return this.loadPromise;
  }

  // Add callback to be notified when translations are loaded
  onLoaded(callback: () => void): void {
    if (this.isLoaded) {
      callback();
    } else {
      this.loadedCallbacks.push(callback);
    }
  }

  private getCacheKey(culture?: string): string {
    return culture ? `${this.CACHE_KEY}_${culture}` : this.CACHE_KEY;
  }

  private loadFromCache(culture?: string): Partial<Translations> | null {
    try {
      const cacheKey = this.getCacheKey(culture);
      const versionKey = `${this.CACHE_VERSION_KEY}_${culture || 'default'}`;
      
      // Check if cache version matches
      const cachedVersion = sessionStorage.getItem(versionKey);
      if (cachedVersion !== this.CURRENT_VERSION) {
        // Clear old cache if version doesn't match
        this.clearCache(culture);
        return null;
      }

      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Error loading translations from cache:', error);
      // Clear corrupted cache
      this.clearCache(culture);
    }
    return null;
  }

  private saveToCache(translations: Partial<Translations>, culture?: string): void {
    try {
      const cacheKey = this.getCacheKey(culture);
      const versionKey = `${this.CACHE_VERSION_KEY}_${culture || 'default'}`;
      
      sessionStorage.setItem(cacheKey, JSON.stringify(translations));
      sessionStorage.setItem(versionKey, this.CURRENT_VERSION);
    } catch (error) {
      console.warn('Error saving translations to cache:', error);
    }
  }

  private clearCache(culture?: string): void {
    try {
      const cacheKey = this.getCacheKey(culture);
      const versionKey = `${this.CACHE_VERSION_KEY}_${culture || 'default'}`;
      
      sessionStorage.removeItem(cacheKey);
      sessionStorage.removeItem(versionKey);
    } catch (error) {
      console.warn('Error clearing translation cache:', error);
    }
  }

  private async fetchTranslations(culture?: string): Promise<void> {
    try {
      console.log('Fetching translations from API');
      const url = culture 
        ? `/api/translation/translations?culture=${encodeURIComponent(culture)}`
        : '/api/translation/translations';
      
      const response = await fetch(url);
      if (response.ok) {
        this.translations = await response.json();
        this.isLoaded = true;
        
        // Save to cache for future use
        this.saveToCache(this.translations, culture);
        
        // Notify all waiting callbacks
        this.loadedCallbacks.forEach(callback => callback());
        this.loadedCallbacks = [];
      } else {
        console.warn('Failed to load translations');
        this.isLoaded = true;
        // Still notify callbacks even on failure
        this.loadedCallbacks.forEach(callback => callback());
        this.loadedCallbacks = [];
      }
    } catch (error) {
      console.warn('Error loading translations:', error);
      this.isLoaded = true;
      // Still notify callbacks even on error
      this.loadedCallbacks.forEach(callback => callback());
      this.loadedCallbacks = [];
    }
  }

  get<K extends keyof Translations>(key: K): string {
    return this.translations[key] || key;
  }

  isReady(): boolean {
    return this.isLoaded;
  }

  // Public method to clear cache (useful for debugging or when translations are updated)
  clearTranslationCache(culture?: string): void {
    this.clearCache(culture);
  }

  // Public method to force reload translations (bypasses cache)
  async forceReload(culture?: string): Promise<void> {
    this.clearCache(culture);
    this.isLoaded = false;
    this.loadPromise = null;
    await this.loadTranslations(culture);
  }
}

// Create singleton instance
const translationService = new TranslationService();

// Auto-load translations when module is imported
const language = document.documentElement.dataset.lang || '';
translationService.loadTranslations(language).catch(console.error);

// Make translation service available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).translationService = translationService;

}

export default translationService;

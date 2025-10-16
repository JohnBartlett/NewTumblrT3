/**
 * Image Cache Utility
 * Provides utilities for preloading and caching images
 */

interface ImageCacheEntry {
  url: string;
  timestamp: number;
  blob?: Blob;
}

class ImageCacheManager {
  private cache: Map<string, ImageCacheEntry> = new Map();
  private readonly CACHE_KEY = 'TUMBLR_IMAGE_CACHE';
  private readonly MAX_AGE = 1000 * 60 * 60 * 24 * 30; // 30 days

  constructor() {
    this.loadFromLocalStorage();
  }

  /**
   * Preload an image and add it to cache
   */
  async preloadImage(url: string): Promise<void> {
    if (this.cache.has(url)) {
      return; // Already cached
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        this.cache.set(url, {
          url,
          timestamp: Date.now(),
        });
        this.saveToLocalStorage();
        resolve();
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };

      img.src = url;
    });
  }

  /**
   * Preload multiple images in parallel
   */
  async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.preloadImage(url).catch(() => {
      console.warn(`Failed to preload image: ${url}`);
    }));
    await Promise.all(promises);
  }

  /**
   * Check if an image is cached
   */
  isCached(url: string): boolean {
    const entry = this.cache.get(url);
    if (!entry) return false;

    // Check if cache is expired
    if (Date.now() - entry.timestamp > this.MAX_AGE) {
      this.cache.delete(url);
      this.saveToLocalStorage();
      return false;
    }

    return true;
  }

  /**
   * Get cached image URLs
   */
  getCachedUrls(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    const now = Date.now();
    let hasChanges = false;

    for (const [url, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.MAX_AGE) {
        this.cache.delete(url);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.saveToLocalStorage();
    }
  }

  /**
   * Clear all cached images
   */
  clearAll(): void {
    this.cache.clear();
    localStorage.removeItem(this.CACHE_KEY);
  }

  /**
   * Get cache statistics
   */
  getStats(): { count: number; oldestTimestamp: number; newestTimestamp: number } {
    if (this.cache.size === 0) {
      return { count: 0, oldestTimestamp: 0, newestTimestamp: 0 };
    }

    let oldest = Date.now();
    let newest = 0;

    for (const entry of this.cache.values()) {
      if (entry.timestamp < oldest) oldest = entry.timestamp;
      if (entry.timestamp > newest) newest = entry.timestamp;
    }

    return {
      count: this.cache.size,
      oldestTimestamp: oldest,
      newestTimestamp: newest,
    };
  }

  /**
   * Save cache metadata to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      const data = Array.from(this.cache.entries()).map(([url, entry]) => ({
        url,
        timestamp: entry.timestamp,
      }));
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save image cache to localStorage:', error);
    }
  }

  /**
   * Load cache metadata from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem(this.CACHE_KEY);
      if (!data) return;

      const entries = JSON.parse(data) as Array<{ url: string; timestamp: number }>;
      for (const entry of entries) {
        this.cache.set(entry.url, entry);
      }

      // Clean up expired entries on load
      this.clearExpired();
    } catch (error) {
      console.error('Failed to load image cache from localStorage:', error);
    }
  }
}

// Export singleton instance
export const imageCache = new ImageCacheManager();

/**
 * Preload blog images (avatars and headers)
 */
export function preloadBlogImages(blogs: Array<{ avatar?: string | null; headerImage?: string | null }>) {
  const urls = blogs
    .flatMap(blog => [blog.avatar, blog.headerImage])
    .filter((url): url is string => Boolean(url));
  
  return imageCache.preloadImages(urls);
}


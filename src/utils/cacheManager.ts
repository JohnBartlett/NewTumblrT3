/**
 * Cache Manager Utility
 * Provides general-purpose caching with localStorage
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class CacheManager {
  private readonly prefix: string;

  constructor(prefix: string = 'TUMBLR_CACHE') {
    this.prefix = prefix;
  }

  /**
   * Set a cache entry
   */
  set<T>(key: string, data: T, ttl: number = 1000 * 60 * 60): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
      };

      localStorage.setItem(
        `${this.prefix}_${key}`,
        JSON.stringify(entry)
      );
    } catch (error) {
      console.error('Failed to set cache entry:', error);
      // If storage is full, try to clear old entries
      this.clearExpired();
    }
  }

  /**
   * Get a cache entry
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`${this.prefix}_${key}`);
      if (!item) return null;

      const entry = JSON.parse(item) as CacheEntry<T>;

      // Check if expired
      if (Date.now() > entry.expiresAt) {
        this.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Failed to get cache entry:', error);
      return null;
    }
  }

  /**
   * Delete a cache entry
   */
  delete(key: string): void {
    localStorage.removeItem(`${this.prefix}_${key}`);
  }

  /**
   * Check if a cache entry exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear all cache entries with this prefix
   */
  clear(): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    const keysToRemove: string[] = [];
    const now = Date.now();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(this.prefix)) continue;

      try {
        const item = localStorage.getItem(key);
        if (!item) continue;

        const entry = JSON.parse(item) as CacheEntry<unknown>;
        if (now > entry.expiresAt) {
          keysToRemove.push(key);
        }
      } catch {
        // Invalid entry, remove it
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Get cache statistics
   */
  getStats(): { count: number; totalSize: number } {
    let count = 0;
    let totalSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(this.prefix)) continue;

      count++;
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += new Blob([item]).size;
      }
    }

    return { count, totalSize };
  }
}

// Export singleton instances for different cache types
export const searchCache = new CacheManager('TUMBLR_SEARCH');
export const blogCache = new CacheManager('TUMBLR_BLOG');
export const userCache = new CacheManager('TUMBLR_USER');


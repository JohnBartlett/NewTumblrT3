# Caching Implementation

This document explains the comprehensive caching system implemented in the Tumblr T3 app.

## Overview

The app now has **multi-layer caching** for optimal performance:

1. **Service Worker Caching** - Browser-level caching for offline support
2. **React Query Caching** - In-memory + localStorage persistence
3. **Image Caching** - Aggressive image preloading and caching
4. **General Cache Manager** - Flexible localStorage caching

---

## 1. Service Worker Caching

**Location:** `src/sw.ts`

### What's Cached:

- **Images:** 500 entries, 90 days (local images)
- **External Images:** 300 entries, 60 days (Unsplash, DiceBear, Tumblr CDN)
- **Fonts:** 30 entries, 1 year
- **Static Assets:** Scripts, styles, workers (stale-while-revalidate)
- **API Responses:** 100 entries, 24 hours (network-first)

### Features:

- Automatic cache purging when quota exceeded
- Offline fallback page
- Background sync support
- Push notifications support

---

## 2. React Query Caching

**Location:** `src/lib/queryClient.ts`

### Configuration:

- **Stale Time:** 10 minutes
- **Cache Time:** 24 hours
- **Garbage Collection:** 24 hours
- **localStorage Persistence:** 7 days

### What's Cached:

- Search results
- Blog data
- User profiles
- Posts feed
- Any API query marked as successful

### Features:

- Automatic refetch on window focus
- Automatic refetch on reconnect
- Retry failed queries (3 attempts)
- Persists to localStorage across sessions

---

## 3. Image Cache

**Location:** `src/utils/imageCache.ts`

### Features:

- **Preloading:** Automatically preloads blog avatars and headers
- **Max Age:** 30 days
- **localStorage Metadata:** Tracks cached images
- **Automatic Cleanup:** Removes expired entries

### Usage:

\`\`\`typescript
import { imageCache, preloadBlogImages } from '@/utils/imageCache';

// Preload a single image
await imageCache.preloadImage('https://example.com/image.jpg');

// Preload multiple images
await imageCache.preloadImages([url1, url2, url3]);

// Preload blog images
await preloadBlogImages(blogs);

// Check if cached
if (imageCache.isCached(url)) {
  console.log('Image is cached!');
}

// Get stats
const stats = imageCache.getStats();
console.log(\`Cached \${stats.count} images\`);

// Clear cache
imageCache.clearAll();
\`\`\`

---

## 4. General Cache Manager

**Location:** `src/utils/cacheManager.ts`

### Features:

- **Flexible TTL:** Set custom expiration for each entry
- **Type-Safe:** Full TypeScript support
- **Automatic Expiration:** Removes expired entries
- **Multiple Instances:** Separate caches for different data types

### Available Caches:

- `searchCache` - For search-related data
- `blogCache` - For blog-specific data
- `userCache` - For user-related data

### Usage:

\`\`\`typescript
import { searchCache, blogCache } from '@/utils/cacheManager';

// Set cache with 1 hour TTL
searchCache.set('recent-searches', searches, 1000 * 60 * 60);

// Get from cache
const searches = searchCache.get<string[]>('recent-searches');

// Check if exists
if (searchCache.has('recent-searches')) {
  // Use cached data
}

// Clear expired entries
searchCache.clearExpired();

// Get cache stats
const stats = searchCache.getStats();
console.log(\`Cache size: \${stats.totalSize} bytes\`);
\`\`\`

---

## Cache Integration in Search

The Search component automatically:

1. **Preloads images** when search results arrive
2. **Caches search queries** via React Query
3. **Persists results** to localStorage
4. **Reuses cached data** on subsequent searches

### Flow:

\`\`\`
User searches "blog" 
  → React Query checks cache
  → If cached (< 10 min old), return immediately
  → If not, fetch from API
  → Save to cache
  → Preload all blog images in background
  → Service Worker caches images for offline use
\`\`\`

---

## Performance Benefits

### Before Caching:
- Every search: New API call + image downloads
- Slow on repeat visits
- No offline support

### After Caching:
- ✅ Instant search results (cached queries)
- ✅ Images load immediately (preloaded + cached)
- ✅ Works offline (Service Worker)
- ✅ Reduced server load
- ✅ Better user experience

---

## Cache Maintenance

### Automatic Cleanup:

- **Service Worker:** Purges on quota exceeded
- **React Query:** Garbage collection after 24 hours
- **Image Cache:** Clears entries > 30 days old
- **General Cache:** Manual `clearExpired()` or automatic on set

### Manual Maintenance:

\`\`\`typescript
// Clear all caches
imageCache.clearAll();
searchCache.clear();
queryClient.clear();

// Clear only expired
imageCache.clearExpired();
searchCache.clearExpired();
\`\`\`

---

## Storage Usage

Approximate storage per cache type:

- **Service Worker:** ~50-100 MB (images + assets)
- **localStorage (React Query):** ~5-10 MB (JSON data)
- **localStorage (Image metadata):** ~100 KB
- **localStorage (General caches):** ~1-5 MB

**Total:** ~50-115 MB

Modern browsers support **several GB** of storage, so this is well within limits.

---

## Future Enhancements

Potential improvements:

1. **IndexedDB:** For larger data storage
2. **Smart Preloading:** Predict user behavior
3. **Cache Prioritization:** Keep frequently accessed data
4. **Compression:** Compress cached JSON data
5. **Analytics:** Track cache hit rates

---

## Troubleshooting

### Cache not working?

1. Check browser console for errors
2. Verify Service Worker is active (DevTools → Application → Service Workers)
3. Clear browser cache and reload
4. Check localStorage quota

### Images not caching?

1. CORS issues? Images must allow cross-origin access
2. Check image URLs are valid
3. Verify Service Worker is intercepting requests

### localStorage full?

\`\`\`typescript
// Clear old data
searchCache.clearExpired();
imageCache.clearExpired();
queryClient.clear();
\`\`\`

---

## Summary

🎉 **You now have enterprise-grade caching!**

- Images load instantly
- Search is blazing fast
- Works offline
- Reduces server load
- Better UX overall


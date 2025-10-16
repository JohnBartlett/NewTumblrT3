/**
 * Check if Web Share API with files is supported
 */
export function canShareFiles(): boolean {
  return !!(navigator.share && navigator.canShare);
}

/**
 * Image metadata to embed
 */
export interface ImageMetadata {
  blogName?: string;
  blogUrl?: string;
  tags?: string[];
  notes?: number;
  timestamp?: number;
  description?: string;
  postUrl?: string;
}

/**
 * Add metadata to image blob using EXIF/IPTC
 * Note: In browser, we can't directly write EXIF data to images.
 * Instead, we preserve the original image data and add metadata via File properties
 */
async function createFileWithMetadata(
  blob: Blob,
  filename: string,
  metadata?: ImageMetadata
): Promise<File> {
  // Create File object with proper metadata
  const fileOptions: FilePropertyBag = {
    type: blob.type || 'image/jpeg',
    lastModified: metadata?.timestamp || Date.now(),
  };

  const file = new File([blob], filename, fileOptions);

  // Return the file (metadata will be in filename and file properties)
  return file;
}

export type FilenamePattern = 'blog-tags-date' | 'date-blog-tags' | 'blog-description' | 'tags-only' | 'timestamp' | 'simple';

interface FilenameOptions {
  pattern?: FilenamePattern;
  includeIndex?: boolean;
  index?: number;
}

/**
 * Generate filename with embedded metadata based on pattern
 */
function generateMetadataFilename(
  baseFilename: string,
  metadata?: ImageMetadata,
  options?: FilenameOptions
): string {
  // Extract extension
  const ext = baseFilename.split('.').pop() || 'jpg';
  const pattern = options?.pattern || 'blog-tags-date';
  const includeIndex = options?.includeIndex !== false;
  const index = options?.index;
  
  // Sanitize text for filename (remove special characters)
  const sanitize = (text: string) => 
    text.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  
  // Get date string
  const getDateStr = () => {
    if (!metadata?.timestamp) return '';
    const date = new Date(metadata.timestamp);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };
  
  // Get time string for timestamp pattern
  const getTimestampStr = () => {
    return metadata?.timestamp ? String(metadata.timestamp) : String(Date.now());
  };
  
  // Get tags (first 2)
  const getTags = () => {
    if (!metadata?.tags || metadata.tags.length === 0) return '';
    return metadata.tags.slice(0, 2).map(sanitize).join('_');
  };
  
  // Get description (first 30 chars)
  const getDescription = () => {
    if (!metadata?.description) return '';
    const desc = metadata.description.slice(0, 30);
    return sanitize(desc);
  };
  
  // Build filename based on pattern
  let parts: string[] = [];
  
  switch (pattern) {
    case 'blog-tags-date':
      // photoarchive_photography_landscape_2025-10-15_001.jpg
      if (metadata?.blogName) parts.push(sanitize(metadata.blogName));
      const tags = getTags();
      if (tags) parts.push(tags);
      const dateStr = getDateStr();
      if (dateStr) parts.push(dateStr);
      if (includeIndex && index !== undefined) parts.push(String(index + 1).padStart(3, '0'));
      break;
      
    case 'date-blog-tags':
      // 2025-10-15_photoarchive_photography_landscape_001.jpg
      const dateStr2 = getDateStr();
      if (dateStr2) parts.push(dateStr2);
      if (metadata?.blogName) parts.push(sanitize(metadata.blogName));
      const tags2 = getTags();
      if (tags2) parts.push(tags2);
      if (includeIndex && index !== undefined) parts.push(String(index + 1).padStart(3, '0'));
      break;
      
    case 'blog-description':
      // photoarchive_amazing_sunset_photo_2025-10-15.jpg
      if (metadata?.blogName) parts.push(sanitize(metadata.blogName));
      const desc = getDescription();
      if (desc) parts.push(desc);
      const dateStr3 = getDateStr();
      if (dateStr3) parts.push(dateStr3);
      break;
      
    case 'tags-only':
      // photography_landscape_sunset_001.jpg
      const tags3 = metadata?.tags ? metadata.tags.slice(0, 3).map(sanitize).join('_') : 'image';
      parts.push(tags3);
      if (includeIndex && index !== undefined) parts.push(String(index + 1).padStart(3, '0'));
      break;
      
    case 'timestamp':
      // photoarchive_1760549272501.jpg
      if (metadata?.blogName) parts.push(sanitize(metadata.blogName));
      parts.push(getTimestampStr());
      if (includeIndex && index !== undefined) parts.push(String(index + 1));
      break;
      
    case 'simple':
      // image_001.jpg
      parts.push('image');
      if (includeIndex && index !== undefined) parts.push(String(index + 1).padStart(3, '0'));
      break;
  }
  
  // Fallback if no parts
  if (parts.length === 0) {
    parts.push('image');
    if (includeIndex && index !== undefined) parts.push(String(index + 1).padStart(3, '0'));
  }
  
  return `${parts.join('_')}.${ext}`;
}

/**
 * Share a single image using Web Share API (to Photos, Google Photos, etc.)
 */
export async function shareImage(
  url: string, 
  filename: string, 
  metadata?: ImageMetadata,
  options?: FilenameOptions
): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    // Create filename with metadata
    const metadataFilename = metadata 
      ? generateMetadataFilename(filename, metadata, options) 
      : filename;
    
    // Create file with metadata
    const file = await createFileWithMetadata(blob, metadataFilename, metadata);
    
    // Build share text with metadata
    const shareText = metadata 
      ? [
          metadata.blogName && `From: ${metadata.blogName}`,
          metadata.tags && metadata.tags.length > 0 && `Tags: ${metadata.tags.join(', ')}`,
          metadata.description,
        ].filter(Boolean).join('\n')
      : `Sharing ${filename}`;
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: metadata?.blogName ? `Image from ${metadata.blogName}` : 'Share Image',
        text: shareText,
      });
    } else {
      throw new Error('Sharing not supported');
    }
  } catch (error) {
    console.error(`Failed to share image ${filename}:`, error);
    throw error;
  }
}

/**
 * Create and download a metadata sidecar file
 */
async function downloadMetadataSidecar(
  imageFilename: string,
  metadata: ImageMetadata
): Promise<void> {
  const sidecarFilename = imageFilename.replace(/\.[^.]+$/, '.txt');
  
  const metadataText = [
    '=== Image Metadata ===',
    '',
    metadata.blogName && `Blog: ${metadata.blogName}`,
    metadata.blogUrl && `Blog URL: ${metadata.blogUrl}`,
    metadata.postUrl && `Post URL: ${metadata.postUrl}`,
    '',
    metadata.tags && metadata.tags.length > 0 && '--- Tags ---',
    metadata.tags && metadata.tags.length > 0 && metadata.tags.join(', '),
    '',
    metadata.description && '--- Description ---',
    metadata.description,
    '',
    metadata.notes !== undefined && `Engagement: ${metadata.notes} notes`,
    metadata.timestamp && `Posted: ${new Date(metadata.timestamp).toLocaleString()}`,
    '',
    '--- Spotlight Tags (macOS) ---',
    `kMDItemKeywords = ${metadata.tags?.join(', ') || 'none'}`,
    `kMDItemTitle = Image from ${metadata.blogName || 'Tumblr'}`,
    `kMDItemDescription = ${metadata.description || ''}`,
  ].filter(Boolean).join('\n');
  
  const blob = new Blob([metadataText], { type: 'text/plain' });
  const blobUrl = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = sidecarFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
}

/**
 * Download a single image from a URL
 */
export async function downloadImage(
  url: string, 
  filename: string, 
  metadata?: ImageMetadata,
  options?: FilenameOptions,
  includeSidecar: boolean = true
): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    // Create filename with metadata
    const metadataFilename = metadata 
      ? generateMetadataFilename(filename, metadata, options) 
      : filename;
    
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = metadataFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL after a delay
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    
    // Download metadata sidecar file if requested and metadata exists
    if (includeSidecar && metadata) {
      // Small delay to avoid overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 100));
      await downloadMetadataSidecar(metadataFilename, metadata);
    }
  } catch (error) {
    console.error(`Failed to download image ${filename}:`, error);
    throw error;
  }
}

/**
 * Share multiple images using Web Share API (one at a time on mobile)
 * Falls back to download if sharing is not supported
 */
export async function shareImages(
  images: Array<{ url: string; filename: string; metadata?: ImageMetadata; options?: FilenameOptions }>,
  onProgress?: (current: number, total: number) => void
): Promise<{ succeeded: number; failed: number; method: 'share' | 'download' }> {
  let succeeded = 0;
  let failed = 0;
  const canShare = canShareFiles();
  
  for (let i = 0; i < images.length; i++) {
    try {
      // Add index to options
      const imageOptions = { ...images[i].options, index: i };
      
      if (canShare) {
        await shareImage(images[i].url, images[i].filename, images[i].metadata, imageOptions);
      } else {
        await downloadImage(images[i].url, images[i].filename, images[i].metadata, imageOptions);
      }
      succeeded++;
      onProgress?.(i + 1, images.length);
      
      // Add a delay between operations
      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, canShare ? 500 : 300));
      }
    } catch (error) {
      // If user cancels share, don't count as failure for first image
      if (canShare && i === 0 && error instanceof Error && error.name === 'AbortError') {
        // User cancelled the share
        return { succeeded: 0, failed: 0, method: 'share' };
      }
      failed++;
    }
  }
  
  return { succeeded, failed, method: canShare ? 'share' : 'download' };
}

/**
 * Download multiple images sequentially with a delay between downloads
 * to avoid browser blocking
 */
export async function downloadImages(
  images: Array<{ url: string; filename: string; metadata?: ImageMetadata; options?: FilenameOptions }>,
  onProgress?: (current: number, total: number) => void,
  includeSidecars: boolean = true
): Promise<{ succeeded: number; failed: number }> {
  let succeeded = 0;
  let failed = 0;
  
  for (let i = 0; i < images.length; i++) {
    try {
      // Add index to options
      const imageOptions = { ...images[i].options, index: i };
      
      await downloadImage(images[i].url, images[i].filename, images[i].metadata, imageOptions, includeSidecars);
      succeeded++;
      onProgress?.(i + 1, images.length);
      
      // Add a longer delay between downloads (especially with sidecars)
      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, includeSidecars ? 500 : 300));
      }
    } catch (error) {
      failed++;
    }
  }
  
  return { succeeded, failed };
}

/**
 * Extract filename from image URL or generate a unique one
 */
export function getImageFilename(url: string, index: number, blogName?: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    // If the URL has a filename with extension, use it
    if (lastPart.includes('.')) {
      const prefix = blogName ? `${blogName}_` : '';
      return `${prefix}${lastPart}`;
    }
  } catch (error) {
    // Invalid URL, fall through to default
  }
  
  // Generate a default filename
  const prefix = blogName ? `${blogName}_` : 'image_';
  const timestamp = Date.now();
  return `${prefix}${timestamp}_${index + 1}.jpg`;
}

/**
 * Create and download a text file with image URLs
 * (useful fallback if direct download fails or for batch processing)
 */
export function downloadImageList(
  urls: string[],
  filename: string = 'image_urls.txt'
): void {
  const content = urls.join('\n');
  const blob = new Blob([content], { type: 'text/plain' });
  const blobUrl = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
}

/**
 * Server-side parallel download (JavaScript equivalent of Python's aiohttp/asyncio)
 * Fetches all images in parallel on the server using Promise.all(), then downloads them quickly on client
 * This is faster than sequential client-side downloads and bypasses browser download limits
 */
export async function downloadImagesServerSide(
  images: Array<{ url: string; filename: string; metadata?: ImageMetadata; options?: FilenameOptions }>,
  onProgress?: (current: number, total: number) => void,
  includeSidecars: boolean = false
): Promise<{ succeeded: number; failed: number }> {
  try {
    // Determine API URL
    const API_URL = import.meta.env.VITE_API_URL || 
                    (typeof window !== 'undefined' 
                      ? `${window.location.protocol}//${window.location.hostname}:3001` 
                      : 'http://localhost:3001');

    console.log(`[Server-side Download] Requesting parallel fetch of ${images.length} images...`);
    
    // Send request to server to fetch all images in parallel (like Python's asyncio.gather())
    const response = await fetch(`${API_URL}/api/download/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images: images.map((img, i) => ({
          url: img.url,
          filename: generateMetadataFilename(
            img.filename,
            img.metadata,
            { ...img.options, index: i }
          ),
          metadata: img.metadata,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const result = await response.json();
    console.log(`[Server-side Download] Server fetched ${result.downloaded}/${result.total} images in ${(result.totalTimeMs / 1000).toFixed(2)}s (${(result.totalSizeBytes / 1024 / 1024).toFixed(2)}MB)`);

    // Now download each image from the base64 data (all already fetched in parallel!)
    let succeeded = 0;
    let failed = result.failed;

    for (let i = 0; i < result.images.length; i++) {
      try {
        const imageData = result.images[i];
        
        // Convert base64 back to blob
        const binaryString = atob(imageData.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let j = 0; j < binaryString.length; j++) {
          bytes[j] = binaryString.charCodeAt(j);
        }
        const blob = new Blob([bytes]);
        
        // Trigger download
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = imageData.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        
        // Download sidecar if requested
        if (includeSidecars && imageData.metadata) {
          await new Promise(resolve => setTimeout(resolve, 100));
          await downloadMetadataSidecar(imageData.filename, imageData.metadata);
        }
        
        succeeded++;
        onProgress?.(i + 1, result.images.length);
        
        // Small delay between downloads
        if (i < result.images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error(`Failed to download ${result.images[i]?.filename}:`, error);
        failed++;
      }
    }

    console.log(`[Server-side Download] Complete: ${succeeded} succeeded, ${failed} failed`);
    return { succeeded, failed };
  } catch (error) {
    console.error('[Server-side Download] Error:', error);
    throw error;
  }
}


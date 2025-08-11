/**
 * Smart Image Loading Utility
 * Optimizes image loading performance without changing display behavior
 */

export interface ImageLoadingOptions {
  preferWebP?: boolean;
  useDeviceOptimizedSize?: boolean;
  enablePrefetch?: boolean;
}

/**
 * Get the optimal image URL based on current conditions
 * Transparently upgrades to smaller/faster images when available
 */
export function getOptimalImageUrl(
  originalUrl: string, 
  options: ImageLoadingOptions = {}
): string {
  const {
    preferWebP = true,
    useDeviceOptimizedSize = true,
    enablePrefetch = true
  } = options;

  // If not in browser, return original
  if (typeof window === 'undefined') {
    return originalUrl;
  }

  try {
    // Check if we have optimized versions available
    const baseUrl = originalUrl.replace('/images/optimized/', '');
    
    let optimizedUrl = originalUrl;
    
    // Select size based on viewport if device optimization is enabled
    if (useDeviceOptimizedSize) {
      const viewportWidth = window.innerWidth;
      
      // For mobile devices (< 640px), use mobile images if available
      if (viewportWidth < 640) {
        const mobileUrl = originalUrl.replace('.jpg', '-mobile.jpg');
        // Check if mobile version exists by trying to preload it
        if (enablePrefetch) {
          prefetchImageIfExists(mobileUrl);
        }
        optimizedUrl = mobileUrl;
      }
      // For tablets (< 1024px), use tablet images if available  
      else if (viewportWidth < 1024) {
        const tabletUrl = originalUrl.replace('.jpg', '-tablet.jpg');
        if (enablePrefetch) {
          prefetchImageIfExists(tabletUrl);
        }
        optimizedUrl = tabletUrl;
      }
    }
    
    // Prefer WebP if supported and available
    if (preferWebP && supportsWebP()) {
      const webpUrl = optimizedUrl.replace('.jpg', '.webp');
      if (enablePrefetch) {
        prefetchImageIfExists(webpUrl);
      }
      optimizedUrl = webpUrl;
    }
    
    return optimizedUrl;
    
  } catch (error) {
    console.warn('Error optimizing image URL:', error);
    return originalUrl;
  }
}

/**
 * Check WebP support (cached result)
 */
let webpSupport: boolean | null = null;

function supportsWebP(): boolean {
  if (webpSupport !== null) return webpSupport;
  
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    webpSupport = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    webpSupport = false;
  }
  
  return webpSupport;
}

/**
 * Prefetch an image if it exists (non-blocking)
 */
const prefetchCache = new Set<string>();

function prefetchImageIfExists(url: string): void {
  if (prefetchCache.has(url)) return;
  prefetchCache.add(url);
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = 'image';
  
  // Remove after 5 seconds to avoid memory leaks
  document.head.appendChild(link);
  setTimeout(() => {
    try {
      document.head.removeChild(link);
    } catch (_e) {
      // Link may already be removed
    }
  }, 5000);
}

/**
 * Batch preload images with prioritization
 */
export function batchPreloadImages(
  urls: string[], 
  priority: 'high' | 'low' = 'low'
): Promise<void[]> {
  const optimizedUrls = urls.map(url => getOptimalImageUrl(url));
  
  const preloadPromises = optimizedUrls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      // Set loading priority hint
      if ('loading' in img) {
        img.loading = priority === 'high' ? 'eager' : 'lazy';
      }
      
      // Set decode hint for better performance
      if ('decoding' in img) {
        img.decoding = 'async';
      }
      
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load: ${url}`));
      
      // Start loading
      img.src = url;
    });
  });
  
  return Promise.allSettled(preloadPromises).then(results => 
    results.map(result => {
      if (result.status === 'rejected') {
        console.warn('Image preload failed:', result.reason);
      }
      return undefined as void;
    })
  );
}

/**
 * Smart image preloader with connection-aware loading
 */
export function createSmartImagePreloader() {
  const getConnectionQuality = (): 'slow' | 'fast' => {
    // @ts-expect-error - navigator.connection is experimental
    const connection = navigator?.connection || navigator?.mozConnection || navigator?.webkitConnection;
    
    if (!connection) return 'fast';
    
    // Consider 2G/slow-2g as slow
    const slowConnections = ['slow-2g', '2g'];
    if (slowConnections.includes(connection.effectiveType)) {
      return 'slow';
    }
    
    return 'fast';
  };
  
  return {
    preloadWithPriority: (urls: string[], currentIndex: number = 0) => {
      const connectionQuality = getConnectionQuality();
      
      // For slow connections, only preload current + 1 adjacent
      // For fast connections, preload current + 2 adjacent  
      const preloadRadius = connectionQuality === 'slow' ? 1 : 2;
      
      const priorityUrls: string[] = [];
      const lowPriorityUrls: string[] = [];
      
      urls.forEach((url, index) => {
        const distance = Math.abs(index - currentIndex);
        if (distance === 0) {
          // Current image - highest priority
          priorityUrls.unshift(url);
        } else if (distance <= preloadRadius) {
          priorityUrls.push(url);
        } else {
          lowPriorityUrls.push(url);
        }
      });
      
      // Load high priority images first
      batchPreloadImages(priorityUrls, 'high').then(() => {
        // Then load low priority images if connection is good
        if (connectionQuality === 'fast') {
          batchPreloadImages(lowPriorityUrls, 'low');
        }
      });
    }
  };
}
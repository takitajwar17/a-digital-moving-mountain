/**
 * Smart Image Loading Utility
 * Optimizes image loading performance without changing display behavior
 */

import { perfLogger, logOptimization, logResourceHint, logNetworkStatus } from './performanceLogger';

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
    perfLogger.startTimer(`optimize-${originalUrl}`);
    
    // Check if we have optimized versions available
    const baseUrl = originalUrl.replace('/images/optimized/', '');
    
    let optimizedUrl = originalUrl;
    const optimizationDetails: Record<string, unknown> = {
      original: originalUrl,
      viewport: window.innerWidth,
      devicePixelRatio: window.devicePixelRatio || 1,
    };
    
    // Select size based on viewport if device optimization is enabled
    if (useDeviceOptimizedSize) {
      const viewportWidth = window.innerWidth;
      optimizationDetails.viewportWidth = viewportWidth;
      
      // For mobile devices (< 640px), use mobile images if available
      if (viewportWidth < 640) {
        const mobileUrl = originalUrl.replace('.jpg', '-mobile.jpg');
        // Check if mobile version exists by trying to preload it
        if (enablePrefetch) {
          prefetchImageIfExists(mobileUrl);
        }
        optimizedUrl = mobileUrl;
        optimizationDetails.deviceType = 'mobile';
        optimizationDetails.optimizedTo = 'mobile version';
        logOptimization('Selected mobile image variant', { 
          original: originalUrl, 
          optimized: mobileUrl,
          expectedSizeReduction: '~93%'
        });
      }
      // For tablets (< 1024px), use tablet images if available  
      else if (viewportWidth < 1024) {
        const tabletUrl = originalUrl.replace('.jpg', '-tablet.jpg');
        if (enablePrefetch) {
          prefetchImageIfExists(tabletUrl);
        }
        optimizedUrl = tabletUrl;
        optimizationDetails.deviceType = 'tablet';
        optimizationDetails.optimizedTo = 'tablet version';
        logOptimization('Selected tablet image variant', { 
          original: originalUrl, 
          optimized: tabletUrl,
          expectedSizeReduction: '~83%'
        });
      } else {
        optimizationDetails.deviceType = 'desktop';
        logOptimization('Using desktop image variant', { url: originalUrl });
      }
    }
    
    // Skip WebP optimization for now - our WebP files are actually larger than JPGs!
    // This can happen when JPGs are already highly optimized
    // IMPORTANT: WebP versions only exist for the main images, not mobile/tablet variants
    const isBaseImage = !optimizedUrl.includes('-mobile') && !optimizedUrl.includes('-tablet');
    
    // Disabled WebP for now since our WebPs are larger (536KB vs 399KB for JPGs)
    const useWebP = false; // Set to false until we have better WebP compression
    
    if (preferWebP && supportsWebP() && isBaseImage && useWebP) {
      const webpUrl = optimizedUrl.replace('.jpg', '.webp');
      if (enablePrefetch) {
        prefetchImageIfExists(webpUrl);
      }
      const previousUrl = optimizedUrl;
      optimizedUrl = webpUrl;
      optimizationDetails.format = 'webp';
      optimizationDetails.webpSupported = true;
      logOptimization('Upgraded to WebP format', { 
        from: previousUrl, 
        to: webpUrl,
        expectedSizeReduction: '30-50%',
        note: 'WebP only available for desktop images'
      });
    } else {
      optimizationDetails.format = 'jpeg';
      optimizationDetails.webpSupported = supportsWebP();
      if (!isBaseImage && supportsWebP()) {
        optimizationDetails.webpSkipped = 'WebP not available for mobile/tablet variants';
      }
    }
    
    const duration = perfLogger.endTimer(
      `optimize-${originalUrl}`, 
      'OPTIMIZATION', 
      `Image URL optimized`,
      optimizationDetails
    );
    
    optimizationDetails.optimizationTime = `${duration.toFixed(2)}ms`;
    optimizationDetails.finalUrl = optimizedUrl;
    
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
  if (prefetchCache.has(url)) {
    logResourceHint('prefetch (cached)', url);
    return;
  }
  prefetchCache.add(url);
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = 'image';
  
  logResourceHint('prefetch', url);
  
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
    
    if (!connection) {
      logNetworkStatus('unknown (no API)', { apiAvailable: false });
      return 'fast';
    }
    
    // Consider 2G/slow-2g as slow
    const slowConnections = ['slow-2g', '2g'];
    const effectiveType = connection.effectiveType;
    const downlink = connection.downlink;
    const rtt = connection.rtt;
    
    logNetworkStatus(effectiveType || 'unknown', {
      effectiveType,
      downlink: downlink ? `${downlink} Mbps` : 'unknown',
      rtt: rtt ? `${rtt}ms` : 'unknown',
      saveData: connection.saveData || false,
    });
    
    if (slowConnections.includes(effectiveType)) {
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
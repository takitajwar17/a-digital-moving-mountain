/**
 * Resource Hints for Performance Optimization
 * Adds DNS prefetch, preconnect, and prefetch hints to speed up loading
 */

import { logResourceHint, perfLogger } from './performanceLogger';

/**
 * Add DNS prefetch hints for faster domain resolution
 */
export function addDnsPrefetch(domains: string[]) {
  if (typeof document === 'undefined') return;
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
    logResourceHint('dns-prefetch', domain);
  });
  
  perfLogger.log('info', 'RESOURCE_HINT', `Added ${domains.length} DNS prefetch hints`, { domains });
}

/**
 * Add preconnect hints for critical origins
 */
export function addPreconnect(origins: string[]) {
  if (typeof document === 'undefined') return;
  
  origins.forEach(origin => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    logResourceHint('preconnect', origin);
  });
  
  perfLogger.log('info', 'RESOURCE_HINT', `Added ${origins.length} preconnect hints`, { origins });
}

/**
 * Add prefetch hints for next likely resources
 */
export function addResourcePrefetch(urls: string[], type: 'image' | 'script' | 'style' = 'image') {
  if (typeof document === 'undefined') return;
  
  let addedCount = 0;
  urls.forEach(url => {
    // Don't add if already exists
    if (document.querySelector(`link[href="${url}"]`)) {
      logResourceHint('prefetch (exists)', url);
      return;
    }
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = type;
    
    // Add crossorigin for images to enable CORS
    if (type === 'image') {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
    logResourceHint('prefetch', url);
    addedCount++;
  });
  
  if (addedCount > 0) {
    perfLogger.log('info', 'RESOURCE_HINT', `Added ${addedCount} prefetch hints`, { 
      type, 
      total: urls.length,
      added: addedCount,
      skipped: urls.length - addedCount 
    });
  }
}

/**
 * Add preload hints for critical resources that will be needed soon
 */
export function addResourcePreload(urls: string[], type: 'image' | 'script' | 'style' = 'image') {
  if (typeof document === 'undefined') return;
  
  urls.forEach(url => {
    // Don't add if already exists
    if (document.querySelector(`link[href="${url}"]`)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    
    // Add crossorigin for images
    if (type === 'image') {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  });
}

/**
 * Initialize performance hints for the application
 */
export function initializePerformanceHints() {
  if (typeof document === 'undefined') return;
  
  // Add DNS prefetch for common domains
  addDnsPrefetch([
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ]);
  
  // Add preconnect for critical origins
  addPreconnect([
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ]);
}

/**
 * Smart prefetch based on user behavior patterns
 */
export function smartPrefetch(currentIndex: number, totalItems: number, getUrlAtIndex: (index: number) => string) {
  const urlsToPrefetch: string[] = [];
  
  // Prefetch next item (most likely to be accessed)
  if (currentIndex + 1 < totalItems) {
    urlsToPrefetch.push(getUrlAtIndex(currentIndex + 1));
  }
  
  // Prefetch previous item (second most likely)
  if (currentIndex - 1 >= 0) {
    urlsToPrefetch.push(getUrlAtIndex(currentIndex - 1));
  }
  
  // On fast connections, prefetch more items
  const isSlowConnection = () => {
    if (typeof navigator === 'undefined') return false;
    // @ts-expect-error - experimental API
    const connection = navigator?.connection || navigator?.mozConnection || navigator?.webkitConnection;
    return connection && ['slow-2g', '2g'].includes(connection.effectiveType);
  };
  
  if (!isSlowConnection()) {
    // Prefetch items 2 positions away
    if (currentIndex + 2 < totalItems) {
      urlsToPrefetch.push(getUrlAtIndex(currentIndex + 2));
    }
    if (currentIndex - 2 >= 0) {
      urlsToPrefetch.push(getUrlAtIndex(currentIndex - 2));
    }
  }
  
  // Add prefetch hints
  addResourcePrefetch(urlsToPrefetch, 'image');
  
  return urlsToPrefetch;
}
export interface OfflineComment {
  id: string;
  text: string;
  position: { x: number; y: number };
  year: number;
  timestamp: number;
  synced: boolean;
}

export interface OfflineData {
  comments: OfflineComment[];
  lastSync: number;
}

const OFFLINE_STORAGE_KEY = 'footprints_offline_data';

/**
 * Check if the app is currently offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Get offline data from localStorage
 */
export function getOfflineData(): OfflineData {
  try {
    const data = localStorage.getItem(OFFLINE_STORAGE_KEY);
    return data ? JSON.parse(data) : { comments: [], lastSync: 0 };
  } catch (error) {
    console.error('Failed to get offline data:', error);
    return { comments: [], lastSync: 0 };
  }
}

/**
 * Save offline data to localStorage
 */
export function saveOfflineData(data: OfflineData): void {
  try {
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save offline data:', error);
  }
}

/**
 * Add a comment to offline storage
 */
export function addOfflineComment(comment: Omit<OfflineComment, 'id' | 'synced'>): void {
  const data = getOfflineData();
  const offlineComment: OfflineComment = {
    ...comment,
    id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    synced: false
  };
  
  data.comments.push(offlineComment);
  saveOfflineData(data);
  
  // Register for background sync if available
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then(registration => {
      // Use type assertion for experimental sync API
      const syncRegistration = registration as ServiceWorkerRegistration & {
        sync?: { register: (tag: string) => Promise<void> };
      };
      if (syncRegistration.sync) {
        return syncRegistration.sync.register('background-sync-comments');
      }
    }).catch(error => {
      console.error('Failed to register background sync:', error);
    });
  }
}

/**
 * Get unsynced offline comments
 */
export function getUnsyncedComments(): OfflineComment[] {
  const data = getOfflineData();
  return data.comments.filter(comment => !comment.synced);
}

/**
 * Mark comments as synced
 */
export function markCommentsAsSynced(commentIds: string[]): void {
  const data = getOfflineData();
  data.comments = data.comments.map(comment => 
    commentIds.includes(comment.id) 
      ? { ...comment, synced: true }
      : comment
  );
  data.lastSync = Date.now();
  saveOfflineData(data);
}

/**
 * Clear old synced comments
 */
export function clearSyncedComments(): void {
  const data = getOfflineData();
  data.comments = data.comments.filter(comment => !comment.synced);
  saveOfflineData(data);
}

/**
 * Setup offline event listeners
 */
export function setupOfflineListeners(): void {
  window.addEventListener('online', () => {
    console.log('App is back online');
    syncOfflineComments();
  });

  window.addEventListener('offline', () => {
    console.log('App is offline');
    showOfflineNotification();
  });
}

/**
 * Sync offline comments when back online
 */
export async function syncOfflineComments(): Promise<void> {
  if (isOffline()) {
    return;
  }

  const unsyncedComments = getUnsyncedComments();
  
  if (unsyncedComments.length === 0) {
    return;
  }

  try {
    const syncPromises = unsyncedComments.map(async (comment) => {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: comment.text,
          position: comment.position,
          year: comment.year,
          timestamp: comment.timestamp
        })
      });

      if (response.ok) {
        return comment.id;
      } else {
        throw new Error(`Failed to sync comment ${comment.id}`);
      }
    });

    const syncedIds = await Promise.all(syncPromises);
    markCommentsAsSynced(syncedIds);
    
    console.log(`Synced ${syncedIds.length} offline comments`);
    showSyncNotification(syncedIds.length);
  } catch (error) {
    console.error('Failed to sync offline comments:', error);
  }
}

/**
 * Show offline notification
 */
export function showOfflineNotification(): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Footprints Across the Ocean', {
      body: 'You are now offline. Your comments will be saved and synced when you reconnect.',
      icon: '/icon-192x192.png'
    });
  }
}

/**
 * Show sync notification
 */
export function showSyncNotification(count: number): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Footprints Across the Ocean', {
      body: `${count} comment${count > 1 ? 's' : ''} synced successfully.`,
      icon: '/icon-192x192.png'
    });
  }
}

/**
 * Request notification permission
 */
export function requestNotificationPermission(): void {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

/**
 * Check if app can be installed (PWA)
 */
export function canInstallApp(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Install the app (PWA)
 */
export function installApp(): void {
  // This would typically be handled by the beforeinstallprompt event
  // For now, we'll just show instructions
  alert('To install this app:\n\n1. Open browser menu\n2. Select "Install App" or "Add to Home Screen"\n3. Follow the prompts');
}

/**
 * Cache artwork images for offline use
 */
export async function cacheArtworkImages(imageUrls: string[]): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      for (const url of imageUrls) {
        registration.active?.postMessage({
          type: 'CACHE_ARTWORK',
          url: url
        });
      }
    } catch (error) {
      console.error('Failed to cache artwork images:', error);
    }
  }
}

/**
 * Get network status
 */
export function getNetworkStatus(): {
  online: boolean;
  connectionType?: string;
  effectiveType?: string;
} {
  const connection = (navigator as Navigator & {
    connection?: { type?: string; effectiveType?: string };
    mozConnection?: { type?: string; effectiveType?: string };
    webkitConnection?: { type?: string; effectiveType?: string };
  }).connection || (navigator as Navigator & {
    connection?: { type?: string; effectiveType?: string };
    mozConnection?: { type?: string; effectiveType?: string };
    webkitConnection?: { type?: string; effectiveType?: string };
  }).mozConnection || (navigator as Navigator & {
    connection?: { type?: string; effectiveType?: string };
    mozConnection?: { type?: string; effectiveType?: string };
    webkitConnection?: { type?: string; effectiveType?: string };
  }).webkitConnection;
  
  return {
    online: navigator.onLine,
    connectionType: connection?.type,
    effectiveType: connection?.effectiveType
  };
}

/**
 * Monitor network changes
 */
export function monitorNetworkChanges(callback: (status: ReturnType<typeof getNetworkStatus>) => void): void {
  const updateStatus = () => callback(getNetworkStatus());
  
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  
  // Listen for connection changes if supported
  const connection = (navigator as Navigator & {
    connection?: { addEventListener?: (event: string, handler: () => void) => void };
    mozConnection?: { addEventListener?: (event: string, handler: () => void) => void };
    webkitConnection?: { addEventListener?: (event: string, handler: () => void) => void };
  }).connection || (navigator as Navigator & {
    connection?: { addEventListener?: (event: string, handler: () => void) => void };
    mozConnection?: { addEventListener?: (event: string, handler: () => void) => void };
    webkitConnection?: { addEventListener?: (event: string, handler: () => void) => void };
  }).mozConnection || (navigator as Navigator & {
    connection?: { addEventListener?: (event: string, handler: () => void) => void };
    mozConnection?: { addEventListener?: (event: string, handler: () => void) => void };
    webkitConnection?: { addEventListener?: (event: string, handler: () => void) => void };
  }).webkitConnection;
  
  if (connection && connection.addEventListener) {
    connection.addEventListener('change', updateStatus);
  }
}

/**
 * Prefetch critical resources
 */
export async function prefetchCriticalResources(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const criticalResources = [
        '/',
        '/admin',
        '/images/optimized/A Moving Mountain %231.jpg',
        '/images/optimized/A Moving Mountain %232.jpg',
        '/images/optimized/A Moving Mountain %233.jpg',
        '/images/optimized/A Moving Mountain %234.jpg',
        '/images/optimized/A Moving Mountain %235.jpg',
        '/images/optimized/A Moving Mountain %236.jpg',
        '/images/optimized/A Moving Mountain %237.jpg',
        '/images/optimized/A Moving Mountain %238.jpg',
        '/images/optimized/A Moving Mountain %239.jpg',
        '/images/optimized/A Moving Mountain %2310.jpg'
      ];
      
      for (const resource of criticalResources) {
        registration.active?.postMessage({
          type: 'CACHE_ARTWORK',
          url: resource
        });
      }
    } catch (error) {
      console.error('Failed to prefetch critical resources:', error);
    }
  }
}
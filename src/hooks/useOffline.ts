'use client';

import { useState, useEffect } from 'react';

// Define the BeforeInstallPromptEvent interface for PWA installation
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Extend the Window interface to include PWA-specific events
declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
    'appinstalled': Event;
  }
}
import { 
  isOffline, 
  getOfflineData, 
  addOfflineComment, 
  syncOfflineComments,
  setupOfflineListeners,
  requestNotificationPermission,
  getNetworkStatus,
  monitorNetworkChanges,
  prefetchCriticalResources
} from '@/utils/offline';

export interface UseOfflineReturn {
  isOffline: boolean;
  offlineComments: { id: string; text: string; position: { x: number; y: number }; year: number; timestamp: number; synced: boolean }[];
  networkStatus: ReturnType<typeof getNetworkStatus>;
  addCommentOffline: (comment: { text: string; position: { x: number; y: number }; year: number }) => void;
  syncComments: () => Promise<void>;
  installApp: () => void;
  canInstall: boolean;
}

export function useOffline(): UseOfflineReturn {
  const [offline, setOffline] = useState(false);
  const [offlineComments, setOfflineComments] = useState<{ id: string; text: string; position: { x: number; y: number }; year: number; timestamp: number; synced: boolean }[]>([]);
  const [networkStatus, setNetworkStatus] = useState(getNetworkStatus());
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Initial setup
    setOffline(isOffline());
    setOfflineComments(getOfflineData().comments);
    
    // Setup offline listeners
    setupOfflineListeners();
    
    // Request notification permission
    requestNotificationPermission();
    
    // Monitor network changes
    monitorNetworkChanges((status) => {
      setNetworkStatus(status);
      setOffline(!status.online);
    });
    
    // Prefetch critical resources
    prefetchCriticalResources();
    
    // Check if app can be installed
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setCanInstall(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check for app installation
    window.addEventListener('appinstalled', () => {
      setCanInstall(false);
      console.log('App installed successfully');
    });
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Sync comments when coming back online
  useEffect(() => {
    if (!offline) {
      syncComments();
    }
  }, [offline]);

  const addCommentOffline = (comment: { text: string; position: { x: number; y: number }; year: number }) => {
    addOfflineComment({
      text: comment.text,
      position: comment.position,
      year: comment.year,
      timestamp: Date.now()
    });
    
    // Update local state
    setOfflineComments(getOfflineData().comments);
  };

  const syncComments = async () => {
    try {
      await syncOfflineComments();
      setOfflineComments(getOfflineData().comments);
    } catch (error) {
      console.error('Failed to sync comments:', error);
    }
  };

  const installApp = () => {
    // This would typically trigger the stored beforeinstallprompt event
    // For now, we'll show installation instructions
    if (canInstall) {
      // In a real implementation, you'd store the event and call prompt()
      console.log('Install app triggered');
    } else {
      alert('To install this app:\n\n1. Open browser menu\n2. Select "Install App" or "Add to Home Screen"\n3. Follow the prompts');
    }
  };

  return {
    isOffline: offline,
    offlineComments,
    networkStatus,
    addCommentOffline,
    syncComments,
    installApp,
    canInstall
  };
}
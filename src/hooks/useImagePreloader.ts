'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface PreloadedImage {
  src: string;
  loaded: boolean;
  error: boolean;
}

export interface UseImagePreloaderReturn {
  preloadedImages: Map<string, PreloadedImage>;
  isLoading: boolean;
  totalImages: number;
  loadedCount: number;
  errorCount: number;
  preloadImage: (src: string) => Promise<void>;
  clearCache: () => void;
}

/**
 * Custom hook for efficiently preloading images
 * Provides progress tracking and caching for better user experience
 */
export function useImagePreloader(
  initialImages: string[] = [],
  options: {
    preloadOnMount?: boolean;
    maxConcurrent?: number;
    timeout?: number;
  } = {}
): UseImagePreloaderReturn {
  const {
    preloadOnMount = true,
    maxConcurrent = 3,
    timeout = 10000
  } = options;

  const [preloadedImages, setPreloadedImages] = useState<Map<string, PreloadedImage>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  
  // Use ref to avoid dependency issues
  const preloadedImagesRef = useRef<Map<string, PreloadedImage>>(new Map());
  const hasStartedPreloading = useRef(false);
  
  // Update ref when state changes
  useEffect(() => {
    preloadedImagesRef.current = preloadedImages;
  }, [preloadedImages]);

  // Initialize image map - only run once on mount
  useEffect(() => {
    if (initialImages.length > 0) {
      const newMap = new Map(
        initialImages.map(src => [src, { src, loaded: false, error: false }])
      );
      setPreloadedImages(newMap);
      preloadedImagesRef.current = newMap;
    }
  }, [initialImages.length]); // Only depend on length to prevent restarts

  // Calculate statistics
  const totalImages = preloadedImages.size;
  const loadedCount = Array.from(preloadedImages.values()).filter(img => img.loaded).length;
  const errorCount = Array.from(preloadedImages.values()).filter(img => img.error).length;

  // Update image status - removed circular dependency
  const updateImageStatus = useCallback((src: string, loaded: boolean, error: boolean) => {
    setPreloadedImages(prev => {
      const newMap = new Map(prev);
      newMap.set(src, { src, loaded, error });
      return newMap;
    });
  }, []); // No dependencies to avoid circular updates

  // Preload a single image
  const preloadImage = useCallback(async (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded using ref
      const existing = preloadedImagesRef.current.get(src);
      if (existing?.loaded) {
        resolve();
        return;
      }

      // Create image element
      const img = new Image();
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        console.warn(`⏰ Image preload timeout: ${src}`);
        updateImageStatus(src, false, true);
        reject(new Error(`Timeout loading image: ${src}`));
      }, timeout);

      // Handle successful load
      img.onload = () => {
        clearTimeout(timeoutId);
        console.log(`✅ Image preloaded: ${src}`);
        updateImageStatus(src, true, false);
        resolve();
      };

      // Handle error
      img.onerror = () => {
        clearTimeout(timeoutId);
        console.error(`❌ Failed to preload image: ${src}`);
        updateImageStatus(src, false, true);
        reject(new Error(`Failed to load image: ${src}`));
      };

      // Start loading
      img.src = src;
    });
  }, [timeout, updateImageStatus]);

  // Preload images in batches
  const preloadImages = useCallback(async (imageSrcs: string[]) => {
    if (imageSrcs.length === 0) return;

    setIsLoading(true);
    console.log(`🖼️ Starting preload of ${imageSrcs.length} images...`);

    // Process images in batches to avoid overwhelming the browser
    const batches = [];
    for (let i = 0; i < imageSrcs.length; i += maxConcurrent) {
      batches.push(imageSrcs.slice(i, i + maxConcurrent));
    }

    let totalProcessed = 0;
    let totalSuccessful = 0;

    for (const batch of batches) {
      const batchPromises = batch.map(async (src) => {
        try {
          await preloadImage(src);
          totalSuccessful++;
        } catch (error) {
          console.warn(`Failed to preload ${src}:`, error);
        }
        totalProcessed++;
      });

      await Promise.all(batchPromises);
      console.log(`📈 Preload progress: ${totalProcessed}/${imageSrcs.length} (${totalSuccessful} successful)`);
    }

    console.log(`🎉 Preload completed: ${totalSuccessful}/${imageSrcs.length} images loaded successfully`);
    setIsLoading(false);
  }, [preloadImage, maxConcurrent]);

  // Auto-preload on mount - only run once when images are available
  useEffect(() => {
    if (preloadOnMount && initialImages.length > 0 && !hasStartedPreloading.current) {
      hasStartedPreloading.current = true;
      preloadImages(initialImages);
    }
  }, [preloadOnMount, initialImages, preloadImages]); // Safe now with the ref guard

  // Clear cache
  const clearCache = useCallback(() => {
    setPreloadedImages(new Map());
    preloadedImagesRef.current = new Map();
    hasStartedPreloading.current = false;
    setIsLoading(false);
  }, []);

  return {
    preloadedImages,
    isLoading,
    totalImages,
    loadedCount,
    errorCount,
    preloadImage,
    clearCache
  };
}

/**
 * Helper function to check if an image is preloaded
 */
export function useImagePreloadStatus(src: string, preloadedImages: Map<string, PreloadedImage>): {
  isPreloaded: boolean;
  hasError: boolean;
  isLoading: boolean;
} {
  const image = preloadedImages.get(src);
  
  return {
    isPreloaded: image?.loaded ?? false,
    hasError: image?.error ?? false,
    isLoading: image ? !image.loaded && !image.error : false
  };
}

/**
 * Hook to get overall preload statistics
 */
export function usePreloadStats(preloadedImages: Map<string, PreloadedImage>) {
  const total = preloadedImages.size;
  const loaded = Array.from(preloadedImages.values()).filter(img => img.loaded).length;
  const errors = Array.from(preloadedImages.values()).filter(img => img.error).length;
  const loading = total - loaded - errors;
  
  return {
    total,
    loaded,
    errors,
    loading,
    progress: total > 0 ? (loaded / total) * 100 : 0,
    isComplete: total > 0 && loaded + errors === total
  };
} 
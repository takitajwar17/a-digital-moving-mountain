'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useComments } from '@/hooks/useComments';
import { useCanvas } from '@/hooks/useCanvas';
import { useImagePreloader, usePreloadStats } from '@/hooks/useImagePreloader';
import { Comment, CommentFilter } from '@/types/comment';
import { getDeviceType, isKioskMode } from '@/utils/deviceDetection';
import { findAvailablePosition } from '@/utils/coordinateSystem';

// Canvas components
import ArtworkPanel from '@/components/Canvas/ArtworkPanel';
import ZoomControls from '@/components/Canvas/ZoomControls';

// Sample data
import { 
  sampleArtworkPanels, 
  getAvailableYears
} from '@/data/sampleArtwork';

export default function Home() {
  const [filter] = useState<CommentFilter>({ approved: true });
  const [currentYear, setCurrentYear] = useState(2008); // Start with 2008 (financial crisis)
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);
  
  // Handle QR code parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const yearParam = urlParams.get('year');
      const modeParam = urlParams.get('mode');
      
      if (yearParam) {
        const year = parseInt(yearParam);
        const availableYears = getAvailableYears();
        if (availableYears.includes(year)) {
          setCurrentYear(year);
        }
      }
      
      // Handle different modes (gallery, mobile, kiosk)
      if (modeParam === 'kiosk') {
        setKiosk(true);
      }
    }
  }, []);
  
  // Update filter when year changes
  const yearFilter = { ...filter, year: currentYear };
  const { comments, addNewComment } = useComments(yearFilter);
  const { settings, updateZoom, updatePan } = useCanvas();
  
  // Device and layout detection
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [, setKiosk] = useState(false);
  
  // Current artwork panel
  const currentPanel = sampleArtworkPanels.find(panel => panel.year === currentYear) || sampleArtworkPanels[0];
  
  // Comments for current panel (now only from Firebase)
  const panelComments = comments;
  
  // Available data for filters
  const availableYears = getAvailableYears();

  // Lazy loading - only preload current and adjacent images
  const imagesToPreload = useMemo(() => {
    const currentIndex = availableYears.indexOf(currentYear);
    const indices = [];
    // Current image
    indices.push(currentIndex);
    // Previous image
    if (currentIndex > 0) indices.push(currentIndex - 1);
    // Next image
    if (currentIndex < availableYears.length - 1) indices.push(currentIndex + 1);
    
    return indices.map(i => sampleArtworkPanels[i]?.imageUrl).filter(Boolean);
  }, [availableYears, currentYear]);

  const { 
    preloadedImages, 
    isLoading: imagesLoading 
  } = useImagePreloader(imagesToPreload, {
    preloadOnMount: true,
    maxConcurrent: 3,
    timeout: 10000
  });

  const preloadStats = usePreloadStats(preloadedImages);

  // Get previous and next panels
  const currentIndex = availableYears.indexOf(currentYear);
  const prevYear = currentIndex > 0 ? availableYears[currentIndex - 1] : null;
  const nextYear = currentIndex < availableYears.length - 1 ? availableYears[currentIndex + 1] : null;
  const prevPanel = prevYear ? sampleArtworkPanels.find(p => p.year === prevYear) : null;
  const nextPanel = nextYear ? sampleArtworkPanels.find(p => p.year === nextYear) : null;

  // Handle year navigation with animation
  const handleYearChange = (year: number) => {
    if (isAnimating || year === currentYear) return;
    
    const currentIdx = availableYears.indexOf(currentYear);
    const newIdx = availableYears.indexOf(year);
    
    setAnimationDirection(newIdx > currentIdx ? 'left' : 'right');
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentYear(year);
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationDirection(null);
      }, 50);
    }, 300);
  };

  // Navigation handlers
  const goToPrevious = () => {
    if (prevYear) handleYearChange(prevYear);
  };
  
  const goToNext = () => {
    if (nextYear) handleYearChange(nextYear);
  };

  // Initialize device detection
  useEffect(() => {
    setDeviceType(getDeviceType());
    setKiosk(isKioskMode());
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent navigation when typing in input fields
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          goToNext();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault();
          // Go to first year
          if (availableYears.length > 0) {
            handleYearChange(availableYears[0]);
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault();
          // Go to last year
          if (availableYears.length > 0) {
            handleYearChange(availableYears[availableYears.length - 1]);
          }
          break;
        case 'Home':
          event.preventDefault();
          // Go to first year
          if (availableYears.length > 0) {
            handleYearChange(availableYears[0]);
          }
          break;
        case 'End':
          event.preventDefault();
          // Go to last year
          if (availableYears.length > 0) {
            handleYearChange(availableYears[availableYears.length - 1]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentYear, availableYears, prevYear, nextYear, isAnimating]);

  // Handle comment addition
  const handleCommentAdd = async (position: { x: number; y: number }, text?: string, imageData?: string, color?: string) => {
    try {
      // Find suitable position to avoid collisions
      const availablePosition = findAvailablePosition(
        position,
        panelComments.map(c => c.position),
        0.05 // 5% minimum distance
      );

      await addNewComment({
        text,
        imageData,
        type: imageData ? 'drawing' : 'text',
        position: availablePosition,
        year: currentYear,
        device: deviceType,
        inputMethod: imageData ? 'stylus' : (deviceType === 'mobile' ? 'touch' : 'keyboard'),
        color: color || '#000000' // Default to black if no color provided
      });
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  // Handle comment click
  const handleCommentClick = (comment: Comment) => {
    console.log('Comment clicked:', comment);
    // TODO: Show comment details modal
  };

  // Show loading screen only if current image is loading and no images are loaded yet
  const currentImageUrl = currentPanel.imageUrl;
  const currentImageStatus = preloadedImages.get(currentImageUrl);
  const isInitialLoading = !currentImageStatus?.loaded && !currentImageStatus?.error && imagesLoading && preloadStats.loaded === 0;

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // Responsive layout
  return (
    <div className="h-screen overflow-hidden bg-black">
      {/* Logo - Fixed position for all layouts */}
      <a 
        href="https://adigitalmovingmountain.com/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed top-1 left-6 z-50 w-16 h-16 transition-all duration-200 hover:scale-105"
      >
        <Image
          src="/logo.svg"
          alt="A Digital Moving Mountain"
          width={64}
          height={64}
          className="w-full h-full object-contain"
        />
      </a>


      {/* Mobile Layout */}
      <div className="md:hidden h-full relative">
        {/* Zoom controls at top middle */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
          <ZoomControls
            zoomLevel={settings.zoomLevel}
            onZoomChange={updateZoom}
            onReset={() => { updateZoom(1); updatePan({ x: 0, y: 0 }); }}
          />
        </div>

        {/* Main content area with image */}
        <div className="h-full w-full flex items-center justify-center relative">
          {/* Image container with animation - full width */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className={`relative transition-transform duration-300 ease-in-out w-full h-full flex items-center justify-center ${
                isAnimating && animationDirection === 'left' ? '-translate-x-full' :
                isAnimating && animationDirection === 'right' ? 'translate-x-full' :
                'translate-x-0'
              }`}
            >
              <ArtworkPanel
                panel={currentPanel}
                comments={panelComments}
                onCommentAdd={handleCommentAdd}
                onCommentClick={handleCommentClick}
                zoomLevel={settings.zoomLevel}
                onZoomChange={updateZoom}
                panPosition={settings.panPosition}
                onPanChange={updatePan}
                onSwipeLeft={goToNext}
                onSwipeRight={goToPrevious}
                className="w-full h-full mobile-view"
              />
            </div>
          </div>

          {/* Left navigation arrow - over the image */}
          <button
            onClick={goToPrevious}
            disabled={!prevPanel || isAnimating}
            className={`absolute left-2 z-30 w-12 h-12 flex items-center justify-center rounded-full transition-all ${
              prevPanel && !isAnimating
                ? 'bg-black/70 text-white hover:bg-black/90' 
                : 'bg-black/30 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Right navigation arrow - over the image */}
          <button
            onClick={goToNext}
            disabled={!nextPanel || isAnimating}
            className={`absolute right-2 z-30 w-12 h-12 flex items-center justify-center rounded-full transition-all ${
              nextPanel && !isAnimating
                ? 'bg-black/70 text-white hover:bg-black/90' 
                : 'bg-black/30 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Year display at bottom center */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-black/70 text-white px-6 py-2 rounded-full">
            <p className="text-lg font-semibold">{currentPanel.year}</p>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex h-full relative">
        {/* Year display at bottom center for desktop */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-black/70 text-white px-6 py-2 rounded-full">
            <p className="text-lg font-semibold">{currentPanel.year}</p>
          </div>
        </div>

        {/* Left side - Previous image */}
        <div className="flex-1 flex items-center justify-center relative">
          {prevPanel && (
            <div className={`relative transition-all duration-300 ${!isAnimating ? 'cursor-pointer hover:opacity-60' : 'cursor-not-allowed'}`} onClick={!isAnimating ? goToPrevious : undefined}>
              <Image
                src={prevPanel.imageUrl}
                alt={`Artwork ${prevPanel.year}`}
                width={800}
                height={600}
                className="max-h-[80vh] max-w-full object-contain opacity-30 hover:opacity-50 transition-opacity"
                priority={false}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded">
                   {prevPanel.year}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center - Main image */}
        <div className="flex-shrink-0 flex items-center justify-center relative overflow-hidden">
          <div 
            className={`transition-transform duration-300 ease-in-out ${
              isAnimating && animationDirection === 'left' ? '-translate-x-full' :
              isAnimating && animationDirection === 'right' ? 'translate-x-full' :
              'translate-x-0'
            }`}
          >
            <ArtworkPanel
              panel={currentPanel}
              comments={panelComments}
              onCommentAdd={handleCommentAdd}
              onCommentClick={handleCommentClick}
              zoomLevel={settings.zoomLevel}
              onZoomChange={updateZoom}
              panPosition={settings.panPosition}
              onPanChange={updatePan}
              className="h-full"
            />
          </div>
          
          {/* Zoom controls at bottom for desktop */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40">
            <ZoomControls
              zoomLevel={settings.zoomLevel}
              onZoomChange={updateZoom}
              onReset={() => { updateZoom(1); updatePan({ x: 0, y: 0 }); }}
            />
          </div>
        </div>

        {/* Right side - Next image */}
        <div className="flex-1 flex items-center justify-center relative">
          {nextPanel && (
            <div className={`relative transition-all duration-300 ${!isAnimating ? 'cursor-pointer hover:opacity-60' : 'cursor-not-allowed'}`} onClick={!isAnimating ? goToNext : undefined}>
              <Image
                src={nextPanel.imageUrl}
                alt={`Artwork ${nextPanel.year}`}
                width={800}
                height={600}
                className="max-h-[80vh] max-w-full object-contain opacity-30 hover:opacity-50 transition-opacity"
                priority={false}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded">
                  {nextPanel.year} 
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
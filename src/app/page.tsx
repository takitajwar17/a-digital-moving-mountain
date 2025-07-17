'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/hooks/useFirebase';
import { useComments } from '@/hooks/useComments';
import { useCanvas } from '@/hooks/useCanvas';
import { CommentFilter } from '@/types/comment';
import { getDeviceType, isKioskMode } from '@/utils/deviceDetection';
import { detectLanguage } from '@/utils/languageDetection';
import { findAvailablePosition } from '@/utils/coordinateSystem';

// Layout components
import MobileLayout from '@/components/Layout/MobileLayout';
import TabletLayout from '@/components/Layout/TabletLayout';
import DesktopLayout from '@/components/Layout/DesktopLayout';

// Canvas components
import ArtworkPanel from '@/components/Canvas/ArtworkPanel';

// Sample data
import { 
  sampleArtworkPanels, 
  sampleComments, 
  getAvailableYears, 
  getAvailableLanguages
} from '@/data/sampleArtwork';

export default function Home() {
  const { user, loading: authLoading } = useFirebase();
  const [filter, setFilter] = useState<CommentFilter>({ approved: true });
  const { comments, loading: commentsLoading, addNewComment } = useComments(filter);
  const { settings, updateZoom, updatePan, resetView } = useCanvas();
  
  // Device and layout detection
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [kiosk, setKiosk] = useState(false);
  
  // Current artwork panel
  const [currentYear, setCurrentYear] = useState(2008); // Start with 2008 (financial crisis)
  const currentPanel = sampleArtworkPanels.find(panel => panel.year === currentYear) || sampleArtworkPanels[0];
  
  // Comments for current panel
  const panelComments = [...sampleComments.filter(comment => comment.year === currentYear), ...comments];
  
  // Available data for filters
  const availableYears = getAvailableYears();
  const availableLanguages = getAvailableLanguages();

  // Initialize device detection
  useEffect(() => {
    setDeviceType(getDeviceType());
    setKiosk(isKioskMode());
  }, []);

  // Handle comment addition
  const handleCommentAdd = async (position: { x: number; y: number }, text: string) => {
    if (!user) return;

    try {
      // Find suitable position to avoid collisions
      const availablePosition = findAvailablePosition(
        position,
        panelComments.map(c => c.position),
        0.05 // 5% minimum distance
      );

      // Detect language
      const language = detectLanguage(text).language;

      await addNewComment({
        text,
        position: availablePosition,
        year: currentYear,
        device: deviceType,
        inputMethod: deviceType === 'mobile' ? 'touch' : 'keyboard'
      });
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  // Handle comment click
  const handleCommentClick = (comment: { id: string; text: string; position: { x: number; y: number }; year: number; timestamp: number }) => {
    console.log('Comment clicked:', comment);
    // TODO: Show comment details modal
  };

  // Handle filter changes
  const handleFilterChange = (newFilter: CommentFilter) => {
    setFilter(newFilter);
    if (newFilter.year && newFilter.year !== currentYear) {
      setCurrentYear(newFilter.year);
    }
  };

  // Handle year navigation
  const handleYearChange = (year: number) => {
    setCurrentYear(year);
    setFilter({ ...filter, year });
  };

  // Loading state
  if (authLoading || commentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Footprints Across the Ocean&hellip;</p>
        </div>
      </div>
    );
  }

  // Main artwork panel component
  const artworkPanelComponent = (
    <ArtworkPanel
      panel={currentPanel}
      comments={panelComments}
      onCommentAdd={handleCommentAdd}
      onCommentClick={handleCommentClick}
      zoomLevel={settings.zoomLevel}
      onZoomChange={updateZoom}
      panPosition={settings.panPosition}
      onPanChange={updatePan}
      className="w-full h-full"
    />
  );

  // Year navigation
  const yearNavigation = (
    <div className="flex items-center gap-2 p-4 bg-white border-b border-gray-200 overflow-x-auto">
      {availableYears.map(year => (
        <button
          key={year}
          onClick={() => handleYearChange(year)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            year === currentYear
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  );

  // Render appropriate layout based on device type
  if (deviceType === 'mobile') {
    return (
      <MobileLayout
        filter={filter}
        onFilterChange={handleFilterChange}
        availableYears={availableYears}
        availableLanguages={availableLanguages}
      >
        {yearNavigation}
        {artworkPanelComponent}
      </MobileLayout>
    );
  }

  if (deviceType === 'tablet') {
    return (
      <TabletLayout
        filter={filter}
        onFilterChange={handleFilterChange}
        availableYears={availableYears}
        availableLanguages={availableLanguages}
        isKioskMode={kiosk}
      >
        {yearNavigation}
        {artworkPanelComponent}
      </TabletLayout>
    );
  }

  // Desktop layout
  return (
    <DesktopLayout
      filter={filter}
      onFilterChange={handleFilterChange}
      availableYears={availableYears}
      availableLanguages={availableLanguages}
      totalComments={panelComments.length}
    >
      {yearNavigation}
      {artworkPanelComponent}
    </DesktopLayout>
  );
}
'use client';

import { useState, useCallback, useEffect } from 'react';
import { CanvasSettings } from '@/types/artwork';

export interface UseCanvasReturn {
  settings: CanvasSettings;
  updateZoom: (zoom: number) => void;
  updatePan: (position: { x: number; y: number }) => void;
  updateSelectedYear: (year: number | undefined) => void;
  updateFilter: (filter: CanvasSettings['filterSettings']) => void;
  resetView: () => void;
}

const defaultSettings: CanvasSettings = {
  zoomLevel: 1,
  panPosition: { x: 0, y: 0 },
  selectedYear: undefined,
  filterSettings: {
    showApprovedOnly: true
  }
};

export function useCanvas(initialSettings?: Partial<CanvasSettings>): UseCanvasReturn {
  const [settings, setSettings] = useState<CanvasSettings>({
    ...defaultSettings,
    ...initialSettings
  });

  // Update zoom level
  const updateZoom = useCallback((zoom: number) => {
    setSettings(prev => ({
      ...prev,
      zoomLevel: Math.max(0.5, Math.min(3, zoom))
    }));
  }, []);

  // Update pan position
  const updatePan = useCallback((position: { x: number; y: number }) => {
    setSettings(prev => ({
      ...prev,
      panPosition: position
    }));
  }, []);

  // Update selected year
  const updateSelectedYear = useCallback((year: number | undefined) => {
    setSettings(prev => ({
      ...prev,
      selectedYear: year
    }));
  }, []);

  // Update filter settings
  const updateFilter = useCallback((filter: CanvasSettings['filterSettings']) => {
    setSettings(prev => ({
      ...prev,
      filterSettings: { ...prev.filterSettings, ...filter }
    }));
  }, []);

  // Reset view to defaults
  const resetView = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      zoomLevel: 1,
      panPosition: { x: 0, y: 0 }
    }));
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('canvasSettings', JSON.stringify(settings));
  }, [settings]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('canvasSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse saved canvas settings:', error);
      }
    }
  }, []);

  return {
    settings,
    updateZoom,
    updatePan,
    updateSelectedYear,
    updateFilter,
    resetView
  };
}
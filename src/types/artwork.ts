import { Comment } from './comment';

export interface ArtworkPanel {
  id: string;
  year: number;
  title: string;
  imageUrl: string;
  dimensions: { width: number; height: number };
  comments: Comment[];
  metadata: {
    originalWidth: number;
    originalHeight: number;
    description?: string;
    stockMarketContext?: string;
  };
}

export interface ArtworkCollection {
  id: string;
  title: string;
  artist: string;
  description: string;
  panels: ArtworkPanel[];
  yearRange: { start: number; end: number };
  metadata: {
    totalComments: number;
    languages: string[];
    lastUpdated: number;
  };
}

export interface CanvasSettings {
  zoomLevel: number;
  panPosition: { x: number; y: number };
  selectedYear?: number;
  filterSettings: {
    language?: string;
    showApprovedOnly: boolean;
    dateRange?: { start: number; end: number };
  };
}
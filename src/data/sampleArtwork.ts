import { ArtworkCollection, ArtworkPanel } from '@/types/artwork';

// Sample artwork panels for testing (2000-2009)
export const sampleArtworkPanels: ArtworkPanel[] = [
  {
    id: 'panel-2000',
    year: 2000,
    title: 'New Millennium Optimism',
    imageUrl: '/images/optimized/A Moving Mountain %231.jpg',
    dimensions: { width: 1200, height: 800 },
    comments: [],
    metadata: {
      originalWidth: 2400,
      originalHeight: 1600,
      description: 'The peak of the dot-com bubble, depicting the frenzied optimism of the new millennium.',
      stockMarketContext: 'NASDAQ peaked at 5,048.62 in March 2000, marking the height of the dot-com bubble.'
    }
  },
  {
    id: 'panel-2001',
    year: 2001,
    title: 'September 11th Impact',
    imageUrl: '/images/optimized/A Moving Mountain %232.jpg',
    dimensions: { width: 1200, height: 800 },
    comments: [],
    metadata: {
      originalWidth: 2400,
      originalHeight: 1600,
      description: 'The dramatic market collapse following the September 11th attacks.',
      stockMarketContext: 'Markets closed for four days after 9/11, reopening with the largest point drop in history.'
    }
  },
  {
    id: 'panel-2002',
    year: 2002,
    title: 'Corporate Trust Erosion',
    imageUrl: '/images/optimized/A Moving Mountain %233.jpg',
    dimensions: { width: 1200, height: 800 },
    comments: [],
    metadata: {
      originalWidth: 2400,
      originalHeight: 1600,
      description: 'The erosion of trust following Enron, WorldCom, and other corporate scandals.',
      stockMarketContext: 'Enron bankruptcy in December 2001 and WorldCom collapse in 2002 shattered investor confidence.'
    }
  },
  {
    id: 'panel-2003',
    year: 2003,
    title: 'War and Market Volatility',
    imageUrl: '/images/optimized/A Moving Mountain %234.jpg',
    dimensions: { width: 1200, height: 800 },
    comments: [],
    metadata: {
      originalWidth: 2400,
      originalHeight: 1600,
      description: 'Market volatility during the Iraq War invasion and its aftermath.',
      stockMarketContext: 'Markets rallied after the initial invasion but remained volatile throughout the year.'
    }
  },
  {
    id: 'panel-2004',
    year: 2004,
    title: 'Economic Recovery',
    imageUrl: '/images/optimized/A Moving Mountain %235.jpg',
    dimensions: { width: 1200, height: 800 },
    comments: [],
    metadata: {
      originalWidth: 2400,
      originalHeight: 1600,
      description: 'The beginning of economic recovery and renewed investor confidence.',
      stockMarketContext: 'Strong GDP growth and corporate earnings drove market recovery.'
    }
  },
  {
    id: 'panel-2005',
    year: 2005,
    title: 'Housing Market Surge',
    imageUrl: '/images/optimized/A Moving Mountain %236.jpg',
    dimensions: { width: 1200, height: 800 },
    comments: [],
    metadata: {
      originalWidth: 2400,
      originalHeight: 1600,
      description: 'The height of the housing bubble, with mortgage-backed securities driving growth.',
      stockMarketContext: 'Real estate and financial sectors led market gains amid low interest rates.'
    }
  },
  {
    id: 'panel-2006',
    year: 2006,
    title: 'Subprime Warnings',
    imageUrl: '/images/optimized/A Moving Mountain %237.jpg',
    dimensions: { width: 1200, height: 800 },
    comments: [],
    metadata: {
      originalWidth: 2400,
      originalHeight: 1600,
      description: 'Early warning signs of the subprime mortgage crisis begin to emerge.',
      stockMarketContext: 'Markets continued to rise despite growing concerns about mortgage quality.'
    }
  },
  {
    id: 'panel-2007',
    year: 2007,
    title: 'Credit Crisis Emergence',
    imageUrl: '/images/optimized/A Moving Mountain %238.jpg',
    dimensions: { width: 1200, height: 800 },
    comments: [],
    metadata: {
      originalWidth: 2400,
      originalHeight: 1600,
      description: 'The beginning of the credit crisis with Bear Stearns hedge fund failures.',
      stockMarketContext: 'Markets peaked in October 2007 before the subprime crisis fully emerged.'
    }
  },
  {
    id: 'panel-2008',
    year: 2008,
    title: 'Great Financial Crisis',
    imageUrl: '/images/optimized/A Moving Mountain %239.jpg',
    dimensions: { width: 1200, height: 800 },
    comments: [],
    metadata: {
      originalWidth: 2400,
      originalHeight: 1600,
      description: 'The dramatic collapse of Lehman Brothers and the global financial crisis.',
      stockMarketContext: 'Dow Jones fell from 14,164 in October 2007 to 6,547 in March 2009.'
    }
  },
  {
    id: 'panel-2009',
    year: 2009,
    title: 'Market Bottom & Hope',
    imageUrl: '/images/optimized/A Moving Mountain %2310.jpg',
    dimensions: { width: 1200, height: 800 },
    comments: [],
    metadata: {
      originalWidth: 2400,
      originalHeight: 1600,
      description: 'The market reaches its lowest point and begins the long road to recovery.',
      stockMarketContext: 'Markets hit bottom in March 2009 and began recovering with government stimulus.'
    }
  }
];

// Main artwork collection
export const movingMountainCollection: ArtworkCollection = {
  id: 'moving-mountain-collection',
  title: 'A Moving Mountain',
  artist: 'Dr. Gan Yu',
  description: 'A 20-foot-long ink painting depicting the rise and fall of the stock market from 2000 to 2009, blending financial data with expressive, mountainous landscapes.',
  panels: sampleArtworkPanels,
  yearRange: { start: 2000, end: 2009 },
  metadata: {
    totalComments: 0,
    languages: ['en'],
    lastUpdated: Date.now()
  }
};

// Sample comments for demonstration
export const sampleComments = [
  {
    id: 'comment-1',
    text: 'This period reminds me of the fear and uncertainty we all felt.',
    type: 'text' as const,
    language: 'en',
    position: { x: 0.3, y: 0.5 },
    year: 2008,
    timestamp: Date.now() - 86400000, // 1 day ago
    userId: 'user-1',
    approved: true,
    metadata: {
      device: 'mobile' as const,
      inputMethod: 'touch' as const,
      sessionId: 'session-1'
    }
  },
  {
    id: 'comment-2',
    text: '¡Qué época tan difícil! Perdí mi trabajo durante esta crisis.',
    type: 'text' as const,
    language: 'es',
    position: { x: 0.7, y: 0.3 },
    year: 2008,
    timestamp: Date.now() - 172800000, // 2 days ago
    userId: 'user-2',
    approved: true,
    metadata: {
      device: 'tablet' as const,
      inputMethod: 'stylus' as const,
      sessionId: 'session-2'
    }
  },
  {
    id: 'comment-3',
    text: 'The optimism of the new millennium feels so distant now.',
    type: 'text' as const,
    language: 'en',
    position: { x: 0.2, y: 0.8 },
    year: 2000,
    timestamp: Date.now() - 259200000, // 3 days ago
    userId: 'user-3',
    approved: true,
    metadata: {
      device: 'desktop' as const,
      inputMethod: 'keyboard' as const,
      sessionId: 'session-3'
    }
  },
  {
    id: 'comment-4',
    text: 'Cette crise a changé ma vision de l économie.',
    type: 'text' as const,
    language: 'fr',
    position: { x: 0.5, y: 0.4 },
    year: 2009,
    timestamp: Date.now() - 345600000, // 4 days ago
    userId: 'user-4',
    approved: true,
    metadata: {
      device: 'mobile' as const,
      inputMethod: 'touch' as const,
      sessionId: 'session-4'
    }
  },
  {
    id: 'comment-5',
    text: 'Ich erinnere mich an die Panik in den Nachrichten.',
    type: 'text' as const,
    language: 'de',
    position: { x: 0.8, y: 0.6 },
    year: 2008,
    timestamp: Date.now() - 432000000, // 5 days ago
    userId: 'user-5',
    approved: true,
    metadata: {
      device: 'tablet' as const,
      inputMethod: 'stylus' as const,
      sessionId: 'session-5'
    }
  }
];

// Placeholder images (to be replaced with actual artwork)
export const placeholderImages = {
  2000: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDgwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iODAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMCA0MDBMMTQ5IDIwMEwyODggMzAwTDQyNyAxMDBMNTY2IDI1MEw3MDUgMTUwTDg0NCAzNTBMOTgzIDIwMEwxMTIyIDEwMCIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz4KPHR4dCB4PSI2MDAiIHk9IjQwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzMzMyIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsIj4yMDAwIC0gRG90LUNvbSBCdWJibGUgUGVhazwvdGV4dD4KPC9zdmc+',
  2001: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDgwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iODAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMCAxMDBMMTQ5IDIwMEwyODggMzAwTDQyNyA2MDBMNTG2IDU1MEw3MDUgNTAwTDg0NCA0NDBMOTG4IDM4MEwxMTIyIDMyMCIgc3Ryb2tlPSIjREMxOTE3IiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz4KPHR4dCB4PSI2MDAiIHk9IjQwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzMzMyIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsIj4yMDAxIC0gU2VwdGVtYmVyIDExdGggTWFya2V0IENyYXNoPC90ZXh0Pgo8L3N2Zz4=',
  2002: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDgwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iODAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMCAzMjBMMTQ5IDM4MEwyODggNDQwTDQyNyA1MDBMNTG2IDU1MEw3MDUgNjAwTDg0NCA2NTBMOTG4IDcwMEwxMTIyIDcwMCIgc3Ryb2tlPSIjREM2NjI2IiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz4KPHR4dCB4PSI2MDAiIHk9IjQwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzMzMyIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsIj4yMDAyIC0gQ29ycG9yYXRlIFNjYW5kYWxzPC90ZXh0Pgo8L3N2Zz4=',
  2008: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDgwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iODAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMCAyMDBMMTQ5IDI1MEwyODggMzAwTDQyNyA1MDBMNTG2IDYwMEw3MDUgNzAwTDg0NCA3NTBMOTG4IDc1MEwxMTIyIDc1MCIgc3Ryb2tlPSIjOTkxQjFCIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz4KPHR4dCB4PSI2MDAiIHk9IjQwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzMzMyIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsIj4yMDA4IC0gRmluYW5jaWFsIENvbGxhcHNlPC90ZXh0Pgo8L3N2Zz4='
};

// Function to get artwork panel by year
export function getArtworkPanelByYear(year: number): ArtworkPanel | null {
  return sampleArtworkPanels.find(panel => panel.year === year) || null;
}

// Function to get all available years
export function getAvailableYears(): number[] {
  return sampleArtworkPanels.map(panel => panel.year).sort();
}

// Function to get unique languages from comments
export function getAvailableLanguages(): string[] {
  const languages = new Set(sampleComments.map(comment => comment.language));
  return Array.from(languages).sort();
}
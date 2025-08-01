export interface Comment {
  id: string;
  text?: string;
  imageData?: string; // Base64 PNG data for drawings
  type: 'text' | 'drawing';
  language?: string;
  position: { x: number; y: number };
  year: number; // 2000-2009
  timestamp: number;
  userId: string; // anonymous session
  approved: boolean;
  color?: string; // Hex color code (e.g., '#ff0000'), defaults to '#000000' if not provided
  metadata: {
    device: 'mobile' | 'tablet' | 'desktop';
    inputMethod: 'touch' | 'keyboard' | 'stylus';
    sessionId: string;
    userAgent?: string;
  };
}

export interface CommentInput {
  text?: string;
  imageData?: string;
  type: 'text' | 'drawing';
  position: { x: number; y: number };
  year: number;
  device: 'mobile' | 'tablet' | 'desktop';
  inputMethod: 'touch' | 'keyboard' | 'stylus';
  color?: string; // Hex color code (e.g., '#ff0000'), optional - defaults to '#000000'
}

export interface CommentFilter {
  language?: string;
  year?: number;
  approved?: boolean;
  dateRange?: {
    start: number;
    end: number;
  };
}

// Available color options for comments
export const COMMENT_COLORS = {
  BLACK: '#000000',
  WHITE: '#ffffff',
  RED: '#ff0000',
  GREEN: '#008000',
  BLUE: '#0000ff',
  YELLOW: '#ffff00',
  ORANGE: '#ffa500',
  PURPLE: '#800080',
  PINK: '#ffc0cb',
  BROWN: '#a52a2a',
  GRAY: '#808080'
} as const;

export type CommentColorValue = typeof COMMENT_COLORS[keyof typeof COMMENT_COLORS];
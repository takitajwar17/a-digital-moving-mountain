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
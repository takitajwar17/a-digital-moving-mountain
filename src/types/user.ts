export interface User {
  id: string;
  sessionId: string;
  isAnonymous: boolean;
  createdAt: number;
  lastActive: number;
  preferences: {
    language: string;
    preferredInputMethod: 'touch' | 'keyboard' | 'stylus';
    theme: 'light' | 'dark' | 'auto';
  };
  metadata: {
    device: 'mobile' | 'tablet' | 'desktop';
    userAgent: string;
    location?: {
      country?: string;
      city?: string;
    };
  };
}

export interface UserSession {
  sessionId: string;
  userId: string;
  startTime: number;
  endTime?: number;
  interactions: {
    commentsPosted: number;
    panelsViewed: number[];
    totalTimeSpent: number;
  };
  device: 'mobile' | 'tablet' | 'desktop';
}

export interface UserActivity {
  id: string;
  userId: string;
  sessionId: string;
  type: 'comment' | 'view' | 'filter' | 'zoom' | 'pan';
  timestamp: number;
  data: Record<string, any>;
}
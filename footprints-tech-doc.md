# A Digital Moving Mountain - Technical Specification Document

## 1. Project Overview

### 1.1 Technical Summary
A Next.js-based interactive digital art platform that transforms Dr. Gan Yu's "A Moving Mountain" painting into a collaborative digital experience. Users can contribute messages that appear as digital ink notes on a virtual canvas representing Dow Jones performance (2000-2009).

### 1.2 Core Technical Requirements
- **Platform**: Web application (responsive)
- **Framework**: Next.js 14+ with App Router
- **Real-time**: WebSocket connections for live updates
- **Database**: Firebase Firestore for comment storage
- **Authentication**: Anonymous session-based participation
- **Deployment**: Vercel/Netlify with CDN support
- **Languages**: Multi-language support with i18n

## 2. Architecture Design

### 2.1 System Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Client Apps   │────▶│   Next.js API   │────▶│    Firebase     │
│  (Web/Mobile)   │◀────│     Routes      │◀────│   Firestore     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                        │
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Vercel      │     │   WebSocket     │     │  Firebase Auth  │
│      CDN        │     │     Server      │     │   (Anonymous)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 2.2 Tech Stack
- **Frontend**: Next.js 14+, React 18, TypeScript
- **Styling**: Tailwind CSS + CSS Modules
- **State Management**: Zustand for client state
- **Real-time**: Socket.io or native WebSockets
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage (artwork images)
- **Analytics**: Vercel Analytics
- **Monitoring**: Sentry for error tracking

## 3. Database Schema

### 3.1 Collections Structure

#### Comments Collection
```typescript
interface Comment {
  id: string;
  text: string;
  language: string;
  year: number; // 2000-2009
  position: {
    x: number; // Normalized 0-1
    y: number; // Normalized 0-1
  };
  style: {
    fontFamily: 'handwritten' | 'calligraphy' | 'print';
    fontSize: 'small' | 'medium' | 'large';
    color: string; // Hex color
    rotation: number; // Degrees
  };
  emotion?: 'positive' | 'negative' | 'neutral';
  device: 'mobile' | 'tablet' | 'desktop' | 'gallery';
  timestamp: Timestamp;
  sessionId: string;
  approved: boolean; // For moderation
}
```

#### Sessions Collection
```typescript
interface Session {
  id: string;
  deviceInfo: {
    type: string;
    browser: string;
    os: string;
  };
  location?: {
    isGallery: boolean;
    coordinates?: GeoPoint;
  };
  createdAt: Timestamp;
  lastActive: Timestamp;
}
```

#### Analytics Collection
```typescript
interface Analytics {
  id: string;
  date: string; // YYYY-MM-DD
  metrics: {
    totalComments: number;
    uniqueVisitors: number;
    languageDistribution: Record<string, number>;
    yearDistribution: Record<string, number>;
    deviceTypes: Record<string, number>;
  };
}
```

## 4. API Design

### 4.1 RESTful API Endpoints

```typescript
// Comment Management
POST   /api/comments          // Create new comment
GET    /api/comments          // Get comments with filters
GET    /api/comments/live     // SSE endpoint for real-time updates
DELETE /api/comments/:id      // Admin moderation

// Canvas Data
GET    /api/canvas/years      // Get year panels metadata
GET    /api/canvas/image/:year // Get high-res image for year

// Analytics
GET    /api/analytics/summary // Get current stats
POST   /api/analytics/track   // Track user interactions

// Session Management
POST   /api/session/create    // Create anonymous session
GET    /api/session/validate  // Validate current session
```

### 4.2 WebSocket Events

```typescript
// Client → Server
interface ClientEvents {
  'comment:create': CommentData;
  'canvas:view': { year: number; zoom: number };
  'filter:change': FilterOptions;
}

// Server → Client
interface ServerEvents {
  'comment:new': Comment;
  'comment:batch': Comment[];
  'visitors:update': number;
  'analytics:pulse': RealtimeStats;
}
```

## 5. Frontend Architecture

### 5.1 Component Structure
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── api/
│   │   ├── comments/
│   │   ├── canvas/
│   │   └── analytics/
│   └── [year]/
│       └── page.tsx
├── components/
│   ├── Canvas/
│   │   ├── CanvasViewer.tsx
│   │   ├── CommentLayer.tsx
│   │   ├── YearPanel.tsx
│   │   └── ZoomControls.tsx
│   ├── Comments/
│   │   ├── CommentInput.tsx
│   │   ├── CommentDisplay.tsx
│   │   └── CommentFilters.tsx
│   ├── Gallery/
│   │   ├── TouchInterface.tsx
│   │   └── StylusInput.tsx
│   └── Shared/
│       ├── QRScanner.tsx
│       └── LanguageSelector.tsx
├── hooks/
│   ├── useCanvas.ts
│   ├── useComments.ts
│   ├── useRealtime.ts
│   └── useGalleryMode.ts
├── lib/
│   ├── firebase.ts
│   ├── websocket.ts
│   └── utils.ts
└── styles/
    ├── globals.css
    └── ink-effects.css
```

### 5.2 Key Components

#### CanvasViewer Component
```typescript
interface CanvasViewerProps {
  year: number;
  comments: Comment[];
  onCommentAdd: (position: Point) => void;
  isGalleryMode: boolean;
}

// Features:
// - Pan and zoom functionality
// - Touch gesture support
// - Comment overlay positioning
// - High-res image lazy loading
```

#### CommentInput Component
```typescript
interface CommentInputProps {
  position: Point;
  year: number;
  onSubmit: (comment: CommentData) => void;
  inputMethod: 'keyboard' | 'stylus' | 'voice';
}

// Features:
// - Multi-language input
// - Character limit enforcement
// - Style customization
// - Preview before submission
```

## 6. Real-time Features

### 6.1 Implementation Strategy
- Use Server-Sent Events (SSE) for comment streaming
- WebSocket fallback for bidirectional communication
- Redis pub/sub for horizontal scaling
- Optimistic UI updates for better UX

### 6.2 Real-time Data Flow
```typescript
// Client-side real-time hook
function useRealtime() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [visitors, setVisitors] = useState(0);

  useEffect(() => {
    const eventSource = new EventSource('/api/comments/live');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch(data.type) {
        case 'comment:new':
          setComments(prev => [...prev, data.comment]);
          break;
        case 'visitors:update':
          setVisitors(data.count);
          break;
      }
    };

    return () => eventSource.close();
  }, []);

  return { comments, visitors };
}
```

## 7. Performance Optimization

### 7.1 Image Optimization
- Use Next.js Image component with responsive sizing
- Implement progressive loading for high-res artwork
- Generate multiple resolutions (thumbnail, medium, full)
- Lazy load year panels based on viewport

### 7.2 Comment Rendering
- Virtual scrolling for large comment lists
- Canvas-based rendering for better performance
- Batch DOM updates using React 18 features
- Implement comment clustering at low zoom levels

### 7.3 Caching Strategy
- CDN caching for static assets
- Redis caching for frequently accessed data
- Local storage for user preferences
- Service Worker for offline capability

## 8. Security Considerations

### 8.1 Content Moderation
- Automated profanity filtering
- Rate limiting per session (5 comments/minute)
- Admin dashboard for manual moderation
- Report functionality for inappropriate content

### 8.2 Data Protection
- Anonymous sessions (no PII collection)
- HTTPS enforcement
- Input sanitization for XSS prevention
- CORS configuration for API protection

### 8.3 Gallery Mode Security
- Device lockdown for public tablets
- Kiosk mode implementation
- Auto-reset after inactivity
- Limited access to system functions

## 9. Deployment Strategy

### 9.1 Environment Setup
```yaml
# Production Environment Variables
NEXT_PUBLIC_FIREBASE_CONFIG
FIREBASE_ADMIN_KEY
WEBSOCKET_URL
REDIS_URL
SENTRY_DSN
NEXT_PUBLIC_GA_ID
```

### 9.2 CI/CD Pipeline
```yaml
# GitHub Actions Workflow
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  test:
    - Run unit tests
    - Run integration tests
    - Check TypeScript
    - Lint code
  build:
    - Build Next.js app
    - Optimize images
    - Generate sitemap
  deploy:
    - Deploy to Vercel
    - Invalidate CDN cache
    - Run smoke tests
```

## 10. Testing Strategy

### 10.1 Test Coverage
- Unit tests for utility functions (Jest)
- Component testing (React Testing Library)
- Integration tests for API endpoints
- E2E tests for critical user flows (Playwright)
- Load testing for real-time features

### 10.2 Key Test Scenarios
```typescript
// Example test cases
describe('Comment Submission', () => {
  test('submits comment with valid data', async () => {
    // Test implementation
  });
  
  test('handles network failures gracefully', async () => {
    // Test implementation
  });
  
  test('enforces rate limiting', async () => {
    // Test implementation
  });
});
```

## 11. Accessibility Features

### 11.1 WCAG Compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Text size adjustment
- Alternative text for visual elements

### 11.2 Multi-language Support
```typescript
// i18n configuration
const languages = ['en', 'es', 'zh', 'ar', 'fr', 'de'];

// RTL support for Arabic
const rtlLanguages = ['ar', 'he', 'fa'];
```

## 12. Gallery Installation

### 12.1 Hardware Requirements
- Tablet/Touchscreen specs (minimum iPad Pro or equivalent)
- Stable internet connection (minimum 10 Mbps)
- QR code display stands
- Optional: Stylus pens with tethers

### 12.2 Gallery Mode Features
- Fullscreen kiosk mode
- Auto-refresh every 30 minutes
- Simplified UI for touch interaction
- Large touch targets
- Clear visual feedback

## 13. Analytics & Monitoring

### 13.1 Metrics to Track
- Total comments per day/hour
- Language distribution
- Device type breakdown
- Popular year panels
- User engagement time
- Error rates and types

### 13.2 Dashboard Implementation
```typescript
// Real-time analytics dashboard
interface DashboardMetrics {
  activeUsers: number;
  commentsToday: number;
  topLanguages: Array<{language: string; count: number}>;
  yearHeatmap: Record<number, number>;
  deviceBreakdown: PieChartData;
  errorRate: number;
}
```

## 14. Timeline Implementation

### Week 1: Foundation
- Set up Next.js project with TypeScript
- Configure Firebase and authentication
- Create basic component structure
- Implement canvas viewer prototype

### Week 2: Core Features
- Build comment submission system
- Implement real-time updates
- Create QR code generation
- Design responsive layouts

### Week 3: Interactivity
- Develop touch/stylus input
- Add comment positioning logic
- Implement filtering system
- Create ink effect animations

### Week 4: Polish & Testing
- Add language support
- Implement moderation tools
- Optimize performance
- Write comprehensive tests

### Week 5: Gallery Setup
- Configure gallery mode
- Test on actual hardware
- Implement offline fallbacks
- Create admin dashboard

### Week 6: Launch Preparation
- Final bug fixes
- Load testing
- Documentation completion
- Deployment to production

## 15. Future Enhancements

### 15.1 Phase 2 Features
- AI-powered emotion analysis
- Time-lapse visualization of comments
- Social sharing capabilities
- Virtual reality viewing mode
- API for external integrations

### 15.2 Long-term Preservation
- Data export functionality
- Archive generation
- Historical playback feature
- Academic research access
- Digital art NFT integration
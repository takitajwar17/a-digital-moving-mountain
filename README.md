# Footprints Across the Ocean

A digital interactive art platform that transforms Dr. Gan Yu's "A Moving Mountain" painting into a collaborative digital experience. This project extends the original 20-foot-long ink painting depicting the Dow Jones performance from 2000-2009 into an interactive web application where visitors can contribute messages that appear as digital ink notes on the virtual canvas.

## Project Overview

**Footprints Across the Ocean** is based on "A Moving Mountain – Dow Jones Performance in the First Decade of the 21st Century" by artist Dr. Gan Yu. The original artwork blends financial data with expressive, mountainous landscapes and invites visitors to write directly on the artwork, making it a living piece of collaborative art.

This digital version allows visitors to:
- Leave comments and reflections that appear as digital ink notes on the canvas
- Interact via mobile devices through QR codes at the exhibition
- Use touchscreen interfaces with stylus input for natural writing
- View real-time contributions from other visitors
- Filter comments by language, year, or emotion
- Participate from anywhere in the world, not just the gallery

## Key Features

### Core Interactive Features
- **Digital Canvas**: High-resolution artwork divided by year (2000–2009) with zoom and exploration capabilities
- **Ink Note Comments**: Messages appear as stylized digital ink notes with handwritten effects
- **Real-time Updates**: Live synchronization of all contributions across all devices
- **Multi-language Support**: Comments can be written and filtered by language
- **Gallery Mode**: Optimized touchscreen interface for in-person gallery installations
- **QR Code Access**: Easy mobile access without requiring app installation

### Technical Features
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Real-time Communication**: WebSocket-based live updates
- **Content Moderation**: Automated filtering with admin oversight
- **Analytics Dashboard**: Track engagement, language distribution, and usage patterns
- **Offline Capability**: Service worker for basic offline functionality

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS v4 with custom ink effects
- **Database**: Firebase Firestore for real-time data
- **Authentication**: Anonymous session-based participation
- **Real-time**: WebSocket connections for live updates
- **Deployment**: Vercel with CDN support
- **Analytics**: Built-in tracking and monitoring

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account (for backend services)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/takitajwar17/a-digital-moving-mountain.git
   cd a-digital-moving-mountain
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests


## Gallery Installation

For physical gallery installations:

### Hardware Requirements
- Tablet/Touchscreen (minimum iPad Pro or equivalent)
- Stable internet connection (minimum 10 Mbps)
- QR code display stands
- Optional: Stylus pens with tethers

### Gallery Mode Features
- Fullscreen kiosk mode
- Auto-refresh every 30 minutes
- Simplified UI for touch interaction
- Large touch targets for accessibility
- Clear visual feedback



## License

This project is licensed under the MIT License - see the LICENSE file for details.


# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**"A Digital Moving Mountain"** is a Next.js 15 application using TypeScript, Tailwind CSS v4, and shadcn/ui. It's an interactive artwork display and commenting system that allows users to view historical artwork panels (2000-2009), add text comments, create drawings, and interact with community feedback.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Architecture

### Project Structure
- `src/app/` - Next.js App Router structure
  - `page.tsx` - Main artwork display page (moved from /display to /)
  - `layout.tsx` - Root layout with font configuration
  - `globals.css` - Global styles with Tailwind v4 and shadcn/ui imports
  - `admin/` - Admin panel for content management
- `src/components/` - React components organized by feature
  - `Canvas/` - Artwork display and comment overlay components
  - `Comments/` - Comment mode selector and related UI
  - `Input/` - Comment modal and form components
  - `Drawing/` - Drawing canvas for sketch comments
  - `ui/` - shadcn/ui component library
- `src/hooks/` - Custom React hooks for data management
- `src/services/` - Firebase integration and data services
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions and helpers
- `src/data/` - Sample artwork data and configurations
- `public/` - Static assets

### Key Technologies
- **Next.js 15** with App Router
- **TypeScript 5** with strict configuration
- **Tailwind CSS v4** with @theme inline syntax
- **shadcn/ui** - Complete UI component library with Radix primitives
- **Firebase** - Backend service for comment storage and management
- **Framer Motion** - Animations and transitions
- **Lucide React** - Icon system
- **Geist fonts** (Sans and Mono) via next/font/google

### UI System
- **shadcn/ui components**: Cards, Dialogs, Buttons, Tabs, Inputs, Color Picker
- **Professional design system** with consistent spacing, typography, colors
- **Responsive design** optimized for mobile, tablet, and desktop
- **Accessibility** with proper ARIA labels and keyboard navigation
- **Color theming** with CSS custom properties and dark mode support

### Comment System
- **Dual input modes**: Text comments and drawing/sketching
- **Color selection**: 7 colors (Black, Red, Blue, Green, Gray, Purple, Orange)
- **Firebase integration**: Real-time comment storage and retrieval
- **Position-based comments**: Comments are placed at specific coordinates on artwork
- **Device detection**: Optimized interactions for touch, keyboard, and stylus
- **Comment filtering**: By year, approval status, and other criteria

### Data Management
- **Firebase Firestore**: Comment storage with real-time synchronization
- **Custom hooks**: `useComments`, `useCanvas`, `useImagePreloader`
- **Type safety**: Full TypeScript interfaces for all data structures
- **Caching**: Image preloading and performance optimization

## Development Notes

### Styling Conventions
- Use shadcn/ui components for all UI elements
- Follow the established color picker pattern for new color selections
- Maintain responsive design patterns (mobile-first approach)
- Use `cn()` utility for className merging
- Apply proper semantic color tokens (muted-foreground, destructive, etc.)

### Component Patterns
- All modals use shadcn/ui Dialog or Card components
- Color selection uses the custom ColorPicker component
- Form submissions include color parameter: `(text: string, color: string) => void`
- Drawing canvas supports dynamic color stroke changes
- Comments display colors appropriately (text color for text, border for drawings)

### Firebase Integration
- Comments stored with color field (defaults to black if not provided)
- Backward compatibility maintained for existing comments
- Real-time updates and filtering capabilities
- Type-safe data conversion utilities

### Performance Optimizations
- Image preloading for smooth navigation
- Lazy loading patterns
- Optimized canvas rendering
- Efficient comment positioning algorithms

The application provides an engaging platform for community interaction with historical artwork through modern web technologies.
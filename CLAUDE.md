# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application using TypeScript and Tailwind CSS v4. It's a standard Create Next App setup with the App Router architecture.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Architecture

### Project Structure
- `src/app/` - Next.js App Router structure
  - `page.tsx` - Main page component
  - `layout.tsx` - Root layout with font configuration
  - `globals.css` - Global styles with Tailwind v4 imports
- `public/` - Static assets (SVG icons)
- TypeScript configuration supports path aliases via `@/*` mapping to `./src/*`

### Key Technologies
- **Next.js 15** with App Router
- **TypeScript 5** with strict configuration
- **Tailwind CSS v4** with new @theme inline syntax
- **Geist fonts** (Sans and Mono) via next/font/google
- **ESLint** with Next.js config

### Styling System
Uses Tailwind v4 with CSS custom properties for theming:
- Light/dark mode support via `prefers-color-scheme`
- CSS variables defined in `globals.css:3-6` and `globals.css:16-19`
- Geist fonts integrated via CSS variables

## Development Notes

The application uses the new Tailwind v4 syntax with `@theme inline` declarations. All styling follows standard Tailwind conventions with built-in dark mode support.
'use client';

import { ReactNode } from 'react';
import FilterBar from '../Filters/FilterBar';
import { CommentFilter } from '@/types/comment';

interface TabletLayoutProps {
  children: ReactNode;
  filter: CommentFilter;
  onFilterChange: (filter: CommentFilter) => void;
  availableYears: number[];
  availableLanguages: string[];
  isKioskMode?: boolean;
  className?: string;
}

export default function TabletLayout({
  children,
  filter,
  onFilterChange,
  availableYears,
  availableLanguages,
  isKioskMode = false,
  className = ''
}: TabletLayoutProps) {
  return (
    <div className={`flex flex-col h-screen bg-gray-50 ${className}`}>
      {/* Header - Hidden in kiosk mode */}
      {!isKioskMode && (
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                A Digital Moving Mountain
              </h1>
              <p className="text-gray-600 mt-1">
                Interactive digital canvas by Dr. Gan Yu
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Gallery Mode</p>
                <p className="text-lg font-semibold text-blue-600">Active</p>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Filter Bar */}
      <FilterBar
        filter={filter}
        onFilterChange={onFilterChange}
        availableYears={availableYears}
        availableLanguages={availableLanguages}
        className="bg-white border-b border-gray-200 p-6"
        isTabletMode
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {children}
        
        {/* Floating Instructions */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-6 py-3 rounded-full text-lg">
          Touch anywhere on the artwork to share your thoughts
        </div>
      </main>

      {/* Status Bar - Always visible */}
      <div className="bg-gray-800 text-white px-6 py-2 text-sm flex justify-between items-center">
        <span>
          {new Date().toLocaleTimeString()} | Gallery Installation
        </span>
        <span className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          Connected
        </span>
      </div>
    </div>
  );
}
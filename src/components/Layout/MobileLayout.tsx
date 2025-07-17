'use client';

import { ReactNode } from 'react';
import FilterBar from '../Filters/FilterBar';
import { CommentFilter } from '@/types/comment';

interface MobileLayoutProps {
  children: ReactNode;
  filter: CommentFilter;
  onFilterChange: (filter: CommentFilter) => void;
  availableYears: number[];
  availableLanguages: string[];
  className?: string;
}

export default function MobileLayout({
  children,
  filter,
  onFilterChange,
  availableYears,
  availableLanguages,
  className = ''
}: MobileLayoutProps) {
  return (
    <div className={`flex flex-col h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">
            Footprints Across the Ocean
          </h1>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 12C11.1046 12 12 11.1046 12 10C12 8.89543 11.1046 8 10 8C8.89543 8 8 8.89543 8 10C8 11.1046 8.89543 12 10 12Z" fill="currentColor"/>
              <path d="M10 5C11.1046 5 12 4.10457 12 3C12 1.89543 11.1046 1 10 1C8.89543 1 8 1.89543 8 3C8 4.10457 8.89543 5 10 5Z" fill="currentColor"/>
              <path d="M10 19C11.1046 19 12 18.1046 12 17C12 15.8954 11.1046 15 10 15C8.89543 15 8 15.8954 8 17C8 18.1046 8.89543 19 10 19Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar
        filter={filter}
        onFilterChange={onFilterChange}
        availableYears={availableYears}
        availableLanguages={availableLanguages}
        className="bg-white border-b border-gray-200 p-4"
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 p-4 text-center">
        <p className="text-sm text-gray-600">
          Tap anywhere on the artwork to add your thoughts
        </p>
      </footer>
    </div>
  );
}
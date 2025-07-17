'use client';

import { ReactNode, useState } from 'react';
import FilterSidebar from '../Filters/FilterSidebar';
import { CommentFilter } from '@/types/comment';

interface DesktopLayoutProps {
  children: ReactNode;
  filter: CommentFilter;
  onFilterChange: (filter: CommentFilter) => void;
  availableYears: number[];
  availableLanguages: string[];
  totalComments: number;
  className?: string;
}

export default function DesktopLayout({
  children,
  filter,
  onFilterChange,
  availableYears,
  availableLanguages,
  totalComments,
  className = ''
}: DesktopLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={`flex h-screen bg-gray-50 ${className}`}>
      {/* Sidebar */}
      <FilterSidebar
        filter={filter}
        onFilterChange={onFilterChange}
        availableYears={availableYears}
        availableLanguages={availableLanguages}
        totalComments={totalComments}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 6H17M3 10H17M3 14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Footprints Across the Ocean
                </h1>
                <p className="text-gray-600 mt-1">
                  A digital interpretation of &quot;A Moving Mountain&quot; by Dr. Gan Yu
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Active Comments</p>
                <p className="text-2xl font-bold text-blue-600">{totalComments}</p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">Years Covered</p>
                <p className="text-2xl font-bold text-green-600">2000-2009</p>
              </div>
            </div>
          </div>
        </header>

        {/* Canvas Area */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              Click anywhere on the artwork to add your perspective to this collaborative piece
            </p>
            <div className="flex items-center gap-4">
              <span>Languages: {availableLanguages.length}</span>
              <span>•</span>
              <span>Real-time updates active</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
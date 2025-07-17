'use client';

import { CommentFilter } from '@/types/comment';

interface FilterSidebarProps {
  filter: CommentFilter;
  onFilterChange: (filter: CommentFilter) => void;
  availableYears: number[];
  availableLanguages: string[];
  totalComments: number;
  isOpen: boolean;
  onToggle: () => void;
}

export default function FilterSidebar({
  filter,
  onFilterChange,
  availableYears,
  availableLanguages,
  totalComments,
  isOpen,
  onToggle
}: FilterSidebarProps) {
  const handleYearChange = (year: number | undefined) => {
    onFilterChange({ ...filter, year });
  };

  const handleLanguageChange = (language: string | undefined) => {
    onFilterChange({ ...filter, language });
  };

  const clearFilters = () => {
    onFilterChange({ approved: true });
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Filters & View
            </h2>
            <button
              onClick={onToggle}
              className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{totalComments}</p>
                <p className="text-sm text-gray-600">Total Comments</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{availableLanguages.length}</p>
                <p className="text-sm text-gray-600">Languages</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Filter by Year
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => handleYearChange(undefined)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      !filter.year ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    All Years
                  </button>
                  {availableYears.map(year => (
                    <button
                      key={year}
                      onClick={() => handleYearChange(year)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        filter.year === year ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Filter by Language
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => handleLanguageChange(undefined)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      !filter.language ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    All Languages
                  </button>
                  {availableLanguages.map(language => (
                    <button
                      key={language}
                      onClick={() => handleLanguageChange(language)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        filter.language === language ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      {getLanguageName(language)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(filter.year || filter.language) && (
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Real-time updates</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'bn': 'Bengali',
    'ur': 'Urdu'
  };
  return languages[code] || code.toUpperCase();
}
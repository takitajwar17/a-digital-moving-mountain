'use client';

import { CommentFilter } from '@/types/comment';

interface FilterBarProps {
  filter: CommentFilter;
  onFilterChange: (filter: CommentFilter) => void;
  availableYears: number[];
  availableLanguages: string[];
  isTabletMode?: boolean;
  className?: string;
}

export default function FilterBar({
  filter,
  onFilterChange,
  availableYears,
  availableLanguages,
  isTabletMode = false,
  className = ''
}: FilterBarProps) {
  const handleYearChange = (year: number | undefined) => {
    onFilterChange({ ...filter, year });
  };

  const handleLanguageChange = (language: string | undefined) => {
    onFilterChange({ ...filter, language });
  };

  const clearFilters = () => {
    onFilterChange({ approved: true });
  };

  const buttonSize = isTabletMode ? 'px-4 py-3 text-base' : 'px-3 py-2 text-sm';
  const selectSize = isTabletMode ? 'px-4 py-3 text-base' : 'px-3 py-2 text-sm';

  return (
    <div className={`flex items-center gap-3 overflow-x-auto ${className}`}>
      {/* Year Filter */}
      <div className="flex items-center gap-2 min-w-fit">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Year:
        </label>
        <select
          value={filter.year || ''}
          onChange={(e) => handleYearChange(e.target.value ? parseInt(e.target.value) : undefined)}
          className={`border border-gray-300 rounded-md ${selectSize} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        >
          <option value="">All Years</option>
          {availableYears.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Language Filter */}
      <div className="flex items-center gap-2 min-w-fit">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Language:
        </label>
        <select
          value={filter.language || ''}
          onChange={(e) => handleLanguageChange(e.target.value || undefined)}
          className={`border border-gray-300 rounded-md ${selectSize} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        >
          <option value="">All Languages</option>
          {availableLanguages.map(language => (
            <option key={language} value={language}>
              {getLanguageName(language)}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {(filter.year || filter.language) && (
        <button
          onClick={clearFilters}
          className={`bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md ${buttonSize} transition-colors whitespace-nowrap`}
        >
          Clear Filters
        </button>
      )}

      {/* Active Filter Indicator */}
      <div className="flex items-center gap-2 ml-auto">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>
    </div>
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
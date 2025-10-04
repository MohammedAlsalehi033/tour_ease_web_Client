'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { container } from '@/app/lib/diContainer';
import { QuestionsController } from '@/app/(controller)/questions/questionsController';
import { Question } from '@/app/(model)/questions/questionsModel';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface SearchBarDebouncerProps {
  onSearchResults: (results: Question[]) => void;
  onSearchStateChange: (isSearching: boolean, query?: string) => void;
  placeholder?: string;
}

const SearchBarDebouncer: React.FC<SearchBarDebouncerProps> = ({ 
  onSearchResults, 
  onSearchStateChange,
  placeholder = "Search questions..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        onSearchResults([]);
        onSearchStateChange(false, '');
        return;
      }

      setIsLoading(true);
      onSearchStateChange(true, query);

      try {
        const questionsController = container.resolve(QuestionsController);
        const results = await questionsController.searchQuestions(query.trim());
        onSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        onSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [onSearchResults, onSearchStateChange]
  );

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      debouncedSearch(searchTerm);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const clearSearch = () => {
    setSearchTerm('');
    onSearchResults([]);
    onSearchStateChange(false, '');
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/60" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="input w-full pl-10 pr-10 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/30 bg-white dark:bg-dark-surface border border-primary/20 dark:border-dark-outline/40 text-text placeholder:text-text/60 transition-colors"
        />
        {(searchTerm || isLoading) && (
          <button
            onClick={clearSearch}
            disabled={isLoading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text/60 hover:text-text transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : (
              <FaTimes className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBarDebouncer;

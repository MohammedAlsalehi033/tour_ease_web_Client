'use client';

import React, { useState } from 'react';
import { Question } from '@/app/(model)/questions/questionsModel';
import SearchBarDebouncer from './searchBarDebouncer';
import SearchResults from './SearchResults';

interface QuestionsPageClientProps {
  children: React.ReactNode;
  questionsListComponent: React.ReactNode;
  onTagSelect?: (tag: string) => void;
  selectedTag?: string;
  tagSearchResults?: Question[];
  isLoadingTagSearch?: boolean;
}

const QuestionsPageClient: React.FC<QuestionsPageClientProps> = ({ 
  children, 
  questionsListComponent,
  onTagSelect,
  selectedTag,
  tagSearchResults,
  isLoadingTagSearch 
}) => {
  const [searchResults, setSearchResults] = useState<Question[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchResults = (results: Question[]) => {
    setSearchResults(results);
  };

  const handleSearchStateChange = (isSearching: boolean, query?: string) => {
    setIsSearching(isSearching);
    setSearchQuery(query || '');
  };

  return (
    <div>
      {/* Header section - pass down the tag selection handler */}
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { 
            onTagSelect,
            selectedTag 
          });
        }
        return child;
      })}
      
      {/* Search Bar */}
      <div className="mb-6">
        <SearchBarDebouncer
          onSearchResults={handleSearchResults}
          onSearchStateChange={handleSearchStateChange}
        />
      </div>

      {/* Content */}
      {selectedTag && !searchQuery ? (
        // Show tag search results
        isLoadingTagSearch ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading questions for #{selectedTag}...</p>
          </div>
        ) : tagSearchResults && tagSearchResults.length > 0 ? (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-primary">
                Questions tagged with #{selectedTag}
              </h2>
              <button
                onClick={() => onTagSelect?.('')}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                Clear filter
              </button>
            </div>
            <SearchResults 
              results={tagSearchResults}
              isSearching={false}
              searchQuery={selectedTag}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p>No questions found for #{selectedTag}</p>
            <button
              onClick={() => onTagSelect?.('')}
              className="mt-2 text-primary hover:underline"
            >
              Clear filter
            </button>
          </div>
        )
      ) : isSearching || searchQuery ? (
        <SearchResults 
          results={searchResults}
          isSearching={isSearching}
          searchQuery={searchQuery}
        />
      ) : (
        questionsListComponent
      )}
    </div>
  );
};

export default QuestionsPageClient;
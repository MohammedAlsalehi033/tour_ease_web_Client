'use client';

import React, { useState } from 'react';
import { Question } from '@/app/(model)/questions/questionsModel';
import SearchBarDebouncer from './searchBarDebouncer';
import SearchResults from './SearchResults';

interface QuestionsPageClientProps {
  children: React.ReactNode;
  questionsListComponent: React.ReactNode;
}

const QuestionsPageClient: React.FC<QuestionsPageClientProps> = ({ 
  children, 
  questionsListComponent 
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
      {/* Header section */}
      {children}
      
      {/* Search Bar */}
      <div className="mb-6">
        <SearchBarDebouncer
          onSearchResults={handleSearchResults}
          onSearchStateChange={handleSearchStateChange}
        />
      </div>

      {/* Content */}
      {isSearching || searchQuery ? (
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
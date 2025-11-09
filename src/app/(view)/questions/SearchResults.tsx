'use client';

import React from 'react';
import Link from 'next/link';
import { Question } from '@/app/(model)/questions/questionsModel';
import OtherAvatarPic from '../components/otherAvatarPic';

interface SearchResultsProps {
  results: Question[];
  isSearching: boolean;
  searchQuery?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, isSearching, searchQuery }) => {
  // Helper for relative time
  const timeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (!isSearching && !searchQuery) {
    return null;
  }

  if (isSearching && results.length === 0 && searchQuery) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-text mb-2">No questions found</h3>
        <p className="text-text/60">Try adjusting your search terms</p>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text">
          Search Results ({results.length})
        </h3>
        {searchQuery && (
          <span className="text-sm text-text/60">
            for "{searchQuery}"
          </span>
        )}
      </div>
      
      <div className="flex flex-col gap-6">
        {results.map((question) => (
          <Link 
            key={question.id} 
            href={`/questions/${question.id}`} 
            className="no-underline"
          >
            <div className="card group flex items-center gap-6 p-5 min-h-24 rounded-2xl shadow-lg border border-primary/10 dark:border-dark-outline/40 bg-white dark:bg-dark-surface transition-all duration-200 hover:scale-[1.02] hover:shadow-xl cursor-pointer">
              <div className="flex-shrink-0">
                <OtherAvatarPic
                  imageUrl={question.user.mediaUrls && question.user.mediaUrls[0]}
                  otherUserId={question.user.id}
                  userName={question.user.username}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="font-semibold text-lg text-primary group-hover:text-primary-dark dark:group-hover:text-primary-light transition-colors">
                    {question.user.username}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {timeAgo(question.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="block text-title-md font-bold text-dark-on-surface dark:text-light-on-surface mb-1">
                    {question.title}
                  </span>
                  {question.description && (
                    <span className="block text-body-md text-gray-700 dark:text-gray-300 line-clamp-2">
                      {question.description}
                    </span>
                  )}
                  {/* Tags */}
                  {Array.isArray(question.tags) && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {question.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center gap-2 px-2 min-w-[80px]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-600 font-bold bg-green-100 dark:bg-green-900/30 rounded-full px-2 py-1">▲ {question.upvotes ?? 0}</span>
                  <span className="text-xs text-red-600 font-bold bg-red-100 dark:bg-red-900/30 rounded-full px-2 py-1">▼ {question.downvotes ?? 0}</span>
                </div>
                <span className="text-xs text-primary font-semibold bg-primary/10 rounded-full px-2 py-1">{question._count?.comments ?? 0} comments</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
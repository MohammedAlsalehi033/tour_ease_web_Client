'use client';

import React, { useState, useEffect } from 'react';
import { Question } from '@/app/(model)/questions/questionsModel';
import QuestionsPageClient from './QuestionsPageClient';
import { container } from 'tsyringe';
import { QuestionsController } from '@/app/(controller)/questions/questionsController';

interface QuestionsPageWrapperProps {
  children: React.ReactNode;
  questionsListComponent: React.ReactNode;
  categories: Array<{ name: string; icon: React.ReactNode }>;
}

const QuestionsPageWrapper: React.FC<QuestionsPageWrapperProps> = ({
  children,
  questionsListComponent,
  categories
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [tagSearchResults, setTagSearchResults] = useState<Question[]>([]);
  const [isLoadingTagSearch, setIsLoadingTagSearch] = useState(false);

  useEffect(() => {
    if (selectedTag) {
      searchByTag(selectedTag);
    } else {
      setTagSearchResults([]);
    }
  }, [selectedTag]);

  const searchByTag = async (tag: string) => {
    setIsLoadingTagSearch(true);
    try {
      const questionsController = container.resolve(QuestionsController);
      const results = await questionsController.searchQuestionsByTag(tag);
      setTagSearchResults(results);
    } catch (error) {
      console.error('Error searching by tag:', error);
      setTagSearchResults([]);
    } finally {
      setIsLoadingTagSearch(false);
    }
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:flex lg:gap-8">
        {/* Main Content */}
        <main className="lg:w-2/3 flex-shrink-0">
          <QuestionsPageClient
            questionsListComponent={questionsListComponent}
            onTagSelect={handleTagSelect}
            selectedTag={selectedTag}
            tagSearchResults={tagSearchResults}
            isLoadingTagSearch={isLoadingTagSearch}
          >
            {children}
          </QuestionsPageClient>
        </main>

        {/* Categories Sidebar (Desktop) */}
        <aside className="hidden lg:block lg:w-1/3">
          <div className="sticky top-24">
            <div className="card border border-primary/20 dark:border-dark-outline/40 rounded-2xl bg-white dark:bg-dark-surface p-4">
              <h2 className="text-lg font-bold mb-4 text-primary">Categories</h2>
              <div className="flex flex-col gap-2">
                {categories.map((cat, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleTagSelect(cat.name)}
                    className={`card flex items-center text-title-md font-bold px-5 py-2 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer select-none border ${
                      selectedTag === cat.name
                        ? 'bg-primary/10 border-primary dark:border-primary text-primary'
                        : 'bg-white dark:bg-dark-surface border-primary/10 dark:border-dark-outline/40'
                    }`}
                  >
                    {cat.icon}
                    {cat.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Category Selector */}
        <div className="lg:hidden w-full mb-6">
          <div className="card border border-primary/20 dark:border-dark-outline/40 rounded-2xl bg-white dark:bg-dark-surface p-3">
            <h2 className="text-md font-bold mb-3 text-primary px-1">Categories</h2>
            <div className="overflow-x-auto">
              <div className="flex gap-3 px-1 pb-1 whitespace-nowrap scrollbar-thin scrollbar-thumb-primary/40 scrollbar-track-transparent">
                {categories.map((cat, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleTagSelect(cat.name)}
                    className={`card inline-flex items-center text-body-lg font-bold px-4 py-2 rounded-lg transition-transform duration-200 hover:scale-105 cursor-pointer select-none border ${
                      selectedTag === cat.name
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-white dark:bg-dark-surface border-primary/10 dark:border-dark-outline/40'
                    }`}
                  >
                    {cat.icon}
                    {cat.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionsPageWrapper;

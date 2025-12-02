"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { container } from '@/app/lib/diContainer';
import { TripPlannerController } from '@/app/(controller)/tripPlanner/tripPlannerController';
import ResultsDisplay from './components/ResultsDisplay';
import { RefinePlanChat } from './components/RefinePlanChat';
import SavedPlansListComponent from './components/SavedPlansList';
import { SearchForm } from './components/SearchForm';
import type {
  TripPlannerSearchParams,
  RecommendedPlan,
  TransportOption,
  AccommodationOption,
  SavedPlan
} from '@/app/(model)/tripPlanner/tripPlannerModel';

type ViewMode = 'search' | 'results' | 'savedPlans';

import {
  RoomSelectionMap,
  RoomCatalogEntry,
  SelectedRoomAllocation,
  toNumber,
  extractRoomId,
  getRoomCatalog,
  buildInitialRoomSelections,
  buildSelectedRoomAllocations
} from './tripPlannerHelpers';

// Main Component
export default function TripPlanner() {
  const [viewMode, setViewMode] = useState<ViewMode>('search');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchParams, setSearchParams] = useState<TripPlannerSearchParams | null>(null);
  const [loading, setLoading] = useState(false);
  const tripPlannerController = container.resolve(TripPlannerController);

  const handleSearch = async (params: TripPlannerSearchParams) => {
    setLoading(true);
    try {
      const results = await tripPlannerController.generateTripPlans(params);
      setSearchResults(results);
      setSearchParams(params);
      setViewMode('results');
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search for trips: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setViewMode('search');
    setSearchResults(null);
    setSearchParams(null);
  };

  return (
    <div className="min-h-screen  py-8 px-4 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2  ">Smart Trip Planner</h1>
          <p className="text-sm  ">Plan your perfect trip with AI-powered recommendations</p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="p-1.5 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 inline-flex relative">
            <button
              onClick={() => setViewMode('search')}
              className={`
                relative px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2.5
                ${(viewMode === 'search' || viewMode === 'results')
                  ? 'text-primary shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
              `}
              style={
                (viewMode === 'search' || viewMode === 'results')
                  ? { background: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--secondary)) 100%)' }
                  : {}
              }
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Plan a Trip
            </button>

            <button
              onClick={() => setViewMode('savedPlans')}
              className={`
                relative px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2.5
                ${viewMode === 'savedPlans'
                  ? 'text-primary shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
              `}
              style={
                viewMode === 'savedPlans'
                  ? { background: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--secondary)) 100%)' }
                  : {}
              }
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Saved Plans
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="text-lg">Searching for the best options...</div>
          </div>
        )}

        {!loading && viewMode === 'search' && <SearchForm onSearch={handleSearch} />}
        {!loading && viewMode === 'results' && searchResults && searchParams && (
          <ResultsDisplay
            results={searchResults}
            onBack={handleBackToSearch}
            originalRequest={searchParams}
          />
        )}
  {!loading && viewMode === 'savedPlans' && <SavedPlansListComponent />}
      </div>
    </div>
  );
}
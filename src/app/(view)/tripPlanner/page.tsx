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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Smart Trip Planner</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Plan your perfect trip with AI-powered recommendations</p>
        </div>

        <div className="flex gap-4 mb-6 justify-center">
          <button onClick={() => setViewMode('search')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${viewMode === 'search'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}>
            New Search
          </button>
          <button onClick={() => setViewMode('savedPlans')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${viewMode === 'savedPlans'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}>
            My Saved Plans
          </button>
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
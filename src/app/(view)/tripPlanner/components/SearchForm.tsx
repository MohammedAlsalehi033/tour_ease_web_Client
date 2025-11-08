"use client";
import React, { useState } from 'react';
import type { TripPlannerSearchParams } from '@/app/(model)/tripPlanner/tripPlannerModel';

export const SearchForm = ({ onSearch }: { onSearch: (params: TripPlannerSearchParams) => void }) => {
  const [form, setForm] = useState({
    startLocation: 'islamabad',
    endLocation: 'Lahor',
    startTime: '2025-11-06T08:40',
    endTime: '2025-11-13T08:41',
    budget: 500000,
    numberOfTravelers: 2,
    interests: [] as string[],
    needsReturnTransport: true,
    useAIOptimization: false
  });

  const interestOptions = ['beaches', 'museums', 'food', 'adventure', 'shopping', 'nightlife'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const toggleInterest = (interest: string) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      ...form,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString()
    } as TripPlannerSearchParams);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Plan Your Trip</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">From</label>
          <input type="text" name="startLocation" value={form.startLocation} onChange={handleChange}
            placeholder="Cairo" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">To</label>
          <input type="text" name="endLocation" value={form.endLocation} onChange={handleChange}
            placeholder="Alexandria" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Start Date</label>
          <input type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">End Date</label>
          <input type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Travelers</label>
          <input type="number" name="numberOfTravelers" value={form.numberOfTravelers} onChange={handleChange}
            min="1" max="20" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Budget (PKR)</label>
          <input type="number" name="budget" value={form.budget} onChange={handleChange}
            min="100" step="100" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" required />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Interests</label>
        <div className="flex flex-wrap gap-2">
          {interestOptions.map(interest => (
            <button key={interest} type="button" onClick={() => toggleInterest(interest)}
              className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${form.interests.includes(interest)
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}>
              {interest}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="needsReturnTransport" checked={form.needsReturnTransport}
            onChange={handleChange} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Need return transportation</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="useAIOptimization" checked={form.useAIOptimization}
            onChange={handleChange} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Use AI Optimization</span>
        </label>
      </div>

      <button type="submit" className="w-full mt-6 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
        Search Trips
      </button>
    </form>
  );
};

export default SearchForm;

"use client";
import React, { useState, useEffect } from 'react';
import type { TripPlannerSearchParams } from '@/app/(model)/tripPlanner/tripPlannerModel';
import { MapPin, Calendar, Users, DollarSign } from 'lucide-react';
import StartLocationWizard from './StartLocationWizard';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
}

export const SearchForm = ({ onSearch }: { onSearch: (params: TripPlannerSearchParams) => void }) => {
  const [showLocationWizard, setShowLocationWizard] = useState(false);
  const [startLocationData, setStartLocationData] = useState<LocationData | null>(null);
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eightAM = new Date(today.getTime() + 8 * 60 * 60 * 1000);
  const initialStartTime = now > eightAM ? now.toISOString().slice(0, 16) : eightAM.toISOString().slice(0, 16);
  const initialEndTime = new Date(new Date(initialStartTime).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  
  const [minStartTime, setMinStartTime] = useState(now.toISOString().slice(0, 16));
  const [minEndTime, setMinEndTime] = useState(initialEndTime);
  
  const [form, setForm] = useState({
    startLocation: 'islamabad',
    endLocation: 'Lahor',
    startTime: initialStartTime,
    endTime: initialEndTime,
    budget: 500000,
    numberOfTravelers: 2,
    interests: [] as string[],
    needsReturnTransport: true
  });

  const interestOptions = [
    'Beaches',
    'Museums', 
    'Food',
    'Adventure',
    'Shopping',
    'Nightlife'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => {
      const newForm = {
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
      };
      
      if (name === 'startTime') {
        const startDate = new Date(value);
        const newMinEnd = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
        setMinEndTime(newMinEnd);
        
        // If current endTime is before new min, update it
        if (prev.endTime < newMinEnd) {
          newForm.endTime = newMinEnd;
        }
      }
      
      return newForm;
    });
  };

  const toggleInterest = (interest: string) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest.toLowerCase())
        ? prev.interests.filter(i => i !== interest.toLowerCase())
        : [...prev.interests, interest.toLowerCase()]
    }));
  };

  const handleLocationSelect = (location: LocationData) => {
    setStartLocationData(location);
    setForm(prev => ({
      ...prev,
      startLocation: location.address
    }));
    setShowLocationWizard(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const searchParams: TripPlannerSearchParams = {
      ...form,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
    };

    // Add detailedStartLocation if available from wizard
    if (startLocationData) {
      searchParams.detailedStartLocation = {
        lat: startLocationData.lat,
        lng: startLocationData.lng
      };
    }

    onSearch(searchParams);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full card hover:shadow-float transition-all duration-500 animate-fade-in-up border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-display-md font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Plan Your Perfect Trip
        </h2>
        <p className="text-body-lg text-gray-600 dark:text-gray-400">
          Let us help you create an unforgettable journey
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Location Section */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-label-lg font-medium" style={{ color: 'rgb(var(--text))' }}>
            <MapPin className="w-4 h-4" style={{ color: 'rgb(var(--primary))' }} />
            Starting City
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              name="startLocation" 
              value={form.startLocation} 
              onChange={handleChange}
              placeholder="Islamabad or Lahore" 
              className="input flex-1 hover:shadow-md transition-all duration-200" 
              required 
            />
            <button
              type="button"
              onClick={() => setShowLocationWizard(true)}
              className="btn btn-outlined flex items-center gap-2 whitespace-nowrap"
              title="Open location wizard"
            >
              <MapPin className="w-4 h-4" />
              Map
            </button>
          </div>
          {startLocationData && (
            <p className="text-xs text-[rgb(var(--success))] flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[rgb(var(--success))]"></span>
              City selected via map
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-label-lg font-medium" style={{ color: 'rgb(var(--text))' }}>
            <MapPin className="w-4 h-4" style={{ color: 'rgb(var(--secondary))' }} />
            Destination City
          </label>
          <input 
            type="text" 
            name="endLocation" 
            value={form.endLocation} 
            onChange={handleChange}
            placeholder="Islamabad or Lahore" 
            className="input w-full hover:shadow-md transition-all duration-200" 
            required 
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-label-lg font-medium" style={{ color: 'rgb(var(--text))' }}>
            <Users className="w-4 h-4" style={{ color: 'rgb(var(--primary))' }} />
            Travelers
          </label>
          <input 
            type="number" 
            name="numberOfTravelers" 
            value={form.numberOfTravelers} 
            onChange={handleChange}
            min="1" 
            max="20" 
            className="input w-full hover:shadow-md transition-all duration-200" 
            required 
          />
        </div>
      </div>

      {/* Date & Budget Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-label-lg font-medium" style={{ color: 'rgb(var(--text))' }}>
            <Calendar className="w-4 h-4" style={{ color: 'rgb(var(--success))' }} />
            Start Date & Time
          </label>
          <input 
            type="datetime-local" 
            name="startTime" 
            value={form.startTime} 
            onChange={handleChange}
            min={minStartTime}
            className="input w-full hover:shadow-md transition-all duration-200" 
            required 
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-label-lg font-medium" style={{ color: 'rgb(var(--text))' }}>
            <Calendar className="w-4 h-4" style={{ color: 'rgb(var(--info))' }} />
            End Date & Time
          </label>
          <input 
            type="datetime-local" 
            name="endTime" 
            value={form.endTime} 
            onChange={handleChange}
            min={minEndTime}
            className="input w-full hover:shadow-md transition-all duration-200" 
            required 
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-label-lg font-medium" style={{ color: 'rgb(var(--text))' }}>
            <DollarSign className="w-4 h-4" style={{ color: 'rgb(var(--success))' }} />
            Budget (PKR)
          </label>
          <input 
            type="number" 
            name="budget" 
            value={form.budget} 
            onChange={handleChange}
            min="100" 
            step="1000" 
            placeholder="50,000"
            className="input w-full hover:shadow-md transition-all duration-200" 
            required 
          />
        </div>
      </div>

      {/* Interests Section */}
      <div className="mb-8 space-y-4">
        <label className="block text-label-lg font-semibold" style={{ color: 'rgb(var(--text))' }}>
          Select Your Interests
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {interestOptions.map((interest) => (
            <button 
              key={interest} 
              type="button" 
              onClick={() => toggleInterest(interest)}
              className={`
                relative px-4 py-3 rounded-button text-body-md font-medium
                transition-all duration-300 hover:shadow-lg
                ${form.interests.includes(interest.toLowerCase())
                  ? 'text-white shadow-md scale-[1.02]'
                  : 'border-2 hover:scale-[1.02]'
                }
              `}
              style={
                form.interests.includes(interest.toLowerCase())
                  ? { 
                      background: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--secondary)) 100%)',
                    }
                  : { 
                      borderColor: 'rgba(var(--primary), 0.2)',
                      backgroundColor: 'rgba(var(--surface), 0.8)',
                      color: 'rgb(var(--text))'
                    }
              }
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Options Section */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <label className="flex items-center gap-4 cursor-pointer group p-4 rounded-button border-2 transition-all duration-200 hover:shadow-md" 
          style={{ 
            borderColor: form.needsReturnTransport ? 'rgb(var(--primary))' : 'rgba(var(--primary), 0.2)',
            backgroundColor: form.needsReturnTransport ? 'rgba(var(--primary), 0.05)' : 'transparent'
          }}>
          <input 
            type="checkbox" 
            name="needsReturnTransport" 
            checked={form.needsReturnTransport}
            onChange={handleChange} 
            className="w-5 h-5 rounded cursor-pointer transition-all duration-200"
            style={{ accentColor: 'rgb(var(--primary))' }}
          />
          <div className="flex-1">
            <span className="text-body-lg font-semibold block mb-1" style={{ color: 'rgb(var(--text))' }}>
              Return Transportation
            </span>
            <p className="text-body-sm" style={{ color: 'rgba(var(--text), 0.6)' }}>
              Include round-trip in your plan
            </p>
          </div>
        </label>
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        className="btn-primary w-full py-4 text-title-lg font-bold group relative overflow-hidden shadow-lg hover:shadow-xl"
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          Search Available Trips
          <svg 
            className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </button>

      {/* Location Wizard Modal */}
      {showLocationWizard && (
        <StartLocationWizard
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowLocationWizard(false)}
          initialLocation={startLocationData}
        />
      )}
    </form>
  );
};

export default SearchForm;

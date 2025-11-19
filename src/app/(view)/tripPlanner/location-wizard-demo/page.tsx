"use client";
import React, { useState } from 'react';
import StartLocationWizard from '../components/StartLocationWizard';
import { MapPin, CheckCircle } from 'lucide-react';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
}

export default function LocationWizardDemo() {
  const [showWizard, setShowWizard] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    setShowWizard(false);
    console.log('Location selected:', location);
  };

  const handleReset = () => {
    setSelectedLocation(null);
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[rgb(var(--text))] mb-4">
            Starting Location Wizard Demo
          </h1>
          <p className="text-lg text-[rgb(var(--text-secondary))]">
            Click the button below to open the location selection wizard
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-[rgb(var(--surface))] rounded-xl shadow-lg p-8">
          {/* Current Selection Display */}
          {selectedLocation ? (
            <div className="mb-6">
              <div className="p-6 bg-[rgba(var(--success),0.1)] rounded-lg border border-[rgba(var(--success),0.3)]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[rgb(var(--success))] flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[rgb(var(--success))] mb-2">
                      Location Selected
                    </h3>
                    <div className="space-y-1 text-sm text-[rgb(var(--text))]">
                      <p><strong>Address:</strong> {selectedLocation.address}</p>
                      <p><strong>Latitude:</strong> {selectedLocation.lat.toFixed(6)}</p>
                      <p><strong>Longitude:</strong> {selectedLocation.lng.toFixed(6)}</p>
                      {selectedLocation.placeId && (
                        <p><strong>Place ID:</strong> {selectedLocation.placeId}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="p-6 bg-[rgba(var(--info),0.1)] rounded-lg border border-[rgba(var(--info),0.3)]">
                <p className="text-[rgb(var(--text))] text-center">
                  No location selected yet. Click the button below to start.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowWizard(true)}
              className="btn btn-primary flex items-center gap-2 px-8 py-3"
            >
              <MapPin size={20} />
              {selectedLocation ? 'Change Location' : 'Select Location'}
            </button>

            {selectedLocation && (
              <button
                onClick={handleReset}
                className="btn flex items-center gap-2 px-8 py-3"
              >
                Reset
              </button>
            )}
          </div>

          {/* Code Example */}
          <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h3 className="text-sm font-semibold text-[rgb(var(--text))] mb-3">
              Integration Code:
            </h3>
            <pre className="text-xs text-[rgb(var(--text-secondary))] overflow-x-auto">
{`import StartLocationWizard from './StartLocationWizard';

const [showWizard, setShowWizard] = useState(false);
const [location, setLocation] = useState(null);

const handleLocationSelect = (locationData) => {
  setLocation(locationData);
  setShowWizard(false);
};

// In your JSX:
{showWizard && (
  <StartLocationWizard
    onLocationSelect={handleLocationSelect}
    onClose={() => setShowWizard(false)}
    initialLocation={location}
  />
)}`}
            </pre>
          </div>

          {/* Features List */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-[rgb(var(--text))] mb-4">
              Features:
            </h3>
            <ul className="space-y-2 text-sm text-[rgb(var(--text-secondary))]">
              <li className="flex items-start gap-2">
                <span className="text-[rgb(var(--success))] mt-1">✓</span>
                <span>Search locations using Google Places autocomplete</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[rgb(var(--success))] mt-1">✓</span>
                <span>Click directly on the map to select a location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[rgb(var(--success))] mt-1">✓</span>
                <span>Use GPS to get current location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[rgb(var(--success))] mt-1">✓</span>
                <span>Pakistan-only location validation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[rgb(var(--success))] mt-1">✓</span>
                <span>Visual markers and feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[rgb(var(--success))] mt-1">✓</span>
                <span>Responsive modal design</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Location Wizard Modal */}
      {showWizard && (
        <StartLocationWizard
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowWizard(false)}
          initialLocation={selectedLocation}
        />
      )}
    </div>
  );
}

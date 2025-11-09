"use client";
import React from 'react';
import Image from 'next/image';
import {
  TransportOption,
  AccommodationOption,
} from '@/app/(model)/tripPlanner/tripPlannerModel';
import { SelectedRoomAllocation } from '../tripPlannerHelpers';

interface BookingSummaryProps {
  outboundTransport: TransportOption | null;
  returnTransport: TransportOption | null;
  accommodation: AccommodationOption | null;
  selectedRooms: SelectedRoomAllocation[];
  totalCost: number;
  onConfirm: () => void;
  onCancel: () => void;
  nightsCount: number;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  outboundTransport,
  returnTransport,
  accommodation,
  selectedRooms,
  totalCost,
  onConfirm,
  onCancel,
  nightsCount,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onCancel} 
            className="btn-outlined flex items-center gap-2"
          >
            <span>←</span> Back to Results
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary">Booking Summary</h1>
          <div className="w-32"></div> {/* Spacer for alignment */}
        </div>

        <div className="space-y-6">
          {/* Disclaimer & Important Notes */}
          <div className="card bg-warning/10 border-l-4 border-warning">
            <h4 className="font-bold text-lg mb-3">⚠️ Important: This is an Offer, Not a Final Booking</h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>By confirming, our agents will send offers to transportation and accommodation providers on your behalf.</li>
              <li>You may need to negotiate further with providers to finalize details and prices.</li>
              <li>Activity prices are estimates and may vary.</li>
              <li>You can track your ride offers in the <strong className="font-semibold">Ride Sharing</strong> tab and accommodation offers in the <strong className="font-semibold">Accommodations</strong> tab.</li>
            </ul>
          </div>

          {/* Ride Details */}
          {outboundTransport && (
            <div className="card">
              <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                🚗 Transportation Details
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-surface/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-lg text-primary">Outbound Ride</h4>
                    <span className="text-2xl font-bold text-primary">PKR {outboundTransport.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="opacity-70">Provider</p>
                      <p className="font-medium">{outboundTransport.providerName}</p>
                    </div>
                    <div>
                      <p className="opacity-70">Vehicle Type</p>
                      <p className="font-medium">{outboundTransport.vehicleType}</p>
                    </div>
                    <div>
                      <p className="opacity-70">Rating</p>
                      <p className="font-medium">⭐ {outboundTransport.avgRating}</p>
                    </div>
                    <div>
                      <p className="opacity-70">Seats Available</p>
                      <p className="font-medium">🪑 {outboundTransport.seatsAvailable} seats</p>
                    </div>
                  </div>
                </div>
                {returnTransport && (
                  <div className="p-4 bg-surface/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg text-primary">Return Ride</h4>
                      <span className="text-2xl font-bold text-primary">PKR {returnTransport.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="opacity-70">Provider</p>
                        <p className="font-medium">{returnTransport.providerName}</p>
                      </div>
                      <div>
                        <p className="opacity-70">Vehicle Type</p>
                        <p className="font-medium">{returnTransport.vehicleType}</p>
                      </div>
                      <div>
                        <p className="opacity-70">Rating</p>
                        <p className="font-medium">⭐ {returnTransport.avgRating}</p>
                      </div>
                      <div>
                        <p className="opacity-70">Seats Available</p>
                        <p className="font-medium">🪑 {returnTransport.seatsAvailable} seats</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accommodation Details */}
          {accommodation && (
            <div>
              <h3 className="text-xl font-semibold mb-3 border-b pb-2">🏨 Accommodation Details</h3>
              <div className="card-sm flex gap-4">
                {accommodation.images?.[0] && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={accommodation.images[0]} alt={accommodation.name} layout="fill" objectFit="cover" />
                  </div>
                )}
                <div className="flex-grow">
                  <h4 className="font-bold">{accommodation.name}</h4>
                  <p className="text-sm opacity-80">📍 {accommodation.location}</p>
                  <p className="text-sm opacity-80">⭐ {accommodation.avgRating} ({nightsCount} nights)</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-semibold">Selected Rooms:</p>
                    {selectedRooms.length > 0 ? (
                      <ul className="list-disc list-inside text-sm">
                        {selectedRooms.map(room => (
                          <li key={room.roomId}>{room.roomType} - PKR {room.totalCost > 0 ? room.totalCost.toLocaleString() : (room.pricePerNight * nightsCount).toLocaleString()}</li>
                        ))}
                      </ul>
                    ) : <p className="text-sm opacity-70">Default rooming will be requested.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Total Cost */}
          <div className="card bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg opacity-80 mb-1">Estimated Total Cost</p>
                <p className="text-sm opacity-60">This is an estimate. Final prices may vary.</p>
              </div>
              <p className="text-5xl font-extrabold text-primary">
                PKR {totalCost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-primary/10 p-6 mt-8 -mx-4 sm:-mx-8">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4">
            <button onClick={onCancel} className="btn-outlined flex-1 py-4 text-lg">
              Cancel
            </button>
            <button onClick={onConfirm} className="btn-primary flex-1 py-4 text-lg">
              ✅ Confirm & Send Offers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

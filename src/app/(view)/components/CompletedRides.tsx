"use client";
import React, { useEffect, useState } from 'react';
import { BookingController } from '@/app/(controller)/rideSharing/bookingController';
import { container } from '@/app/lib/diContainer';
import ReviewSubmissionModal from './ReviewSubmissionModal';
import { Booking } from '@/app/(model)/rideSharing/booking/bookingModel';
import { useSession } from 'next-auth/react';

const CompletedRides: React.FC = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [completedRides, setCompletedRides] = useState<Booking[]>([]);
  const [selectedRide, setSelectedRide] = useState<Booking | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    async function fetchCompletedRides() {
      if (!userId) return;
      const bookingController = container.resolve(BookingController);
      const response = await bookingController.getBookingsForTraveler(userId);
      console.log(response);
      if (response.success && response.data) {
        setCompletedRides(response.data.filter((b: Booking) => b.status === 'complete' || b.status === 'completed'));
      }
    }
    fetchCompletedRides();
  }, [userId]);

  const handleRate = (ride: Booking) => {
    setSelectedRide(ride);
    setShowReviewModal(true);
  };

  const handleReviewSubmit = () => {
    setShowReviewModal(false);
    setSelectedRide(null);
  };

  return (
    <div className="card shadow-lg rounded-lg p-6 mb-8 dark:border-dark-outline border border-light-outline">
      <h2 className="font-display text-headline-md font-bold mb-4">Completed Rides</h2>
      {completedRides.length === 0 ? (
        <p className="text-body-md">No completed rides found.</p>
      ) : (
        <ul className="space-y-4">
          {completedRides.map((ride) => (
            <li key={ride.id} className="flex items-center justify-between bg-light-surface dark:bg-dark-surface rounded-lg p-4">
              <div>
                <div className="font-semibold">{ride.listing ? `${ride.listing.startLocationText} → ${ride.listing.endLocationText}` : ride.request ? `${ride.request.startLocationText} → ${ride.request.endLocationText}` : 'Trip'}</div>
                <div className="text-sm text-gray-500">{ride.departureTime ? new Date(ride.departureTime).toLocaleString() : ''}</div>
              </div>
              <button onClick={() => handleRate(ride)} className="btn-primary px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors">Rate your trip</button>
            </li>
          ))}
        </ul>
      )}
      {selectedRide && (
        <ReviewSubmissionModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleReviewSubmit}
          reviewableType="TRANSPORTATION_BOOKING"
          reviewableId={parseInt(selectedRide.id.toString())}
          title={selectedRide.listing ? `${selectedRide.listing.startLocationText} → ${selectedRide.listing.endLocationText}` : selectedRide.request ? `${selectedRide.request.startLocationText} → ${selectedRide.request.endLocationText}` : 'Trip'}
        />
      )}
    </div>
  );
};

export default CompletedRides;

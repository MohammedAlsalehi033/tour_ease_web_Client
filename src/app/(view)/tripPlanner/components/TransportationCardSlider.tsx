"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { RideListing } from '@/app/(model)/rideSharing/RideListting/rideListtingModel';

import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClock, FaChair, FaCar, FaUserCircle, FaRoute, FaMoneyBill, FaCheck, FaTimes, FaArrowAltCircleRight, FaArrowAltCircleLeft } from 'react-icons/fa';
import RatingDisplay from '../../components/RatingDisplay';
import { useReviewStats } from '../../components/useReviewStats';
import DriverReviewsCompact from '../../components/DriverReviewsCompact';


interface RideCardProps {
    ride: RideListing;
    isSelected: boolean;
    onCardClick: () => void;
}

const RideCard: React.FC<RideCardProps> = ({ ride, isSelected, onCardClick }) => {
    const imageUrl = ride.mediaUrls?.[0] || ride.provider.vehicleMediaUrls?.[0] || 'https://placehold.co/600x400';
    const { stats } = useReviewStats('TRANSPORTATION_LISTING', ride.id);

    return (
        <motion.div
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            onClick={onCardClick}

            className={`card relative flex-shrink-0 w-full md:w-[48%] lg:w-[32%] cursor-pointer overflow-hidden p-0 m-0 ${
                isSelected ? 'ring-2 ring-offset-2 ring-[rgb(var(--background))]' : 'ring-0'
            }`}
        >
            <img src={imageUrl} alt={`Ride from ${ride.startLocationText}`} className="w-full h-40 object-cover" />
            <div className="p-4">
                {/* REFACTORED: Using <h3> which is styled in the base layer. */}
                <h3 className="mb-2 line-clamp-1">
                    {ride.startLocationText} to {ride.endLocationText}
                </h3>
                <div className="flex items-center text-sm text-[rgba(var(--text),0.8)]">
                    {/* REFACTORED: Icon color uses the primary theme color. */}
                    <FaClock className="mr-2 text-[rgb(var(--primary))]" />
                    <span>{new Date(ride.departureTime).toLocaleString()}</span>
                </div>
                <div className="mt-3 flex justify-between items-center">
                    {/* REFACTORED: Price color uses the primary theme color. */}
                    <p className="text-xl font-bold text-[rgb(var(--primary))]">
                        PKR {parseFloat(ride.pricePerSeat).toFixed(2)}
                        <span className="text-sm font-normal text-[rgba(var(--text),0.6)]"> / seat</span>
                    </p>
                    {/* REFACTORED: This "badge" now uses theme colors for its background and text. */}
                    <div className="flex items-center px-3 py-1 bg-[rgba(var(--primary),0.1)] dark:bg-[rgba(var(--primary),0.2)] rounded-full">
                        <FaChair className="mr-2 text-[rgb(var(--primary))]" />
                        <span className="text-sm font-semibold text-[rgb(var(--primary))]">
                            {ride.seatsAvailable} available
                        </span>
                    </div>
                </div>
                {/* Rating Display */}
                {stats && stats.totalReviews > 0 && (
                    <div className="mt-2 flex items-center justify-between">
                        <RatingDisplay 
                            rating={stats.averageRating} 
                            size="sm" 
                            showNumber={true}
                        />
                        <span className="text-xs text-[rgba(var(--text),0.6)]">
                            ({stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''})
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};


interface ExpandedRideDetailsProps {
    ride: RideListing;
}

const ExpandedRideDetails: React.FC<ExpandedRideDetailsProps> = ({ ride }) => {
    const { stats } = useReviewStats('TRANSPORTATION_LISTING', ride.id);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            // REFACTORED: Uses .card class, overrides margin/padding, and adds a themed border.
            className="card m-0 p-6 border border-[rgba(var(--text),0.1)]"
        >
            {/* REFACTORED: Using <h3> to inherit styles from the base theme layer. */}
            <h3 className="mb-4">Ride Details</h3>
            {/* REFACTORED: Text and icon colors now use themed variables for consistency. */}
            <ul className="space-y-3 text-sm text-[rgba(var(--text),0.9)]">
                <li className="flex items-center"><FaRoute className="mr-4 text-lg text-[rgba(var(--text),0.6)] w-5" /> <span className="font-semibold w-24">Distance:</span> {ride.distance_km.toFixed(1)} km</li>
                <li className="flex items-center"><FaCar className="mr-4 text-lg text-[rgba(var(--text),0.6)] w-5" /> <span className="font-semibold w-24">Vehicle:</span> {ride.provider.vehicleType}</li>
                <li className="flex items-center"><FaUserCircle className="mr-4 text-lg text-[rgba(var(--text),0.6)] w-5" /> <span className="font-semibold w-24">Provider:</span> {ride.provider.user.name}</li>
                {stats && stats.totalReviews > 0 && (
                    <li className="flex items-center">
                        <RatingDisplay 
                            rating={stats.averageRating} 
                            size="sm" 
                            showNumber={true}
                            className="ml-4"
                        />
                        <span className="text-sm text-[rgba(var(--text),0.6)] ml-2">
                            ({stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''})
                        </span>
                    </li>
                )}
                <li className="flex items-center"><FaClock className="mr-4 text-lg text-[rgba(var(--text),0.6)] w-5" /> <span className="font-semibold w-24">Departure:</span> {new Date(ride.departureTime).toLocaleString()}</li>
                <li className="flex items-center"><FaChair className="mr-4 text-lg text-[rgba(var(--text),0.6)] w-5" /> <span className="font-semibold w-24">Seats Available:</span> {ride.seatsAvailable}</li>
                <li className="flex items-center"><FaMoneyBill className="mr-4 text-lg text-[rgba(var(--text),0.6)] w-5" /> <span className="font-semibold w-24">Price per Seat:</span> PKR {parseFloat(ride.pricePerSeat)}</li>
                <li className="flex items-center"><FaCheck className="mr-4 text-lg text-[rgba(var(--text),0.6)] w-5" /> <span className="font-semibold w-24">Status:</span> {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}</li>
                <li className="flex items-center"><FaTimes className="mr-4 text-lg text-[rgba(var(--text),0.6)] w-5" /> <span className="font-semibold w-24">Created At:</span> {new Date(ride.createdAt).toLocaleDateString()}</li>
                <li className="flex items-center"><FaArrowAltCircleRight className="mr-4 text-lg text-[rgba(var(--text),0.6)] w-5" /> <span className="font-semibold w-24">from:</span> from {ride.startLocationText}</li>
                <li className="flex items-center"><FaArrowAltCircleLeft className="mr-4 text-lg text-[rgba(var(--text),0.6)] w-5" /> <span className="font-semibold w-24">to:</span> to {ride.endLocationText}</li>
            </ul>
            
            {/* Driver Reviews Section */}
            <div className="mt-6 pt-4 border-t border-[rgba(var(--text),0.1)]">
                <h4 className="text-body-md font-semibold text-[rgba(var(--text),0.9)] mb-3">Driver Reviews</h4>
                <DriverReviewsCompact 
                    driverId={ride.providerId}
                    driverName={ride.provider.user.name}
                    showStats={false}
                    maxReviews={2}
                />
            </div>
            
            {/* REFACTORED: Replaced many utility classes with .btn and .btn-primary. */}
            <button
                onClick={(e) => { e.stopPropagation(); alert(`Booking ride ${ride.id}`); }}
                className="btn btn-primary font-bold w-full mt-6"
            >
                Book Now
            </button>
        </motion.div>
    )
}



const TransportationCardSlider = ({ rideListings }: { rideListings: RideListing[] }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        containScroll: 'trimSnaps',
        dragFree: true,
    });

    const [selectedRideIndex, setSelectedRideIndex] = useState<number | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
            emblaApi.off('reInit', onSelect);
        };
    }, [emblaApi, onSelect]);

    const handleCardClick = useCallback((index: number) => {
        setSelectedRideIndex(currentIndex => (currentIndex === index ? null : index));
        if (emblaApi) {
            if (!emblaApi.slidesInView().includes(index)) {
                emblaApi.scrollTo(index);
            }
        }
    }, [emblaApi]);

    const selectedRide = selectedRideIndex !== null ? rideListings[selectedRideIndex] : null;

    if (!rideListings || rideListings.length === 0) {
        // REFACTORED: Uses themed text color.
        return <p className="text-center text-[rgba(var(--text),0.6)]">No available rides found.</p>
    }

    return (
        <div className={`md:flex ${selectedRide ? 'md:space-x-8' : ''} `}>
            <div className="flex-grow md:w-3/5 lg:w-2/3">
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex space-x-4 p-1">
                        {rideListings.map((ride, index) => (
                            <RideCard
                                key={ride.id}
                                ride={ride}
                                isSelected={selectedRideIndex === index}
                                onCardClick={() => handleCardClick(index)}
                            />
                        ))}
                    </div>
                </div>
                <div className="text-center mt-4 text-sm text-[rgba(var(--text),0.7)]">
                    Slide to view more ({selectedIndex + 1} / {scrollSnaps.length})
                </div>
            </div>

            <AnimatePresence>
                {selectedRide && (
                    <div className="md:w-2/5 lg:w-1/3 mt-6 md:mt-0">
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 40 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ExpandedRideDetails ride={selectedRide} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TransportationCardSlider;
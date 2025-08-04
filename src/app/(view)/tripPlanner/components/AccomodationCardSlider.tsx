"use client";

import React, { useState, useCallback, useEffect } from 'react';
// Data models
import { RideListing } from '@/app/(model)/rideSharing/RideListting/rideListtingModel'; // This can be removed if the file only contains accommodation logic

import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';
// Updated icons for accommodation
import { FaClock, FaUserCircle, FaDollarSign, FaCheck, FaTimes, FaMapMarkerAlt, FaBed, FaCalendarAlt } from 'react-icons/fa';


// --- Accommodation Card Component ---
interface AccommodationCardProps {
    accommodation: AccommodationListing;
    isSelected: boolean;
    onCardClick: () => void;
}

const AccommodationCard: React.FC<AccommodationCardProps> = ({ accommodation, isSelected, onCardClick }) => {
    const imageUrl = accommodation.mediaUrls?.[0] || 'https://placehold.co/600x400';

    return (
        <motion.div
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            onClick={onCardClick}
            className={`card relative flex-shrink-0 w-full md:w-[48%] lg:w-[32%] cursor-pointer overflow-hidden p-0 m-0 ${
                isSelected ? 'ring-2 ring-offset-2 ring-[rgb(var(--background))] ring-[rgb(var(--primary))]' : 'ring-0'
            }`}
        >
            <img src={imageUrl} alt={`Accommodation in ${accommodation.location}`} className="w-full h-40 object-cover" />
            <div className="p-4">
                <h3 className="mb-2 line-clamp-1">
                    {accommodation.location}
                </h3>
                <div className="flex items-center text-sm text-[rgba(var(--text),0.8)]">
                    <FaCalendarAlt className="mr-2 text-[rgb(var(--primary))]" />
                    <span>Available from {new Date(accommodation.availableFrom).toLocaleDateString()}</span>
                </div>
                <div className="mt-3 flex justify-between items-center">
                    <p className="text-xl font-bold text-[rgb(var(--primary))]">
                        ${parseFloat(accommodation.pricePerNight).toFixed(2)}
                        <span className="text-sm font-normal text-[rgba(var(--text),0.6)]"> / night</span>
                    </p>
                    <div className="flex items-center px-3 py-1 bg-[rgba(var(--primary),0.1)] dark:bg-[rgba(var(--primary),0.2)] rounded-full">
                        <FaBed className="mr-2 text-[rgb(var(--primary))]" />
                        <span className="text-sm font-semibold text-[rgb(var(--primary))]">
                           Bookable
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


export interface AccommodationListing {
    id: number;
    providerId: string;
    location: string;
    availableFrom: string;
    availableTo: string;
    pricePerNight: string;
    mediaUrls: string[];
    createdAt: string;
    provider: {
        user: {
            name: string;
        };
        accountStatus: 'active' | 'blocked' | 'pending';
    };
    status: 'active' | 'pending' | 'completed' | 'cancelled';
    distance_km: number;
}

// --- Expanded Accommodation Details Component ---
interface ExpandedAccommodationDetailsProps {
    accommodation: AccommodationListing;
}

const ExpandedAccommodationDetails: React.FC<ExpandedAccommodationDetailsProps> = ({ accommodation }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="card m-0 p-6 border border-[rgba(var(--text),0.1)]"
        >
            <h3 className="mb-4">Accommodation Details</h3>
            <ul className="space-y-3 text-sm text-[rgba(var(--text),0.9)]">
                <li className="flex items-center"><FaMapMarkerAlt className="mr-4 text-lg text-[rgba(var(--text),0.6)] w-5" /> <span className="font-semibold w-28">Location:</span> {accommodation.location}</li>
                <li className="flex items-center"><FaUserCircle className="mr-4 text-lg text-[rgba(var(--text),0.6)] w-5" /> <span className="font-semibold w-28">Provider:</span> {accommodation.provider.user.name}</li>
                <li className="flex items-center"><FaDollarSign className="mr-4 text-lg text-[rgba(var(--text),0.6)] w-5" /> <span className="font-semibold w-28">Price per Night:</span> ${parseFloat(accommodation.pricePerNight)}</li>
                <li className="flex items-center"><FaCalendarAlt className="mr-4 text-lg text-[rgba(var(--text),0.6)] w-5" /> <span className="font-semibold w-28">Available From:</span> {new Date(accommodation.availableFrom).toLocaleDateString()}</li>
                <li className="flex items-center"><FaCalendarAlt className="mr-4 text-lg text-[rgba(var(--text),0.6)] w-5" /> <span className="font-semibold w-28">Available To:</span> {new Date(accommodation.availableTo).toLocaleDateString()}</li>
                <li className="flex items-center"><FaCheck className="mr-4 text-lg text-[rgba(var(--text),0.6)] w-5" /> <span className="font-semibold w-28">Provider Status:</span> <span className="capitalize">{accommodation.provider.accountStatus}</span></li>
                <li className="flex items-center"><FaClock className="mr-4 text-lg text-[rgba(var(--text),0.6)] w-5" /> <span className="font-semibold w-28">Listed On:</span> {new Date(accommodation.createdAt).toLocaleDateString()}</li>
            </ul>
            <button
                onClick={(e) => { e.stopPropagation(); alert(`Booking accommodation ${accommodation.id}`); }}
                className="btn btn-primary font-bold w-full mt-6"
            >
                Reserve Now
            </button>
        </motion.div>
    )
}

// --- Main Accommodation Slider Component ---
const AccommodationCardSlider = ({ accommodationListings }: { accommodationListings: AccommodationListing[] }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        containScroll: 'trimSnaps',
        dragFree: true,
    });

    const [selectedAccommodationIndex, setSelectedAccommodationIndex] = useState<number | null>(null);
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
        setSelectedAccommodationIndex(currentIndex => (currentIndex === index ? null : index));
        if (emblaApi) {
            if (!emblaApi.slidesInView().includes(index)) {
                emblaApi.scrollTo(index);
            }
        }
    }, [emblaApi]);

    const selectedAccommodation = selectedAccommodationIndex !== null ? accommodationListings[selectedAccommodationIndex] : null;

    if (!accommodationListings || accommodationListings.length === 0) {
        return <p className="text-center text-[rgba(var(--text),0.6)]">No available accommodations found.</p>
    }

    return (
        <div className={`md:flex ${selectedAccommodation ? 'md:space-x-8' : ''}`}>
            <div className="flex-grow md:w-3/5 lg:w-2/3">
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex space-x-4 p-1">
                        {accommodationListings.map((accommodation, index) => (
                            <AccommodationCard
                                key={accommodation.id}
                                accommodation={accommodation}
                                isSelected={selectedAccommodationIndex === index}
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
                {selectedAccommodation && (
                    <div className="md:w-2/5 lg:w-1/3 mt-6 md:mt-0">
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 40 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ExpandedAccommodationDetails accommodation={selectedAccommodation} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AccommodationCardSlider;
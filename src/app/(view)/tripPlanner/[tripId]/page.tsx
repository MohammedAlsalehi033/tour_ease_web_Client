import React from 'react'
import TransportationCardSlider from '../components/TransportationCardSlider' 
import { RideListing } from '@/app/(model)/rideSharing/RideListting/rideListtingModel'
import AccommodationCardSlider  , { AccommodationListing } from '../components/AccomodationCardSlider' 

const TripPlannerPage = () => {
    const rideListings: RideListing[] = [
        {
            id: 10,
            providerId: 'provider1',
            startLocationLat: 15.3547,
            startLocationLng: 44.2068,
            startLocationText: 'Sana\'a Old City',
            endLocationLat: 15.3694,
            endLocationLng: 44.1910,
            endLocationText: 'Al-Sabeen Park',
            departureTime: '2025-08-05T10:00:00Z',
            seatsAvailable: 3,
            pricePerSeat: '1500',
            status: 'active',
            mediaUrls: ['https://placehold.co/600x400/2196F3/ffffff?text=Ride+Image'],
            createdAt: '2025-08-01T10:00:00Z',
            distance_km: 8,
            provider: {
                providerId: 'provider1',
                licenseMmediaUrls: ['https://placehold.co/600x400/42A5F5/ffffff?text=Vehicle'],
                vehicleMediaUrls: ['https://placehold.co/600x400/42A5F5/ffffff?text=Vehicle'],
                vehicleType: 'Sedan',
                seatsAvailable: 3,
                createdAt: '2025-07-20T10:00:00Z',
                accountStatus: 'active',
                user: {
                    id: 'user1',
                    name: 'Ahmed Al-Fulan',
                    email: 'ahmed.fulan@example.com'
                }
            }
        },
        {
            id: 11,
            providerId: 'provider2',
            startLocationLat: 15.3425,
            startLocationLng: 44.2175,
            startLocationText: 'Haddah Street',
            endLocationLat: 15.3522,
            endLocationLng: 44.2052,
            endLocationText: 'Al-Tahrir Square',
            departureTime: '2025-08-05T12:30:00Z',
            seatsAvailable: 2,
            pricePerSeat: '1200',
            status: 'active',
            mediaUrls: ['https://placehold.co/600x400/2196F3/ffffff?text=Ride+Image'],
            createdAt: '2025-08-02T11:00:00Z',
            distance_km: 5,
            provider: {
                providerId: 'provider2',
                licenseMmediaUrls: [],
                vehicleMediaUrls: ['https://placehold.co/600x400/42A5F5/ffffff?text=Vehicle'],
                vehicleType: 'SUV',
                seatsAvailable: 4,
                createdAt: '2025-07-25T14:00:00Z',
                accountStatus: 'active',
                user: {
                    id: 'user2',
                    name: 'Fatima Al-Harazi',
                    email: 'fatima.harazi@example.com'
                }
            }
        }
    ];

    const accommodationListings: AccommodationListing[] = [
        {
            id: 1,
            providerId: 'provider_acc_1',
            location: 'Old City, Sana\'a',
            availableFrom: '2025-08-06T14:00:00Z',
            availableTo: '2025-08-16T11:00:00Z',
            pricePerNight: '15000',
            mediaUrls: ['https://placehold.co/600x400/0D47A1/ffffff?text=Hotel'],
            createdAt: '2025-07-30T10:00:00Z',
            provider: {
                user: {
                    name: 'Arabian Nights Hotel'
                },
                accountStatus: 'active'
            },
            status: 'active',
            distance_km: 0.5 
        },
        {
            id: 2,
            providerId: 'provider_acc_2',
            location: 'Haddah District, Sana\'a',
            availableFrom: '2025-08-10T15:00:00Z',
            availableTo: '2025-08-20T12:00:00Z',
            pricePerNight: '25000',
            mediaUrls: ['https://placehold.co/600x400/0D47A1/ffffff?text=Hotel'],
            createdAt: '2025-07-28T12:00:00Z',
            provider: {
                user: {
                    name: 'Sheba Hotel'
                },
                accountStatus: 'active'
            },
            status: 'active',
            distance_km: 4
        }
        // Add more accommodation listings as needed
    ];

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className='flex flex-col gap-8'>
                <div className='card'>
                    <h1>Choose your Favorite Ride</h1>
                    <div className="divider" />
                    <TransportationCardSlider rideListings={rideListings} />
                </div>
                <div className='card'>
                    <h1>Explore Accommodation Options</h1>
                    <div className="divider" />
                    <AccommodationCardSlider accommodationListings={accommodationListings} />
                </div>
            </div>
        </div>
    )
}

export default TripPlannerPage;
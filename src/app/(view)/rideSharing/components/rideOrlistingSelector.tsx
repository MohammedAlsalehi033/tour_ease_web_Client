"use client"
import React, { useState } from 'react'
import RideRequestComponent from './requestsComponent';
import ListingComponent from './listingComponent';
import { RideListing } from '@/app/(model)/rideSharing/RideListting/rideListtingModel';
import { RideRequest } from '@/app/(model)/rideSharing/RideRequest/rideRequestModel';

interface RideOrListingSelectorProps {
  rideListings: RideListing[]; 
  rideRequests?: RideRequest[]| undefined; 
}

const RideOrlistingSelector: React.FC<RideOrListingSelectorProps> = ({rideListings, rideRequests}) => {
  const [selectedTap, setSelectedTap] = useState<'Request' | 'listing'>('listing');
    return (
    <div className=''>
        <div className='flex justify-center items-center gap-4 p-4'>
            <button
            className={`px-4 py-2 rounded ${selectedTap === 'listing' ? 'bg-primary' : 'bg-primary-disabled'}`}
            onClick={() => setSelectedTap('listing')}
            >
            Ride Listings
            </button>
            <button
            className={`px-4 py-2 rounded ${selectedTap === 'Request' ? 'bg-primary' : 'bg-primary-disabled'}`}
            onClick={() => setSelectedTap('Request')}
            >
            Ride Requests
            </button>

   
        </div>
    
        {selectedTap === 'listing' && (
            <div>
                  <ListingComponent rideListings={rideListings}/>

            </div>
        )}
    
        {selectedTap === 'Request' && (
            <div>
                  <RideRequestComponent rideRequests={rideRequests}/>

            </div>
        )}
    </div>
  )
}

export default RideOrlistingSelector
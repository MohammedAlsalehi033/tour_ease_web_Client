"use client";

import RideSharingDashboard from "./RideSharingDashboard";

export default function ClientComponent({ rideRequests, rideListings, userData }) {
  
  return (
    <RideSharingDashboard 
      rideRequests={rideRequests} 
      rideListings={rideListings} 
      userData={userData}
    />
  );
}
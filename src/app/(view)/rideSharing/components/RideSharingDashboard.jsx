import { useState, useEffect } from "react";

export default function RideSharingDashboard({ rideRequests, rideListings, userData }) {
  const [theme, setTheme] = useState();
  const [activeTab, setActiveTab] = useState("listings");
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const getPriceDisplay = (priceOrBudget) => {
    if (!priceOrBudget) return "Price not specified";
    if (priceOrBudget.includes("-")) return `$${priceOrBudget}`;
    return `$${priceOrBudget}`;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col items-center justify-start pt-12 `}>
 
      
      <div className="max-w-4xl w-full px-6">

        
        {/* Navigation Tabs */}
        <div className="flex mb-6 border-b">
          <button 
            onClick={() => setActiveTab("listings")}
            className={`py-2 px-4 font-medium ${activeTab === 'listings' ? 'text-primary border-b-2 border-primary' : ''}`}
          >
            Available Rides
          </button>
          <button 
            onClick={() => setActiveTab("requests")}
            className={`py-2 px-4 font-medium ${activeTab === 'requests' ? 'text-primary border-b-2 border-primary' : ''}`}
          >
            Ride Requests
          </button>
        </div>
        
        {/* Conditional Content Based on Active Tab */}
        {activeTab === "listings" && (
          <div className="space-y-6">
            <h2 className="text-headline-sm mb-4">Available Rides ({rideListings?.length || 0})</h2>
            
            {rideListings && rideListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rideListings.map(listing => (
                  <div 
                    key={listing.id} 
                    className={`card cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedListing?.id === listing.id ? 'border-primary border-2' : ''
                    } ${theme === 'dark' ? 'bg-dark-surface' : 'bg-light-surface'}`}
                    onClick={() => setSelectedListing(listing)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-title-md font-medium">{listing.startLocationText} → {listing.endLocationText}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        listing.status === 'active' ? 'bg-success text-white' : 
                        listing.status === 'pending' ? 'bg-warning text-gray-900' : 
                        'bg-error text-white'
                      }`}>
                        {listing.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        {listing.provider?.user?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="text-body-md font-medium">{listing.provider?.user?.name || "Driver"}</p>
                        <p className="text-body-sm text-gray-500">{listing.provider?.vehicleType || "Vehicle"}</p>
                      </div>
                    </div>
                    
                    <div className="divider my-3"></div>
                    
                    <div className="grid grid-cols-2 gap-2 text-body-sm">
                      <div>
                        <p className="text-gray-500">Departure</p>
                        <p>{formatDateTime(listing.departureTime)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Distance</p>
                        <p>{listing.route_distance_km?.toFixed(1) || "N/A"} km</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Price per seat</p>
                        <p className="font-medium text-primary">{getPriceDisplay(listing.pricePerSeat)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Seats</p>
                        <p>{listing.seatsAvailable} available</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`card text-center py-8 ${theme === 'dark' ? 'bg-dark-surface' : 'bg-light-surface'}`}>
                <p className="text-body-lg mb-4">No rides available at the moment.</p>
                <button className="btn-primary">Create a Ride Listing</button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === "requests" && (
          <div className="space-y-6">
            <h2 className="text-headline-sm mb-4">Ride Requests ({rideRequests?.length || 0})</h2>
            
            {rideRequests && rideRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rideRequests.map(request => (
                  <div 
                    key={request.id} 
                    className={`card cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedRequest?.id === request.id ? 'border-primary border-2' : ''
                    } ${theme === 'dark' ? 'bg-dark-surface' : 'bg-light-surface'}`}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-title-md font-medium">{request.startLocationText} → {request.endLocationText}</h3>
                      <span className="bg-info text-white px-2 py-1 text-xs rounded-full">
                        REQUEST
                      </span>
                    </div>
                    
                    <div className="divider my-3"></div>
                    
                    <div className="grid grid-cols-2 gap-2 text-body-sm">
                      <div>
                        <p className="text-gray-500">Departure</p>
                        <p>{formatDateTime(request.departureTime)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Distance</p>
                        <p>{request.distance_km?.toFixed(1) || "N/A"} km</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Budget</p>
                        <p className="font-medium text-primary">{getPriceDisplay(request.budget)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Seats needed</p>
                        <p>{request.seatsNeeded}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <button className="btn-outlined w-full">Contact Passenger</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`card text-center py-8 ${theme === 'dark' ? 'bg-dark-surface' : 'bg-light-surface'}`}>
                <p className="text-body-lg mb-4">No ride requests at the moment.</p>
                <button className="btn-primary">Request a Ride</button>
              </div>
            )}
          </div>
        )}
        
        {/* Details Section - Shows up when a listing or request is selected */}
        {(selectedListing || selectedRequest) && (
          <div className={`card mt-8 ${theme === 'dark' ? 'bg-dark-surface' : 'bg-light-surface'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-headline-sm">
                {selectedListing ? 'Ride Details' : 'Request Details'}
              </h2>
              <button 
                onClick={() => selectedListing ? setSelectedListing(null) : setSelectedRequest(null)}
                className="btn-text"
              >
                Close
              </button>
            </div>
            
            {selectedListing && (
              <div>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="text-title-md mb-2">Route Information</h3>
                    <p className="text-body-md mb-1"><strong>From:</strong> {selectedListing.startLocationText}</p>
                    <p className="text-body-md mb-1"><strong>To:</strong> {selectedListing.endLocationText}</p>
                    <p className="text-body-md mb-1"><strong>Distance:</strong> {selectedListing.distance_km?.toFixed(1) || "N/A"} km</p>
                    <p className="text-body-md mb-4"><strong>Departure:</strong> {formatDateTime(selectedListing.departureTime)}</p>
                    
                    <h3 className="text-title-md mb-2">Pricing</h3>
                    <p className="text-body-md mb-1"><strong>Price per seat:</strong> {getPriceDisplay(selectedListing.pricePerSeat)}</p>
                    <p className="text-body-md mb-4"><strong>Available seats:</strong> {selectedListing.seatsAvailable}</p>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-title-md mb-2">Driver Information</h3>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center text-lg">
                        {selectedListing.provider?.user?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="text-body-lg font-medium">{selectedListing.provider?.user?.name || "Driver"}</p>
                        <p className="text-body-md">{selectedListing.provider?.vehicleType || "Vehicle"}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <button className="btn-primary w-full">Book This Ride</button>
                      <button className="btn-outlined w-full">Contact Driver</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {selectedRequest && (
              <div>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="text-title-md mb-2">Request Information</h3>
                    <p className="text-body-md mb-1"><strong>From:</strong> {selectedRequest.startLocationText}</p>
                    <p className="text-body-md mb-1"><strong>To:</strong> {selectedRequest.endLocationText}</p>
                    <p className="text-body-md mb-1"><strong>Distance:</strong> {selectedRequest.distance_km?.toFixed(1) || "N/A"} km</p>
                    <p className="text-body-md mb-1"><strong>Departure:</strong> {formatDateTime(selectedRequest.departureTime)}</p>
                    <p className="text-body-md mb-1"><strong>Seats needed:</strong> {selectedRequest.seatsNeeded}</p>
                    <p className="text-body-md mb-4"><strong>Budget:</strong> {getPriceDisplay(selectedRequest.budget)}</p>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-title-md mb-2">Do you have a matching ride?</h3>
                    <p className="text-body-md mb-6">If you're heading in this direction, you can offer this passenger a ride.</p>
                    
                    <div className="mt-6 space-y-3">
                      <button className="btn-primary w-full">Offer a Ride</button>
                      <button className="btn-outlined w-full">Contact Passenger</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
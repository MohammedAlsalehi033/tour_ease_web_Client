"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { container } from '@/app/lib/diContainer';
import OtherAvatarPic from '../../components/otherAvatarPic';
import { TripPlannerController } from '@/app/(controller)/tripPlanner/tripPlannerController';
import { RefinePlanChat } from './RefinePlanChat';
import { BookingSummary } from './BookingSummary';
import PaymentDialog from './PaymentDialog';
import BookingProgressDialog from './BookingProgressDialog';
import type { TripPlannerSearchParams, TransportOption, AccommodationOption } from '@/app/(model)/tripPlanner/tripPlannerModel';
import {
  RoomSelectionMap,
  RoomCatalogEntry,
  SelectedRoomAllocation,
  toNumber,
  isValidUrl,
  getRoomCatalog,
  buildInitialRoomSelections,
  buildSelectedRoomAllocations
} from '../tripPlannerHelpers';

const ResultsDisplay = ({ results, onBack, originalRequest }: {
  results: any;
  onBack: () => void;
  originalRequest: TripPlannerSearchParams;
}) => {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedTransport, setSelectedTransport] = useState<any>(null);
  const [selectedReturnTransport, setSelectedReturnTransport] = useState<any>(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState<any>(null);
  const [roomSelections, setRoomSelections] = useState<RoomSelectionMap>({});
  const [currentResults, setCurrentResults] = useState(results);
  const [showBudgetWidget, setShowBudgetWidget] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [pendingBookingRequest, setPendingBookingRequest] = useState<any>(null);
  const [progressStep, setProgressStep] = useState<string>("");
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const tripPlannerController = container.resolve(TripPlannerController);

  const { optimalPlan, recommendedPlans, availableOptions, itinerary, tripSummary } = currentResults?.data || {};

  const roomCatalog = selectedAccommodation ? getRoomCatalog(selectedAccommodation) : [];
  const selectedRoomAllocations = buildSelectedRoomAllocations(roomSelections, roomCatalog);
  const nightsCount = selectedAccommodation?.numberOfNights || tripSummary?.totalNights || 1;
  const requiresReturnTransport = originalRequest.needsReturnTransport !== false;
  const activeOutboundTransport = selectedTransport || selectedPlan?.outboundTransport || null;
  const activeReturnTransport = requiresReturnTransport
    ? selectedReturnTransport || selectedPlan?.returnTransport || null
    : null;
  const transportCost = toNumber(activeOutboundTransport?.totalCost) + toNumber(activeReturnTransport?.totalCost);
  const accommodationCostFromSelections = selectedRoomAllocations.reduce((sum, allocation) => {
    const allocationTotal = toNumber(allocation.totalCost);
    const perNight = toNumber(allocation.pricePerNight);
    const totalCost = allocationTotal > 0 ? allocationTotal : perNight * nightsCount;
    return sum + totalCost;
  }, 0);
  const fallbackRoomAllocationsCost = selectedAccommodation?.roomAllocations?.reduce(
    (sum: number, allocation: any) => sum + toNumber(allocation.totalCost),
    0
  ) || 0;
  const defaultAccommodationCost = selectedAccommodation ? toNumber(selectedAccommodation.totalCost) : 0;
  const accommodationCost = selectedRoomAllocations.length > 0
    ? accommodationCostFromSelections
    : (fallbackRoomAllocationsCost > 0 ? fallbackRoomAllocationsCost : defaultAccommodationCost);

  const activitiesCost = tripSummary?.estimatedTotalCost?.activities || 0;
  const mealsCost = tripSummary?.estimatedTotalCost?.meals || 0;
  const originalTransportCost = tripSummary?.estimatedTotalCost?.transportation || 0;
  const originalAccommodationCost = tripSummary?.estimatedTotalCost?.accommodation || 0;
  const otherCost = Math.max(
    0,
    (tripSummary?.estimatedTotalCost?.total || 0) - (originalTransportCost + originalAccommodationCost + activitiesCost + mealsCost)
  );
  const updatedTotalCost = tripSummary
    ? transportCost + accommodationCost + activitiesCost + mealsCost + otherCost
    : transportCost + accommodationCost;
  const budget = toNumber(originalRequest.budget);
  const clientSideBudgetStatus = budget > 0 && updatedTotalCost > budget ? 'over_budget' : 'within_budget';

  const selectedAccommodationImages = (Array.isArray(selectedAccommodation?.images) && selectedAccommodation.images.length > 0
    ? selectedAccommodation.images
    : Array.isArray(selectedAccommodation?.mediaUrls)
      ? selectedAccommodation.mediaUrls
      : []).filter((url: string) => isValidUrl(url));

  // Check if this is an itinerary-based response
  const hasItinerary = itinerary && Array.isArray(itinerary) && itinerary.length > 0;

  // Scroll function for slider navigation
  const handleScroll = (direction: 'left' | 'right', containerId: string) => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 320; // Slightly more than card width for smooth transition
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!currentResults?.data) {
    return <div className="text-center">No results found</div>;
  }

  const handleSelectOptimalPlan = () => {
    const plan = optimalPlan || (hasItinerary ? { itinerary, tripSummary } : null);
    setSelectedPlan(plan);
    // Auto-select the optimal transport and accommodation
    if (optimalPlan) {
      setSelectedTransport(optimalPlan.outboundTransport);
      setSelectedReturnTransport(optimalPlan.returnTransport || null);
      setSelectedAccommodation(optimalPlan.accommodation);
      // Pass undefined to select only the cheapest room instead of all rooms
      setRoomSelections(buildInitialRoomSelections(optimalPlan.accommodation, undefined));
    }
  };

  const handleSelectTransport = (transport: TransportOption) => {
    setSelectedTransport(transport);
  };

  const handleSelectReturnTransport = (transport: TransportOption) => {
    setSelectedReturnTransport(transport);
  };

  const handleSelectAccommodation = (accommodation: AccommodationOption) => {
    setSelectedAccommodation(accommodation);
    // Pass undefined (no preselections) to select only the cheapest room
    setRoomSelections(buildInitialRoomSelections(accommodation, undefined));
  };

  const handleRoomToggle = (roomId: number, isSelected: boolean) => {
    setRoomSelections(prev => {
      const next = { ...prev };
      if (isSelected) {
        next[roomId] = true;
      } else {
        delete next[roomId];
      }
      return next;
    });
  };

  // Calculate total cost based on selections
  const calculateTotalCost = () => updatedTotalCost;

  const handleSavePlan = async () => {
    const outboundOption = activeOutboundTransport;
    const returnOption = activeReturnTransport;

    if (!outboundOption && !selectedAccommodation) {
      alert('Please select transportation and accommodation before saving');
      return;
    }

    if (requiresReturnTransport && !returnOption) {
      alert('Please select a return transportation option.');
      return;
    }

    if (selectedAccommodation && roomCatalog.length > 0 && selectedRoomAllocations.length === 0) {
      alert('Please choose at least one room type for the selected accommodation.');
      return;
    }

    const planName = prompt('Enter a name for this plan:');
    if (!planName) return;

    const description = prompt('Add a description (optional):') || '';

    try {
      const totalCost = calculateTotalCost();

      const roomPayload = selectedAccommodation
        ? (selectedRoomAllocations.length > 0
            ? selectedRoomAllocations.map(allocation => ({
                roomId: allocation.roomId,
                quantity: 1
              }))
            : (selectedAccommodation.roomAllocations || []).map((r: any) => ({
                roomId: r.roomId || r.room?.id,
                quantity: (r.numberOfRooms || r.quantity || 0) > 0 ? 1 : 0
              })).filter((entry: any) => entry.roomId && entry.quantity > 0))
        : [];
      
      const savePlanRequest = {
        // SavedPlanRequest fields
        planName,
        description,
        selectedOutboundId: outboundOption?.id || 0,
        selectedReturnId: returnOption?.id ?? null,
        selectedAccommodationId: selectedAccommodation?.id || 0,
        selectedRoomAllocations: roomPayload,
        selectedActivities: [],
        totalCost,
        tags: originalRequest.interests || [],
        originalSearchParams: originalRequest,
        status: 'saved',
        // Additional required fields from search params
        startLocation: originalRequest.startLocation,
        endLocation: originalRequest.endLocation,
        startTime: originalRequest.startTime,
        endTime: originalRequest.endTime,
        numberOfTravelers: originalRequest.numberOfTravelers,
        budget: originalRequest.budget,
        interests: originalRequest.interests,
        needsReturnTransport: originalRequest.needsReturnTransport,
        // Save the ENTIRE search results data
        searchResultsData: currentResults?.data || {}
      };

      await tripPlannerController.saveTripPlan(savePlanRequest);
      alert('Plan saved successfully! You can view and modify it in "My Saved Plans"');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save plan: ' + (error as Error).message);
    }
  };

  const handleInitiateBooking = () => {
    console.log('handleInitiateBooking called');
    const outboundOption = activeOutboundTransport;
    const returnOption = activeReturnTransport;

    console.log('Outbound:', outboundOption);
    console.log('Return:', returnOption);
    console.log('Accommodation:', selectedAccommodation);
    console.log('Selected Plan:', selectedPlan);

    if (!selectedPlan && !outboundOption && !selectedAccommodation) {
      alert('Please select a plan or choose transportation and accommodation');
      return;
    }

    if (requiresReturnTransport && !returnOption) {
      alert('Please select a return transportation option.');
      return;
    }

    if (selectedAccommodation && roomCatalog.length > 0 && selectedRoomAllocations.length === 0) {
      alert('Please choose at least one room type for the selected accommodation.');
      return;
    }

    console.log('Validation passed, creating booking request...');

    const roomPayload = selectedAccommodation
      ? (selectedRoomAllocations.length > 0
          ? selectedRoomAllocations.map(allocation => ({
              roomId: allocation.roomId,
              numberOfRooms: 1
            }))
          : (selectedAccommodation.roomAllocations || []).map((r: any) => ({
              roomId: r.roomId || r.room?.id,
              numberOfRooms: (r.numberOfRooms || r.quantity || 0) > 0 ? 1 : 0
            })).filter((entry: any) => entry.roomId && entry.numberOfRooms > 0))
      : [];

    const bookingRequest: any = {
      seatsNeeded: currentResults.data.requestSummary.numberOfTravelers,
      checkInDate: currentResults.data.requestSummary.startTime,
      checkOutDate: currentResults.data.requestSummary.endTime
    };

    // Add transport IDs only if they exist
    if (outboundOption?.id) {
      bookingRequest.outboundTransportId = outboundOption.id;
    }
    if (returnOption?.id) {
      bookingRequest.returnTransportId = returnOption.id;
    }

    // Add accommodation info only if selected
    if (selectedAccommodation?.id) {
      bookingRequest.accommodationId = selectedAccommodation.id;
      bookingRequest.selectedRoomAllocations = roomPayload;
    }

    // If accommodation is selected, show payment dialog
    if (selectedAccommodation) {
      setPendingBookingRequest(bookingRequest);
      setShowPaymentDialog(true);
    } else {
      // No accommodation selected, proceed with booking details
      setBookingDetails({
        outboundTransport: outboundOption,
        returnTransport: returnOption,
        accommodation: selectedAccommodation,
        selectedRooms: selectedRoomAllocations,
        totalCost: calculateTotalCost(),
        nightsCount: nightsCount,
        bookingRequest
      });
    }
    
    console.log('Payment dialog or booking details set!');
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!pendingBookingRequest) return;

    setShowPaymentDialog(false);
    setProgressStep("payment");
    setShowProgressDialog(true);

    try {
      // Step 1: Payment is already confirmed by Stripe
      await new Promise(res => setTimeout(res, 800));

      // Step 2: Reserving ride (will be part of the full booking request)
      setProgressStep("ride");
      await new Promise(res => setTimeout(res, 600));

      // Step 3: Setting up rooms (preparing full booking with payment info)
      setProgressStep("rooms");
      
      // Add payment information to the complete booking request
      const bookingRequestWithPayment = {
        ...pendingBookingRequest,
        paymentMethod: 'stripe' as const,
        stripePaymentIntentId: paymentIntentId,
        specialRequests: '' // Optional field for any user notes
      };

      console.log('Confirming booking with payment:', bookingRequestWithPayment);
      
      // Make the actual API call with all booking info
      const confirmation = await tripPlannerController.confirmBooking(bookingRequestWithPayment);

      // Step 4: All set!
      setProgressStep("done");
      setTimeout(async () => {
        setShowProgressDialog(false);
        setPendingBookingRequest(null);
        alert('Payment successful! Booking confirmed. Total: PKR ' + confirmation.totalCost.toLocaleString() + '\n' + confirmation.message);

        // Save the booked plan with same structure as manual save
        try {
          const outboundOption = activeOutboundTransport;
          const returnOption = activeReturnTransport;
          const roomPayload = selectedAccommodation
            ? (selectedRoomAllocations.length > 0
                ? selectedRoomAllocations.map(allocation => ({
                    roomId: allocation.roomId,
                    quantity: 1
                  }))
                : (selectedAccommodation.roomAllocations || []).map((r: any) => ({
                    roomId: r.roomId || r.room?.id,
                    quantity: (r.numberOfRooms || r.quantity || 0) > 0 ? 1 : 0
                  })).filter((entry: any) => entry.roomId && entry.quantity > 0))
            : [];

          // Build filtered search results with only selected options
          const filteredSearchResults = {
            ...currentResults?.data,
            availableOptions: {
              outboundTransportation: outboundOption ? [outboundOption] : [],
              returnTransportation: returnOption ? [returnOption] : [],
              accommodations: selectedAccommodation ? [selectedAccommodation] : []
            }
          };

          const bookedPlanRequest = {
            planName: `Booked Trip - ${originalRequest.endLocation}`,
            description: `Booked on ${new Date().toLocaleDateString()}`,
            selectedOutboundId: outboundOption?.id || 0,
            selectedReturnId: returnOption?.id ?? null,
            selectedAccommodationId: selectedAccommodation?.id || 0,
            selectedRoomAllocations: roomPayload,
            selectedActivities: [],
            totalCost: confirmation.totalCost,
            tags: originalRequest.interests || [],
            originalSearchParams: originalRequest,
            status: 'booked',
            startLocation: originalRequest.startLocation,
            endLocation: originalRequest.endLocation,
            startTime: originalRequest.startTime,
            endTime: originalRequest.endTime,
            numberOfTravelers: originalRequest.numberOfTravelers,
            budget: originalRequest.budget,
            interests: originalRequest.interests,
            needsReturnTransport: originalRequest.needsReturnTransport,
            searchResultsData: filteredSearchResults
          };

          await tripPlannerController.saveTripPlan(bookedPlanRequest);
        } catch (error) {
          console.error('Failed to save booked plan:', error);
        }
      }, 1200);
    } catch (error) {
      setShowProgressDialog(false);
      console.error('Booking error:', error);
      alert('Booking failed: ' + (error as Error).message);
    }
  };

  const confirmAndBook = async () => {
    if (!bookingDetails?.bookingRequest) return;

    try {
      const confirmation = await tripPlannerController.confirmBooking(bookingDetails.bookingRequest);
      alert('Booking offers sent successfully! Total estimated cost: PKR ' + confirmation.totalCost.toLocaleString());
      
      // Save the booked plan with same structure as manual save
      try {
        const outboundOption = activeOutboundTransport;
        const returnOption = activeReturnTransport;
        const roomPayload = selectedAccommodation
          ? (selectedRoomAllocations.length > 0
              ? selectedRoomAllocations.map(allocation => ({
                  roomId: allocation.roomId,
                  quantity: 1
                }))
              : (selectedAccommodation.roomAllocations || []).map((r: any) => ({
                  roomId: r.roomId || r.room?.id,
                  quantity: (r.numberOfRooms || r.quantity || 0) > 0 ? 1 : 0
                })).filter((entry: any) => entry.roomId && entry.quantity > 0))
          : [];

        // Build filtered search results with only selected options
        const filteredSearchResults = {
          ...currentResults?.data,
          availableOptions: {
            outboundTransportation: outboundOption ? [outboundOption] : [],
            returnTransportation: returnOption ? [returnOption] : [],
            accommodations: selectedAccommodation ? [selectedAccommodation] : []
          }
        };

        const bookedPlanRequest = {
          planName: `Booked Trip - ${originalRequest.endLocation}`,
          description: `Booked on ${new Date().toLocaleDateString()}`,
          selectedOutboundId: outboundOption?.id || 0,
          selectedReturnId: returnOption?.id ?? null,
          selectedAccommodationId: selectedAccommodation?.id || 0,
          selectedRoomAllocations: roomPayload,
          selectedActivities: [],
          totalCost: confirmation.totalCost,
          tags: originalRequest.interests || [],
          originalSearchParams: originalRequest,
          status: 'booked',
          startLocation: originalRequest.startLocation,
          endLocation: originalRequest.endLocation,
          startTime: originalRequest.startTime,
          endTime: originalRequest.endTime,
          numberOfTravelers: originalRequest.numberOfTravelers,
          budget: originalRequest.budget,
          interests: originalRequest.interests,
          needsReturnTransport: originalRequest.needsReturnTransport,
          searchResultsData: filteredSearchResults
        };

        await tripPlannerController.saveTripPlan(bookedPlanRequest);
      } catch (error) {
        console.error('Failed to save booked plan:', error);
      }

      setBookingDetails(null);
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed: ' + (error as Error).message);
    }
  };

  const handleBookPlan = async () => {
    const outboundOption = activeOutboundTransport;
    const returnOption = activeReturnTransport;

    if (!selectedPlan && !outboundOption && !selectedAccommodation) {
      alert('Please select a plan or choose transportation and accommodation');
      return;
    }

    if (requiresReturnTransport && !returnOption) {
      alert('Please select a return transportation option.');
      return;
    }

    if (selectedAccommodation && roomCatalog.length > 0 && selectedRoomAllocations.length === 0) {
      alert('Please choose at least one room type for the selected accommodation.');
      return;
    }

    try {
      const roomPayload = selectedAccommodation
        ? (selectedRoomAllocations.length > 0
            ? selectedRoomAllocations.map(allocation => ({
                roomId: allocation.roomId,
                numberOfRooms: 1
              }))
            : (selectedAccommodation.roomAllocations || []).map((r: any) => ({
                roomId: r.roomId || r.room?.id,
                numberOfRooms: (r.numberOfRooms || r.quantity || 0) > 0 ? 1 : 0
              })).filter((entry: any) => entry.roomId && entry.numberOfRooms > 0))
        : [];

      const bookingRequest = {
        outboundTransportId: outboundOption?.id || 0,
        returnTransportId: returnOption?.id ?? null,
        accommodationId: selectedAccommodation?.id || 0,
        selectedRoomAllocations: roomPayload,
        seatsNeeded: currentResults.data.requestSummary.numberOfTravelers,
        checkInDate: currentResults.data.requestSummary.startTime,
        checkOutDate: currentResults.data.requestSummary.endTime
      };

      const confirmation = await tripPlannerController.confirmBooking(bookingRequest);
      alert('Booking confirmed! Total: PKR ' + confirmation.totalCost.toLocaleString());
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed: ' + (error as Error).message);
    }
  };

  return (
    <>
      {/* Booking Summary Full Page */}
      {bookingDetails ? (
        <BookingSummary
          {...bookingDetails}
          onConfirm={confirmAndBook}
          onCancel={() => setBookingDetails(null)}
        />
      ) : (
        <div className="relative">
          {/* Back Button */}
          <button onClick={onBack} className="btn-outlined mb-6">
            ← Back to Search
          </button>

      {/* Optimal Plan Card */}
      {(optimalPlan || hasItinerary) && (
        <div
          onClick={handleSelectOptimalPlan}
          className={`card mb-8 cursor-pointer transition-all duration-300 ${selectedPlan ? 'ring-4 ring-primary/50 shadow-2xl' : 'hover:ring-2 hover:ring-primary/30'
            }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <span className="text-2xl">🌟</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary">
                  {hasItinerary ? 'AI-Optimized Itinerary' : optimalPlan?.planName}
                </h2>
                <p className="text-sm opacity-70">
                  {hasItinerary ? `${tripSummary?.totalDays} Days / ${tripSummary?.totalNights} Nights` : `Score: ${optimalPlan?.optimizationScore?.toFixed(1)}/100`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-70">Total Cost</p>
              <p className="text-3xl font-bold text-primary">
                PKR {hasItinerary ? (tripSummary?.estimatedTotalCost?.total || 0).toLocaleString() : (optimalPlan?.costs?.total || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {selectedPlan && (
            <div className="mt-4 pt-4 border-t border-primary/20">
              <p className="text-sm text-success font-medium">✓ Plan Selected - Ready to Book</p>
            </div>
          )}
        </div>
      )}

      {/* Transportation Slider */}
      {availableOptions?.outboundTransportation?.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">🚗 Available Transportation</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleScroll('left', 'transport-slider')}
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200"
                aria-label="Scroll left"
              >
                ←
              </button>
              <button
                onClick={() => handleScroll('right', 'transport-slider')}
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200"
                aria-label="Scroll right"
              >
                →
              </button>
            </div>
          </div>
          <div
            id="transport-slider"
            className="flex gap-4 overflow-x-scroll pb-4 scrollbar-hide px-2 py-2"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {availableOptions.outboundTransportation.map((transport: TransportOption) => {
              const isSelected = selectedTransport?.id === transport.id;
              return (
                <div
                  key={transport.id}
                  onClick={() => handleSelectTransport(transport)}
                  className={`card flex-shrink-0 w-[300px] transition-all duration-300 cursor-pointer my-2 ${isSelected ? 'ring-4 ring-primary shadow-2xl scale-105' : 'hover:shadow-lg hover:scale-102'
                    }`}
                  style={{ scrollSnapAlign: 'start' }}
                >
                  {isSelected && (
                    <div className="mb-3 px-3 py-1 bg-primary text-white rounded-full text-xs font-medium inline-block">
                      ✓ Selected
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <OtherAvatarPic
                        imageUrl={transport.provider?.user?.mediaUrls?.[0]}
                        otherUserId={transport.providerId || transport.provider?.providerId || ''}
                        userName={transport.providerName || transport.provider?.user?.name}
                      />
                      <div>
                        <h4 className="font-semibold">{transport.vehicleType}</h4>
                        <p className="text-sm opacity-70">{transport.providerName}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      ⭐ {transport.avgRating}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {transport.departureTime && (
                      <p>🕐 {new Date(transport.departureTime).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</p>
                    )}
                    <p>🪑 {transport.seatsAvailable} seats available</p>
                    <p className="text-lg font-bold text-primary">PKR {(transport.totalCost || 0).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {requiresReturnTransport && availableOptions?.returnTransportation?.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">🔁 Return Transportation</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleScroll('left', 'return-transport-slider')}
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200"
                aria-label="Scroll left"
              >
                ←
              </button>
              <button
                onClick={() => handleScroll('right', 'return-transport-slider')}
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200"
                aria-label="Scroll right"
              >
                →
              </button>
            </div>
          </div>
          <div
            id="return-transport-slider"
            className="flex gap-4 overflow-x-scroll pb-4 scrollbar-hide px-2 py-2"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {availableOptions.returnTransportation.map((transport: TransportOption) => {
              const isSelected = activeReturnTransport?.id === transport.id;
              return (
                <div
                  key={transport.id}
                  onClick={() => handleSelectReturnTransport(transport)}
                  className={`card flex-shrink-0 w-[300px] transition-all duration-300 cursor-pointer my-2 ${isSelected ? 'ring-4 ring-primary shadow-2xl scale-105' : 'hover:shadow-lg hover:scale-102'
                    }`}
                  style={{ scrollSnapAlign: 'start' }}
                >
                  {isSelected && (
                    <div className="mb-3 px-3 py-1 bg-primary text-white rounded-full text-xs font-medium inline-block">
                      ✓ Selected
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <OtherAvatarPic
                        imageUrl={transport.provider?.user?.mediaUrls?.[0]}
                        otherUserId={transport.providerId || transport.provider?.providerId || ''}
                        userName={transport.providerName || transport.provider?.user?.name}
                      />
                      <div>
                        <h4 className="font-semibold">{transport.vehicleType}</h4>
                        <p className="text-sm opacity-70">{transport.providerName}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      ⭐ {transport.avgRating}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {transport.departureTime && (
                      <p>🕐 {new Date(transport.departureTime).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</p>
                    )}
                    <p>🪑 {transport.seatsAvailable} seats available</p>
                    <p className="text-lg font-bold text-primary">PKR {(transport.totalCost || 0).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Accommodations Slider */}
      {availableOptions?.accommodations?.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">🏨 Available Accommodations</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleScroll('left', 'accommodation-slider')}
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200"
                aria-label="Scroll left"
              >
                ←
              </button>
              <button
                onClick={() => handleScroll('right', 'accommodation-slider')}
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200"
                aria-label="Scroll right"
              >
                →
              </button>
            </div>
          </div>
          <div
            id="accommodation-slider"
            className="flex gap-4 overflow-x-scroll pb-4 scrollbar-hide px-2 py-2"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {availableOptions.accommodations.map((acc: AccommodationOption) => {
              const isSelected = selectedAccommodation?.id === acc.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => handleSelectAccommodation(acc)}
                  className={`card flex-shrink-0 w-[300px] sm:w-[350px] transition-all duration-300 cursor-pointer my-2 ${isSelected ? 'ring-4 ring-primary shadow-2xl scale-105' : 'hover:shadow-lg hover:scale-102'
                    }`}
                  style={{ scrollSnapAlign: 'start' }}
                >
                  {isSelected && (
                    <div className="mb-3 px-3 py-1 bg-primary text-white rounded-full text-xs font-medium inline-block">
                      ✓ Selected
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <OtherAvatarPic
                        imageUrl={acc.provider?.user?.mediaUrls?.[0]}
                        otherUserId={acc.providerId || acc.provider?.providerId || ''}
                        userName={acc.provider?.user?.name || acc.name}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{acc.name}</h4>
                        <p className="text-sm opacity-70">📍 {acc.location}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      ⭐ {acc.avgRating}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm mb-3">
                    <p>🌙 {acc.numberOfNights} nights</p>
                    <p className="text-xs opacity-70">
                      {acc.roomAllocations && acc.roomAllocations.length > 0 
                        ? acc.roomAllocations.map((r: any) => `${r.numberOfRooms}× ${r.room?.roomType || r.roomType || 'Room'}`).join(', ')
                        : 'Rooms available'
                      }
                    </p>
                  </div>
                  <p className="text-lg font-bold text-primary">PKR {(acc.totalCost || 0).toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedAccommodation && (
        <div className="card ring-4 ring-primary/30 mt-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <OtherAvatarPic
                imageUrl={selectedAccommodation.provider?.user?.mediaUrls?.[0]}
                otherUserId={selectedAccommodation.providerId || selectedAccommodation.provider?.providerId || ''}
                userName={selectedAccommodation.provider?.user?.name || selectedAccommodation.name}
              />
              <div>
                <h3 className="font-semibold text-xl">{selectedAccommodation.name}</h3>
                <p className="text-sm opacity-70">📍 {selectedAccommodation.location}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Stay for {selectedAccommodation.numberOfNights || nightsCount} night(s)
                </p>
              </div>
            </div>
            <span className="text-lg font-semibold text-primary">
              PKR {accommodationCost.toLocaleString()}
            </span>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Choose Room Types</p>
            {roomCatalog.length > 0 ? (
              <div className="space-y-3">
                {roomCatalog.map(room => {
                  const isSelected = Boolean(roomSelections[room.id]);
                  const nightlyRate = toNumber(room.pricePerNight);
                  const totalForStay = (() => {
                    const total = toNumber(room.totalCost);
                    return total > 0 ? total : nightlyRate * nightsCount;
                  })();

                  return (
                    <div
                      key={room.id}
                      className={`flex items-center justify-between gap-3 p-3 rounded border transition-all duration-200 ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                          : 'border-gray-200 dark:border-gray-700 bg-surface/50 hover:border-primary/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{room.roomType}</p>
                        <p className="text-xs opacity-70">
                          Capacity: {room.capacity ?? '—'} • PKR {nightlyRate.toLocaleString()} / night
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Estimated stay total: PKR {totalForStay.toLocaleString()}
                        </p>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-medium">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleRoomToggle(room.id, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                        />
                        Select
                      </label>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">Room details not available for this accommodation.</p>
            )}
          </div>

          {selectedRoomAllocations.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Selected Rooms</p>
              <div className="space-y-2">
                {selectedRoomAllocations.map((allocation, idx) => {
                  const totalCost = toNumber(allocation.totalCost);
                  const nightlyRate = toNumber(allocation.pricePerNight);
                  const total = totalCost > 0 ? totalCost : nightlyRate * nightsCount;
                  return (
                    <div key={`${allocation.roomId}-${idx}`} className="flex justify-between items-center p-2 bg-surface/50 rounded">
                      <div>
                        <span className="font-medium text-sm">{allocation.roomType}</span>
                        {allocation.capacity && (
                          <span className="text-xs opacity-70 ml-2">• Capacity: {allocation.capacity}</span>
                        )}
                      </div>
                      <span className="font-semibold text-sm text-primary">PKR {total.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedAccommodationImages.length > 0 && (
            <div className="flex gap-2 overflow-x-scroll scrollbar-hide pt-2">
              {selectedAccommodationImages.slice(0, 6).map((url: string, idx: number) => (
                <div key={idx} className="relative w-32 h-32 rounded overflow-hidden flex-shrink-0">
                  <Image src={url} alt={`${selectedAccommodation.name} ${idx + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Day-by-Day Itinerary */}
      {hasItinerary && (
        <div className="mb-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">📅 Your Journey</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleScroll('left', 'itinerary-slider')}
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200"
                aria-label="Scroll left"
              >
                ←
              </button>
              <button
                onClick={() => handleScroll('right', 'itinerary-slider')}
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200"
                aria-label="Scroll right"
              >
                →
              </button>
            </div>
          </div>
          <div
            id="itinerary-slider"
            className="flex gap-4 overflow-x-scroll pb-4 scrollbar-hide px-2 py-2"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {itinerary.map((day: any, index: number) => (
              <div key={index} className="card flex-shrink-0 w-[320px] sm:w-[400px] my-2" style={{ scrollSnapAlign: 'start' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                      {day.day}
                    </div>
                    <div>
                      <h4 className="font-semibold">{day.theme}</h4>
                      <p className="text-sm opacity-70">{day.date} • {day.dayOfWeek}</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-primary flex-shrink-0">PKR {(day.totalEstimatedCost || 0).toLocaleString()}</p>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-hide">
                  {day.activities?.map((activity: any, actIdx: number) => (
                    <div key={actIdx} className="border-l-4 border-primary/30 pl-4 py-2 bg-surface/50 rounded-r">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-primary">{activity.time}</span>
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                              {activity.type}
                            </span>
                          </div>
                          <h5 className="font-semibold">{activity.title}</h5>
                          <p className="text-sm opacity-70 mt-1">{activity.description}</p>
                          {activity.location && (
                            <p className="text-xs opacity-60 mt-1">
                              📍 {activity.location.name}
                            </p>
                          )}
                          {activity.tips && (
                            <p className="text-xs text-info mt-1">💡 {activity.tips}</p>
                          )}
                        </div>
                        <p className="font-semibold text-primary ml-4 flex-shrink-0">
                          PKR {(activity.estimatedCost || 0).toLocaleString()}
                        </p>
                      </div>
                      {activity.placeDetails?.photos && activity.placeDetails.photos.filter((p: string) => isValidUrl(p)).length > 0 && (
                        <div className="mt-3 flex gap-2 overflow-x-scroll scrollbar-hide">
                          {activity.placeDetails.photos.filter((p: string) => isValidUrl(p)).slice(0, 3).map((photo: string, photoIdx: number) => (
                            <div key={photoIdx} className="relative w-24 h-24 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={photo}
                                alt={`${activity.title} ${photoIdx + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Budget Widget */}
      {(tripSummary || selectedPlan) && (
        <>
          {/* Toggle Button - Always Visible */}
          <button
            onClick={() => setShowBudgetWidget(!showBudgetWidget)}
            className={`fixed bottom-6 z-50 w-12 h-12 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center ${showBudgetWidget ? 'right-[310px] sm:right-[310px]' : 'right-6'
              }`}
            aria-label={showBudgetWidget ? 'Hide budget' : 'Show budget'}
          >
            {showBudgetWidget ? '✕' : '💰'}
          </button>

          {/* Budget Widget Card */}
          {showBudgetWidget && (
            <div className="fixed bottom-6 right-6 card shadow-2xl w-[280px] sm:w-72 z-40 animate-slide-up">
              <h4 className="font-semibold mb-3">💰 Budget Summary</h4>
              <div className="space-y-2 text-sm">
                {tripSummary ? (
                  <>
                    <div className="flex justify-between">
                      <span>Activities</span>
                      <span>PKR {(tripSummary.estimatedTotalCost?.activities || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meals</span>
                      <span>PKR {(tripSummary.estimatedTotalCost?.meals || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transport</span>
                      <span>PKR {transportCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accommodation</span>
                      <span>PKR {accommodationCost.toLocaleString()}</span>
                    </div>
                    {otherCost > 0 && (
                      <div className="flex justify-between">
                        <span>Other</span>
                        <span>PKR {otherCost.toLocaleString()}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {selectedTransport && (
                      <div className="flex justify-between">
                        <span>Transport</span>
                        <span>PKR {transportCost.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedAccommodation && (
                      <div className="flex justify-between">
                        <span>Accommodation</span>
                        <span>PKR {accommodationCost.toLocaleString()}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="pt-3 border-t border-primary/20">
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-primary">
                      PKR {calculateTotalCost().toLocaleString()}
                    </span>
                  </div>
                  {budget > 0 && (
                    <p className={`text-xs mt-2 ${clientSideBudgetStatus === 'over_budget' ? 'text-error' : 'text-success'}`}>
                      {clientSideBudgetStatus === 'over_budget' ? '⚠️ Over Budget' : '✅ Within Budget'}
                    </p>
                  )}
                </div>
              </div>
              {(selectedPlan || selectedTransport || selectedAccommodation) && (
                <div className="space-y-2 mt-4">
                  <button onClick={handleSavePlan} className="btn-outlined w-full">
                    💾 Save Plan
                  </button>
                  <button onClick={handleInitiateBooking} className="btn-primary w-full">
                    Book Now
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
      )}

      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => {
          setShowPaymentDialog(false);
          setPendingBookingRequest(null);
        }}
        totalAmount={accommodationCost}
        onPaymentSuccess={handlePaymentSuccess}
        bookingSummary={{
          transportCost: transportCost,
          accommodationCost: accommodationCost,
          nightsCount: nightsCount,
          accommodationName: selectedAccommodation?.name,
          outboundTransport: activeOutboundTransport?.providerName || activeOutboundTransport?.type,
          returnTransport: activeReturnTransport?.providerName || activeReturnTransport?.type,
        }}
        accommodationOnly={true}
      />

      {/* Booking Progress Dialog */}
      <BookingProgressDialog step={progressStep} visible={showProgressDialog} />
    </>
  );
};

export default ResultsDisplay;

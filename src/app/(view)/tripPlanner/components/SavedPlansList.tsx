"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { container } from '@/app/lib/diContainer';
import { TripPlannerController } from '@/app/(controller)/tripPlanner/tripPlannerController';
import {
  SavedPlan,
  AvailableOptions,
  PlanSearchData,
  TransportOption,
  AccommodationOption,
  RoomAllocation,
  Room,
  OptimalPlan,
  ItineraryDay,
  TripSummary
} from '@/app/(model)/tripPlanner/tripPlanner.types';
import { toNumber, getRoomCatalog, buildInitialRoomSelections, buildSelectedRoomAllocations } from '@/lib/tripPlannerUtils';

const parseMaybeJson = (value: unknown) => {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn('Failed to parse saved plan JSON blob', error, value);
      return null;
    }
  }
  return value;
};

const SavedPlansList = () => {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [availableOptions, setAvailableOptions] = useState<AvailableOptions | null>(null);
  const [planSearchData, setPlanSearchData] = useState<any | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState<TransportOption | null>(null);
  const [selectedReturnTransport, setSelectedReturnTransport] = useState<TransportOption | null>(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState<AccommodationOption | null>(null);
  const [roomSelections, setRoomSelections] = useState<Record<number, { quantity: number }>>({});
  const tripPlannerController = container.resolve(TripPlannerController);

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await tripPlannerController.getSavedPlans();
       // Handle different response formats
      let savedPlans: SavedPlan[] = [];
      if (Array.isArray(response)) {
        savedPlans = response;
      } else if (response?.data && Array.isArray(response.data)) {
        savedPlans = response.data;
      } else if (response?.success && Array.isArray(response?.data)) {
        savedPlans = response.data;
      }
      
      setPlans(savedPlans);
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Failed to load saved plans: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  function initializeRoomSelections(acc: AccommodationOption | null, planRef?: SavedPlan | null) {
    const savedAllocations = Array.isArray(planRef?.SavedPlanRoomAllocation) && planRef.SavedPlanRoomAllocation.length > 0
      ? planRef.SavedPlanRoomAllocation
      : Array.isArray((planRef as any)?.selectedRoomAllocations) && (planRef as any).selectedRoomAllocations.length > 0
      ? (planRef as any).selectedRoomAllocations
      : Array.isArray((planRef as any)?.roomAllocations) && (planRef as any).roomAllocations.length > 0
      ? (planRef as any).roomAllocations
      : undefined;

    const selections = buildInitialRoomSelections(acc, savedAllocations);
    setRoomSelections(selections);
  }

  const loadAvailableOptions = async (plan: SavedPlan) => {
    setLoadingOptions(true);

    try {
      const rawSearchData = plan.planData ?? plan.searchResultsData;
      const searchData = parseMaybeJson(rawSearchData);  
     
      if (searchData) {
        const resolvedDataCandidate = searchData.data ? parseMaybeJson(searchData.data) || searchData.data : searchData;
        console.log('Resolved saved plan data candidate:', resolvedDataCandidate);
        if (!resolvedDataCandidate || typeof resolvedDataCandidate !== 'object') {
          await fetchAvailableOptionsFromBackend(plan);
          return;
        }
        const resolvedData = resolvedDataCandidate;
        setPlanSearchData(resolvedData);


        const normalizedOptions = resolvedData.searchResultsData?.availableOptions

          ? {
              ...resolvedData.searchResultsData.availableOptions,
              outboundTransportation: resolvedData.searchResultsData.availableOptions.outboundTransportation || [],
              returnTransportation: resolvedData.searchResultsData.availableOptions.returnTransportation || [],
              accommodations: resolvedData.searchResultsData.availableOptions.accommodations || [],
              activities: resolvedData.searchResultsData.availableOptions.activities || []
            }
          : {
              outboundTransportation: resolvedData.searchResultsData?.transportationOptions?.outbound || [],
              returnTransportation: resolvedData.searchResultsData?.transportationOptions?.return || [],
              accommodations: resolvedData.searchResultsData?.accommodationOptions || [],
              activities: resolvedData.searchResultsData?.activities || []
            };
console.log('Normalized options:', resolvedData);
        setAvailableOptions(normalizedOptions);

        const outboundOptions = normalizedOptions.outboundTransportation || [];
        const returnOptions = normalizedOptions.returnTransportation || [];
        const accommodationOptions = normalizedOptions.accommodations || [];

        const currentTransport = outboundOptions.find(
          (t: any) => t.id === plan.selectedOutboundId || t.id === plan.selectedOutboundTransportId
        );
        const currentReturn = returnOptions.find(
          (t: any) => t.id === plan.selectedReturnId || t.id === plan.selectedReturnTransportId
        );
        const currentAccommodation = accommodationOptions.find(
          (a: any) => a.id === plan.selectedAccommodationId
        );

        const resolvedTransport = currentTransport || outboundOptions[0] || null;
        const resolvedReturn = currentReturn || returnOptions[0] || null;
        const resolvedAccommodation = currentAccommodation || accommodationOptions[0] || null;

        setSelectedTransport(resolvedTransport);
        setSelectedReturnTransport(plan.needsReturnTransport === false ? null : resolvedReturn);
        setSelectedAccommodation(resolvedAccommodation);
        initializeRoomSelections(resolvedAccommodation, plan);
      } else {
        await fetchAvailableOptionsFromBackend(plan);
        return;
      }
    } catch (error) {
      console.error('Error loading options:', error);
      alert('Could not load available options.');
    } finally {
      setLoadingOptions(false);
    }
  };

  const fetchAvailableOptionsFromBackend = async (plan: SavedPlan) => {
    const searchParams = plan.originalSearchParams || {
      startLocation: plan.startLocation,
      endLocation: plan.endLocation,
      startTime: plan.startTime,
      endTime: plan.endTime,
      numberOfTravelers: plan.numberOfTravelers,
      budget: typeof plan.budget === 'string' ? parseInt(plan.budget) : plan.budget,
      interests: plan.interests || [],
      needsReturnTransport: plan.needsReturnTransport
    };
    
    setLoadingOptions(true);
    try {
      const results = await tripPlannerController.generateTripPlans(searchParams);
      const responseDataRaw = results?.data ?? results;
      const responseData = parseMaybeJson(responseDataRaw) || {};
      setPlanSearchData(responseData);

      const normalizedOptions = responseData.availableOptions
        ? {
            ...responseData.availableOptions,
            outboundTransportation: responseData.availableOptions.outboundTransportation || [],
            returnTransportation: responseData.availableOptions.returnTransportation || [],
            accommodations: responseData.availableOptions.accommodations || [],
            activities: responseData.availableOptions.activities || []
          }
        : {
            outboundTransportation: (responseData as any).transportationOptions?.outbound || [],
            returnTransportation: (responseData as any).transportationOptions?.return || [],
            accommodations: (responseData as any).accommodationOptions || [],
            activities: (responseData as any).activities || []
          };

      setAvailableOptions(normalizedOptions);

      const outboundOptions = normalizedOptions.outboundTransportation || [];
      const returnOptions = normalizedOptions.returnTransportation || [];
      const accommodationOptions = normalizedOptions.accommodations || [];

      const currentTransport = outboundOptions.find(
        (t: any) => t.id === plan.selectedOutboundId || t.id === plan.selectedOutboundTransportId
      );
      const currentReturn = returnOptions.find(
        (t: any) => t.id === plan.selectedReturnId || t.id === plan.selectedReturnTransportId
      );
      const currentAccommodation = accommodationOptions.find(
        (a: any) => a.id === plan.selectedAccommodationId
      );

      const resolvedTransport = currentTransport || outboundOptions[0] || null;
      const resolvedReturn = currentReturn || returnOptions[0] || null;
      const resolvedAccommodation = currentAccommodation || accommodationOptions[0] || null;

      setSelectedTransport(resolvedTransport);
      setSelectedReturnTransport(plan.needsReturnTransport === false ? null : resolvedReturn);
      setSelectedAccommodation(resolvedAccommodation);
      initializeRoomSelections(resolvedAccommodation, plan);
    } catch (error) {
      console.error('Error fetching options:', error);
      alert('Could not load available options. The saved plan may be using outdated search parameters.');
    } finally {
      setLoadingOptions(false);
    }
  };

  const deletePlan = async (id: number) => {
    if (!confirm('Delete this plan?')) return;
    try {
      await tripPlannerController.deleteSavedPlan(id);
      if (selectedPlanId === id) {
        setSelectedPlanId(null);
        setAvailableOptions(null);
        setSelectedTransport(null);
        setSelectedAccommodation(null);
      }
      fetchPlans();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const bookPlan = async (id: number) => {
    try {
      const confirmation = await tripPlannerController.bookSavedPlan(id);
      alert('Plan booked successfully! Total: PKR ' + confirmation.totalCost.toLocaleString());
      fetchPlans();
    } catch (error) {
      console.error('Book error:', error);
      alert('Failed to book plan: ' + (error as Error).message);
    }
  };

  const updatePlan = async (planId: number) => {
    if (!selectedTransport || !selectedAccommodation) {
      alert('Please select transportation and accommodation before updating.');
      return;
    }

    const plan = plans.find(p => p.id === planId);
    if (plan?.needsReturnTransport !== false && !selectedReturnTransport) {
      alert('Please select a return transportation option.');
      return;
    }

    const roomPayload = (buildSelectedRoomAllocations(roomSelections, getRoomCatalog(selectedAccommodation)) || []).map(allocation => ({
        roomId: allocation.roomId,
        quantity: allocation.quantity
    }));

    if (roomPayload.length === 0) {
      alert('Please choose at least one room type for the selected accommodation.');
      return;
    }

    try {
      const transportCost = toNumber(selectedTransport?.totalCost) + toNumber(selectedReturnTransport?.totalCost);
      const selectedRoomAllocations = buildSelectedRoomAllocations(roomSelections, getRoomCatalog(selectedAccommodation));
      const nightsCount = selectedAccommodation?.numberOfNights || 1;
      const accommodationCostFromSelections = selectedRoomAllocations.reduce((sum, allocation) => {
        const allocationTotal = toNumber(allocation.totalCost);
        const perNight = toNumber(allocation.pricePerNight);
        const totalCost = allocationTotal > 0 ? allocationTotal : perNight * nightsCount;
        return sum + (totalCost * allocation.quantity);
      }, 0);
      const fallbackRoomAllocationsCost = selectedAccommodation?.roomAllocations?.reduce(
        (sum: number, allocation: RoomAllocation) => sum + toNumber(allocation.totalCost),
        0
      ) || 0;
      const defaultAccommodationCost = selectedAccommodation ? toNumber(selectedAccommodation.totalCost) : 0;
      const accommodationCost = accommodationCostFromSelections > 0
        ? accommodationCostFromSelections
        : (fallbackRoomAllocationsCost > 0 ? fallbackRoomAllocationsCost : defaultAccommodationCost);

      const activitiesCost = (planSearchData?.tripSummary?.estimatedTotalCost?.activities) || 0;
      const mealsCost = (planSearchData?.tripSummary?.estimatedTotalCost?.meals) || 0;
      const originalTransportCost = (planSearchData?.tripSummary?.estimatedTotalCost?.transportation) || 0;
      const originalAccommodationCost = (planSearchData?.tripSummary?.estimatedTotalCost?.accommodation) || 0;
      const otherCost = Math.max(0, ((planSearchData?.tripSummary?.estimatedTotalCost?.total) || 0) - (originalTransportCost + originalAccommodationCost + activitiesCost + mealsCost));
      const totalCost = transportCost + accommodationCost + activitiesCost + mealsCost + otherCost;

      const updateRequest = {
        selectedOutboundId: selectedTransport.id,
        selectedReturnId: selectedReturnTransport?.id,
        selectedAccommodationId: selectedAccommodation.id,
        selectedRoomAllocations: roomPayload,
        totalCost
      };

      await tripPlannerController.updateSavedPlan(planId, updateRequest);
      alert('Plan updated successfully! New total: PKR ' + totalCost.toLocaleString());
      fetchPlans();
      setAvailableOptions(null);
      setSelectedPlanId(null);
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update plan: ' + (error as Error).message);
    }
  };

  const handleViewPlan = (plan: SavedPlan) => {
    const isSelecting = selectedPlanId !== plan.id;

    if (isSelecting) {
      setSelectedPlanId(plan.id);
      setAvailableOptions(null);
      setPlanSearchData(null);
      setSelectedTransport(null);
      setSelectedReturnTransport(null);
      setSelectedAccommodation(null);
      setRoomSelections({});
      void loadAvailableOptions(plan);
    } else {
      setSelectedPlanId(null);
      setAvailableOptions(null);
      setPlanSearchData(null);
      setSelectedTransport(null);
      setSelectedReturnTransport(null);
      setSelectedAccommodation(null);
      setRoomSelections({});
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
    initializeRoomSelections(accommodation, null);
  };

  const handleScroll = (direction: 'left' | 'right', containerId: string) => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 320;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleRoomToggle = (roomId: number, isSelected: boolean) => {
    setRoomSelections(prev => {
      const updated = { ...prev };
      if (isSelected) {
        updated[roomId] = { quantity: 1 };
      } else {
        delete updated[roomId];
      }
      return updated;
    });
  };



  if (loading) return <div className="text-center text-gray-700 dark:text-gray-300">Loading...</div>;

  if (plans.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <p className="text-lg mb-4 text-gray-900 dark:text-white">No saved plans yet</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Search for trips and save plans for later</p>
      </div>
    );
  }


  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  // =================================================================
  // START OF FIX: Read from state, don't re-derive
  // =================================================================
  
  // Read directly from the state variables set by loadAvailableOptions
  const outboundTransportOptions = availableOptions?.outboundTransportation || [];
  const returnTransportOptions = availableOptions?.returnTransportation || [];
  const accommodationOptions = availableOptions?.accommodations || [];

  // planSearchData is set by loadAvailableOptions/fetchAvailableOptionsFromBackend
  const itineraryData = Array.isArray(planSearchData?.searchResultsData?.itinerary) ? planSearchData.searchResultsData.itinerary : [];
  const tripSummaryData = planSearchData?.searchResultsData?.tripSummary || null;
  const optimalPlanData = planSearchData?.searchResultsData?.optimalPlan || null;
  console.log('Plan search data:', planSearchData);
  
  // =================================================================
  // END OF FIX
  // =================================================================

  const hasItinerary = itineraryData.length > 0;
  const transportSliderId = selectedPlan ? `saved-transport-slider-${selectedPlan.id}` : 'saved-transport-slider';
  const returnTransportSliderId = selectedPlan ? `saved-return-slider-${selectedPlan.id}` : 'saved-return-slider';
  const accommodationSliderId = selectedPlan ? `saved-accommodation-slider-${selectedPlan.id}` : 'saved-accommodation-slider';
  const itinerarySliderId = selectedPlan ? `saved-itinerary-slider-${selectedPlan.id}` : 'saved-itinerary-slider';
  const requiresReturnTransport = selectedPlan?.needsReturnTransport !== false;
  const isUsingOptimalPlan = Boolean(
    optimalPlanData &&
    selectedTransport &&
    selectedAccommodation &&
    selectedTransport.id === optimalPlanData.outboundTransport?.id &&
    selectedAccommodation.id === optimalPlanData.accommodation?.id
  );
  const selectedAccommodationImages = Array.isArray(selectedAccommodation?.images) && selectedAccommodation.images.length > 0
    ? selectedAccommodation.images
    : Array.isArray(selectedAccommodation?.mediaUrls)
    ? selectedAccommodation.mediaUrls
    : [];
  const isSavedAccommodationSelection = Boolean(
    selectedPlan &&
    selectedAccommodation &&
    selectedAccommodation.id === selectedPlan.selectedAccommodationId
  );

  const roomCatalog = selectedAccommodation ? getRoomCatalog(selectedAccommodation) : [];
  const selectedRoomAllocations = buildSelectedRoomAllocations(roomSelections, roomCatalog);

  const nightsCount = selectedAccommodation?.numberOfNights || 1;
  const transportCost = toNumber(selectedTransport?.totalCost) + toNumber(selectedReturnTransport?.totalCost);
  const accommodationCostFromSelections = selectedRoomAllocations.reduce((sum, allocation) => {
    const allocationTotal = toNumber(allocation.totalCost);
    const perNight = toNumber(allocation.pricePerNight);
    const totalCost = allocationTotal > 0 ? allocationTotal : perNight * nightsCount;
    return sum + (totalCost * allocation.quantity);
  }, 0);
  const fallbackRoomAllocationsCost = selectedAccommodation?.roomAllocations?.reduce(
    (sum: number, allocation: RoomAllocation) => sum + toNumber(allocation.totalCost),
    0
  ) || 0;
  const defaultAccommodationCost = selectedAccommodation ? toNumber(selectedAccommodation.totalCost) : 0;
  const accommodationCost = accommodationCostFromSelections > 0
    ? accommodationCostFromSelections
    : (fallbackRoomAllocationsCost > 0 ? fallbackRoomAllocationsCost : defaultAccommodationCost);

  const activitiesCost = tripSummaryData?.estimatedTotalCost?.activities || 0;
  const mealsCost = tripSummaryData?.estimatedTotalCost?.meals || 0;
  const originalTransportCost = tripSummaryData?.estimatedTotalCost?.transportation || 0;
  const originalAccommodationCost = tripSummaryData?.estimatedTotalCost?.accommodation || 0;
  const otherCost = Math.max(0, (tripSummaryData?.estimatedTotalCost?.total || 0) - (originalTransportCost + originalAccommodationCost + activitiesCost + mealsCost));
  const updatedTotalCost = tripSummaryData
    ? transportCost + accommodationCost + activitiesCost + mealsCost + otherCost
    : transportCost + accommodationCost;

  const calculateTotalCost = () => updatedTotalCost;

  const resetToSavedSelections = (plan?: SavedPlan | null) => {
    if (!plan) return;
    const savedTransport = outboundTransportOptions.find(
      (t: any) => t.id === plan.selectedOutboundId || t.id === plan.selectedOutboundTransportId
    );
    const savedReturn = returnTransportOptions.find(
      (t: any) => t.id === plan.selectedReturnId || t.id === plan.selectedReturnTransportId
    );
    const savedAccommodation = accommodationOptions.find(
      (a: any) => a.id === plan.selectedAccommodationId
    );

    if (savedTransport) {
      setSelectedTransport(savedTransport);
    }
    if (plan.needsReturnTransport === false) {
      setSelectedReturnTransport(null);
    } else if (savedReturn) {
      setSelectedReturnTransport(savedReturn);
    } else if (returnTransportOptions.length > 0) {
      setSelectedReturnTransport(returnTransportOptions[0]);
    } else {
      setSelectedReturnTransport(null);
    }
    if (savedAccommodation) {
      setSelectedAccommodation(savedAccommodation);
      initializeRoomSelections(savedAccommodation, plan);
    } else {
      initializeRoomSelections(null, plan);
    }
  };

  const handleApplyRecommendedPlan = (planData: any) => {
    if (!planData) return;

    const outboundCandidate =
      planData.outboundTransport ||
      planData.transportation?.outbound ||
      planData.transportationOption ||
      planData.transportOptions?.outbound ||
      null;
    if (outboundCandidate) {
      const resolvedOutbound = outboundTransportOptions.find((t: any) => t.id === outboundCandidate.id) || outboundCandidate;
      setSelectedTransport(resolvedOutbound);
    }

    if (requiresReturnTransport) {
      const returnCandidate =
        planData.returnTransport ||
        planData.transportation?.return ||
        planData.transportOptions?.return ||
        null;
      if (returnCandidate) {
        const resolvedReturn = returnTransportOptions.find((t: any) => t.id === returnCandidate.id) || returnCandidate;
        setSelectedReturnTransport(resolvedReturn);
      } else {
        setSelectedReturnTransport(null);
      }
    } else {
      setSelectedReturnTransport(null);
    }

    const accommodationCandidate =
      planData.accommodation ||
      planData.accommodationOption ||
      planData.stayOption ||
      null;
    if (accommodationCandidate) {
      const resolvedAccommodation =
        accommodationOptions.find((acc: any) => acc.id === accommodationCandidate.id) || accommodationCandidate;
      setSelectedAccommodation(resolvedAccommodation);

      const allocationsSource =
        Array.isArray(planData.selectedRoomAllocations) && planData.selectedRoomAllocations.length > 0
          ? planData.selectedRoomAllocations
          : Array.isArray(accommodationCandidate.roomAllocations) && accommodationCandidate.roomAllocations.length > 0
          ? accommodationCandidate.roomAllocations
          : undefined;
      const selections = buildInitialRoomSelections(resolvedAccommodation, allocationsSource);
      setRoomSelections(selections);
    } else {
      setSelectedAccommodation(null);
      setRoomSelections({});
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Saved Plans</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(plan => {
          return (
          <div  
            key={plan.id}  
            onClick={() => handleViewPlan(plan)}
            className={`card cursor-pointer transition-all duration-300 ${
              selectedPlanId === plan.id ? 'ring-4 ring-primary shadow-2xl scale-105' : 'hover:shadow-lg hover:scale-102'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.planName}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(plan.startTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })} - {new Date(plan.endTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                plan.status === 'draft' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                plan.status === 'booked' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
              }`}>
                {plan.status}
              </span>
            </div>
            
            <div className="space-y-2 text-sm mb-3">
              <p className="text-gray-700 dark:text-gray-300">
                📍 {plan.startLocation} → {plan.endLocation}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                👥 {plan.numberOfTravelers} traveler(s)
              </p>
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Total Cost</span>
                <span className="text-lg font-bold text-primary">PKR {(plan.totalCost || 0).toLocaleString()}</span>
              </div>
            </div>

            {selectedPlanId === plan.id && (
              <div className="mt-3 pt-3 border-t border-primary/20">
                <p className="text-xs text-primary font-medium">✓ Click below to view details</p>
              </div>
            )}
          </div>
          );
        })}
      </div>

      {selectedPlan && (
        <div className="relative">
          <button  
            onClick={() => setSelectedPlanId(null)}  
            className="btn-outlined mb-6"
          >
            ← Back to Plans List
          </button>

          {/* Plan Header Card */}
          <div className="card mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary">{selectedPlan.planName}</h2>
                  <p className="text-sm opacity-70">
                    {new Date(selectedPlan.startTime).toLocaleDateString()} - {new Date(selectedPlan.endTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-70">Total Cost</p>
                <p className="text-3xl font-bold text-primary">
                  PKR {(selectedPlan.totalCost || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {selectedPlan.description && (
              <p className="text-gray-700 dark:text-gray-300 mb-4">{selectedPlan.description}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-surface/50 rounded-lg">
              <div>
                <p className="text-xs opacity-70">From</p>
                <p className="font-semibold">{selectedPlan.startLocation}</p>
              </div>
              <div>
                <p className="text-xs opacity-70">To</p>
                <p className="font-semibold">{selectedPlan.endLocation}</p>
              </div>
              <div>
                <p className="text-xs opacity-70">Travelers</p>
                <p className="font-semibold">{selectedPlan.numberOfTravelers}</p>
              </div>
              <div>
                <p className="text-xs opacity-70">Budget</p>
                <p className="font-semibold">PKR {(typeof selectedPlan.budget === 'string' ? parseInt(selectedPlan.budget) : selectedPlan.budget || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => loadAvailableOptions(selectedPlan)}
              className="btn-outlined disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loadingOptions}
            >
              {loadingOptions ? 'Loading options...' : 'Reload options'}
            </button>
            {availableOptions && (
              <button
                onClick={() => resetToSavedSelections(selectedPlan)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Reset to saved selections
                <span className="text-xs opacity-70"> </span>
              </button>
            )}
          </div>

          {loadingOptions && (
            <div className="card mb-8 text-sm text-gray-700 dark:text-gray-300">
              Fetching the latest transportation and accommodation options...
            </div>
          )}

          {optimalPlanData && (
            <div
              onClick={() => handleApplyRecommendedPlan(optimalPlanData)}
              className={`card mb-8 cursor-pointer transition-all duration-300 ${
                isUsingOptimalPlan ? 'ring-4 ring-primary/50 shadow-2xl' : 'hover:ring-2 hover:ring-primary/30'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🌟</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary">{optimalPlanData.planName || 'Optimal Plan'}</h3>
                    {typeof optimalPlanData.optimizationScore === 'number' && (
                      <p className="text-sm opacity-70">Score: {optimalPlanData.optimizationScore.toFixed(1)}/100</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-70">Estimated Total</p>
                  <p className="text-3xl font-bold text-primary">
                    PKR {(optimalPlanData.costs?.total || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Tap to apply the AI optimized transport and stay selections to this saved plan.
              </p>
              {isUsingOptimalPlan && (
                <div className="mt-4 pt-3 border-t border-primary/20 text-sm text-success font-medium">
                  ✓ Optimal plan applied
                </div>
              )}
            </div>
          )}

          {/* Transportation Options */}
          {outboundTransportOptions.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">🚗 Outbound Transportation</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleScroll('left', transportSliderId)}
                    className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200"
                    aria-label="Scroll left"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => handleScroll('right', transportSliderId)}
                    className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200"
                    aria-label="Scroll right"
                  >
                    →
                  </button>
                </div>
              </div>
              <div
                id={transportSliderId}
                className="flex gap-4 overflow-x-scroll pb-4 scrollbar-hide px-2 py-2"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {outboundTransportOptions.map((transport: any) => {
                  const isSelected = selectedTransport?.id === transport.id;
                  return (
                    <div
                      key={transport.id}
                      onClick={() => handleSelectTransport(transport)}
                      className={`card flex-shrink-0 w-[300px] transition-all duration-300 cursor-pointer my-2 ${
                        isSelected ? 'ring-4 ring-primary shadow-2xl scale-105' : 'hover:shadow-lg hover:scale-102'
                      }`}
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      {isSelected && (
                        <div className="mb-3 px-3 py-1 bg-primary text-white rounded-full text-xs font-medium inline-block">
                          ✓ Selected
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{transport.vehicleType || 'Vehicle'}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{transport.providerName || transport.provider?.user?.name || 'Transport'}</p>
                        </div>
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          ⭐ {transport.avgRating || 'N/A'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <p>🪑 {transport.seatsAvailable || 0} seats available</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(transport.departureTime).toLocaleString()}
                        </p>
                        <p className="text-lg font-bold text-primary">PKR {(transport.totalCost || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Return Transportation Options */}
          {requiresReturnTransport && returnTransportOptions.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">🔄 Return Transportation</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleScroll('left', returnTransportSliderId)}
                    className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200"
                    aria-label="Scroll left"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => handleScroll('right', returnTransportSliderId)}
                    className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200"
                    aria-label="Scroll right"
                  >
                    →
                  </button>
                </div>
              </div>
              <div
                id={returnTransportSliderId}
                className="flex gap-4 overflow-x-scroll pb-4 scrollbar-hide px-2 py-2"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {returnTransportOptions.map((transport: any) => {
                  const isSelected = selectedReturnTransport?.id === transport.id;
                  return (
                    <div
                      key={transport.id}
                      onClick={() => handleSelectReturnTransport(transport)}
                      className={`card flex-shrink-0 w-[300px] transition-all duration-300 cursor-pointer my-2 ${
                        isSelected ? 'ring-4 ring-primary shadow-2xl scale-105' : 'hover:shadow-lg hover:scale-102'
                      }`}
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      {isSelected && (
                        <div className="mb-3 px-3 py-1 bg-primary text-white rounded-full text-xs font-medium inline-block">
                          ✓ Selected
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{transport.vehicleType || 'Vehicle'}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{transport.providerName || transport.provider?.user?.name || 'Transport'}</p>
                        </div>
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          ⭐ {transport.avgRating || 'N/A'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <p>🪑 {transport.seatsAvailable || 0} seats available</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(transport.departureTime).toLocaleString()}
                        </p>
                        <p className="text-lg font-bold text-primary">PKR {(transport.totalCost || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Accommodation Options */}
          {accommodationOptions.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">🏨 Available Accommodations</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleScroll('left', accommodationSliderId)}
                    className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200"
                    aria-label="Scroll left"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => handleScroll('right', accommodationSliderId)}
                    className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200"
                    aria-label="Scroll right"
                  >
                    →
                  </button>
                </div>
              </div>
              <div
                id={accommodationSliderId}
                className="flex gap-4 overflow-x-scroll pb-4 scrollbar-hide px-2 py-2"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {accommodationOptions.map((acc: any) => {
                  const isSelected = selectedAccommodation?.id === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleSelectAccommodation(acc)}
                      className={`card flex-shrink-0 w-[300px] sm:w-[350px] transition-all duration-300 cursor-pointer my-2 ${
                        isSelected ? 'ring-4 ring-primary shadow-2xl scale-105' : 'hover:shadow-lg hover:scale-102'
                      }`}
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      {isSelected && (
                        <div className="mb-3 px-3 py-1 bg-primary text-white rounded-full text-xs font-medium inline-block">
                          ✓ Selected
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {acc.propertyName || acc.name || acc.location || 'Accommodation'}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">📍 {acc.location}</p>
                        </div>
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          ⭐ {acc.avgRating || 'N/A'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm mb-3 text-gray-700 dark:text-gray-300">
                        <p>🌙 {acc.numberOfNights || 0} nights</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {acc.propertyType || 'Property'}
                        </p>
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

          {/* Selected Accommodation Details with Room Selection */}
          {selectedAccommodation && (
            <div className="card ring-4 ring-primary/30 mb-8 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-xl text-gray-900 dark:text-white">
                    {selectedAccommodation.propertyName || selectedAccommodation.name || selectedAccommodation.location || 'Selected Accommodation'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">📍 {selectedAccommodation.location}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Stay for {selectedAccommodation.numberOfNights || nightsCount} night(s)
                  </p>
                </div>
                <span className="text-lg font-semibold text-primary">
                  PKR {accommodationCost.toLocaleString()}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Choose Room Types</p>
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
                          <div className="space-y-1 flex-1">
                            <p className="font-medium text-sm text-gray-900 dark:text-white">{room.roomType}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
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
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Selected Rooms</p>
                  <div className="space-y-2">
                    {selectedRoomAllocations.map((allocation, idx) => {
                      const totalCost = toNumber(allocation.totalCost);
                      const nightlyRate = toNumber(allocation.pricePerNight);
                      const total = totalCost > 0 ? totalCost : nightlyRate * nightsCount;
                      return (
                        <div key={`${allocation.roomId}-${idx}`} className="flex justify-between items-center p-2 bg-surface/50 rounded">
                          <div>
                            <span className="font-medium text-sm text-gray-900 dark:text-white">{allocation.roomType}</span>
                            {allocation.capacity && (
                              <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">• Capacity: {allocation.capacity}</span>
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
                      <Image src={url} alt={`${selectedAccommodation.propertyName || selectedAccommodation.name || 'Property'} ${idx + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Itinerary */}
          {hasItinerary && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">📅 Your Journey</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleScroll('left', itinerarySliderId)}
                    className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200"
                    aria-label="Scroll left"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => handleScroll('right', itinerarySliderId)}
                    className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200"
                    aria-label="Scroll right"
                  >
                    →
                  </button>
                </div>
              </div>
              <div
                id={itinerarySliderId}
                className="flex gap-4 overflow-x-scroll pb-4 scrollbar-hide px-2 py-2"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {itineraryData.map((day: any, index: number) => (
                  <div key={index} className="card flex-shrink-0 w-[320px] sm:w-[400px] my-2" style={{ scrollSnapAlign: 'start' }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                          {day.day}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{day.theme || day.title || `Day ${day.day}`}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{day.date} • {day.dayOfWeek}</p>
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
                              <h5 className="font-semibold text-gray-900 dark:text-white">{activity.title || activity.name || activity.description}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                              {activity.location && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  📍 {activity.location.name || activity.location}
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
                          {activity.placeDetails?.photos && activity.placeDetails.photos.length > 0 && (
                            <div className="mt-3 flex gap-2 overflow-x-scroll scrollbar-hide">
                              {activity.placeDetails.photos.slice(0, 3).map((photo: string, photoIdx: number) => (
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

          {/* Cost Summary */}
          {selectedTransport && selectedAccommodation && (
            <div className="card mb-8 bg-gradient-to-br from-primary/5 to-secondary/5">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">💰 Updated Cost Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transportation</span>
                  <span className="font-semibold text-gray-900 dark:text-white">PKR {transportCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Accommodation</span>
                  <span className="font-semibold text-gray-900 dark:text-white">PKR {accommodationCost.toLocaleString()}</span>
                </div>
                {activitiesCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Activities</span>
                    <span className="font-semibold text-gray-900 dark:text-white">PKR {activitiesCost.toLocaleString()}</span>
                  </div>
                )}
                {mealsCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Meals</span>
                    <span className="font-semibold text-gray-900 dark:text-white">PKR {mealsCost.toLocaleString()}</span>
                  </div>
                )}
                {otherCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Other</span>
                    <span className="font-semibold text-gray-900 dark:text-white">PKR {otherCost.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-3 mt-3 border-t-2 border-primary/20 flex justify-between">
                  <span className="font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-2xl text-primary">PKR {calculateTotalCost().toLocaleString()}</span>
                </div>
                {tripSummaryData?.budgetStatus && (
                  <p className={`text-xs mt-2 ${tripSummaryData.budgetStatus === 'over_budget' ? 'text-error' : 'text-success'}`}>
                    {tripSummaryData.budgetStatus === 'over_budget' ? '⚠️ Over Budget' : '✅ Within Budget'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(outboundTransportOptions.length > 0 || accommodationOptions.length > 0) && (
            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={() => updatePlan(selectedPlan.id)}
                disabled={!selectedTransport || !selectedAccommodation}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💾 Update Plan
              </button>
              <button
                onClick={() => bookPlan(selectedPlan.id)}
                className="btn bg-success text-white hover:bg-success/90 flex-1"
              >
                ✈️ Book This Plan
              </button>
              <button
                onClick={() => deletePlan(selectedPlan.id)}
                className="btn bg-error text-white hover:bg-error/90"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedPlansList;
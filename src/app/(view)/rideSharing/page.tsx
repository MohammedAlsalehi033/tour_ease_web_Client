import "reflect-metadata";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { container } from "@/app/lib/diContainer";
import { RideRequestController } from "@/app/(controller)/rideSharing/rideRequestController";
import { RideListing } from '../../(model)/rideSharing/RideListting/rideListtingModel';
import { RideRequest } from "@/app/(model)/rideSharing/RideRequest/rideRequestModel";
import { RideListingController } from "@/app/(controller)/rideSharing/rideListingController";
import { UserController } from "@/app/(controller)/user/userController";
import { TransformationProviderController } from "@/app/(controller)/rideSharing/transportationProviderContrroller";
import TransportationProviderForm from "./components/newProviderForm";
import RideRequestComponent from "./components/requestsComponent";
import { OfferController } from "@/app/(controller)/rideSharing/offerController";
import ListingComponent from "./components/listingComponent";
import SimplifiedRideHub from './components/SimplifiedRideHub';
import Link from "next/link";

interface SearchData {
  userMode: 'driver' | 'traveler';
  pickupLocation: {
    coordinates: {
      lat: number;
      lng: number;
    };
    address: string;
  };
  dropoffLocation: {
    coordinates: {
      lat: number;
      lng: number;
    };
    address: string;
  };
  date: string;
  timeRange: {
    start: string;
    end: string;
  };
  priceRange: {
    min: number;
    max: number;
  };
  travelers: number;
  luggage: number;
  timestamp: string;
}

export default async function Page(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }
) {
  const searchParams = await props.searchParams;
  const safeParseFloat = (value: string | string[] | undefined, defaultValue: number = 0): number => {
    if (!value || Array.isArray(value)) return defaultValue;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  const safeParseInt = (value: string | string[] | undefined, defaultValue: number = 0): number => {
    if (!value || Array.isArray(value)) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  const safeGetString = (value: string | string[] | undefined, defaultValue: string = ''): string => {
    if (!value) return defaultValue;
    if (Array.isArray(value)) return value[0] || defaultValue;
    try {
      return decodeURIComponent(value);
    } catch (error) {
      console.warn('Failed to decode URI component:', value, error);
      return value;
    }
  };

  const isValidCoordinate = (lat: number, lng: number): boolean => {
    return lat !== 0 && lng !== 0 &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180;
  };

  const isValidTimeFormat = (time: string): boolean => {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  };

  const isValidDateFormat = (date: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  };

  let searchData: SearchData | null = null;
  let parseError: string | null = null;

  try {
    const pickLat = safeParseFloat(searchParams.pickLat);
    const pickLng = safeParseFloat(searchParams.pickLng);
    const dropLat = safeParseFloat(searchParams.dropLat);
    const dropLng = safeParseFloat(searchParams.dropLng);

    if (!isValidCoordinate(pickLat, pickLng)) {
      throw new Error('Invalid pickup coordinates');
    }
    if (!isValidCoordinate(dropLat, dropLng)) {
      throw new Error('Invalid dropoff coordinates');
    }

    const date = safeGetString(searchParams.date);
    const timeStart = safeGetString(searchParams.timeStart, '09:00');
    const timeEnd = safeGetString(searchParams.timeEnd, '17:00');
    const priceMin = safeParseFloat(searchParams.priceMin, 0);
    const priceMax = safeParseFloat(searchParams.priceMax, 100);
    const travelers = safeParseInt(searchParams.travelers, 1);
    const luggage = safeParseInt(searchParams.luggage, 0);

    if (date && !isValidDateFormat(date)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }

    if (!isValidTimeFormat(timeStart) || !isValidTimeFormat(timeEnd)) {
      throw new Error('Invalid time format. Expected HH:MM');
    }

    if (timeStart >= timeEnd) {
      throw new Error('Start time must be before end time');
    }

    if (priceMin < 0 || priceMax < 0 || priceMin > priceMax) {
      throw new Error('Invalid price range');
    }

    if (travelers < 1 || travelers > 10) {
      throw new Error('Invalid number of travelers (1-10)');
    }
    if (luggage < 0 || luggage > 20) {
      throw new Error('Invalid luggage count (0-20)');
    }

    // Get user mode from search params
    const userModeParam = safeGetString(searchParams.userMode, 'traveler');
    const userMode: 'driver' | 'traveler' = userModeParam === 'driver' ? 'driver' : 'traveler';

    searchData = {
      userMode: userMode,
      pickupLocation: {
        coordinates: {
          lat: pickLat,
          lng: pickLng
        },
        address: safeGetString(searchParams.pickAddress)
      },
      dropoffLocation: {
        coordinates: {
          lat: dropLat,
          lng: dropLng
        },
        address: safeGetString(searchParams.dropAddress)
      },
      date: date,
      timeRange: {
        start: timeStart,
        end: timeEnd
      },
      priceRange: {
        min: priceMin,
        max: priceMax
      },
      travelers: travelers,
      luggage: luggage,
      timestamp: safeGetString(searchParams.timestamp)
    };

    console.log("Search Data:", searchData);

  } catch (error) {
    console.error("Error parsing search parameters:", error);
    parseError = error instanceof Error ? error.message : 'Unknown error occurred';

  }

  if (parseError || !searchData) {
    console.error("Parse error or no search data:", parseError);
    return (
      <div>
        <h1 className="text-2xl font-bold text-red-600">Search Parameter Error</h1>
        <p className="text-gray-700 mt-2">{parseError || 'Could not process search data.'}</p>
        <p className="text-sm text-gray-500 mt-4">
          Please go back and try your search again with valid parameters.
        </p>
        <Link href="/rideSharing/maps">click here</Link>

      </div>
    );
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      redirect("/api/auth/signin");
    }

    const rideListingController = container.resolve(RideListingController);
    const rideRequestController = container.resolve(RideRequestController);
    const userController = container.resolve(UserController);
    const offerController = container.resolve(OfferController);

    // Get user data and validate
    const userData = await userController.getUserById(session.user.id);

    if (!userData) {
      redirect("/api/auth/signin");
    }

    const searchLat = searchData.pickupLocation.coordinates.lat;
    const searchLng = searchData.pickupLocation.coordinates.lng;
    const searchRadius = 18000000; // 18,000 km radius

    const rideRequests: RideRequest[] = await rideRequestController.getNearByRideRequests(
      searchLat,
      searchLng,
      searchRadius,
      searchData.dropoffLocation.coordinates.lat,
      searchData.dropoffLocation.coordinates.lng
    );

    const rideListings: RideListing[] = await rideListingController.getNearByRideListing(
      searchLat,
      searchLng,
      searchRadius,
      searchData.dropoffLocation.coordinates.lat,
      searchData.dropoffLocation.coordinates.lng,
      searchData.date,
      searchData.timeRange,
      searchData.priceRange,
      searchData.travelers,
      searchData.luggage
    );

    const offers = await offerController.getReceivedOffers(session.user.id);


    // Check if user is a transportation provider
    const isTransportationProvider = userData.roles.some(role => role === "transportationProvider");

    return (
      <div>
        <SimplifiedRideHub 
          rideListings={rideListings} 
          rideRequests={rideRequests}
          initialMode={searchData.userMode}
          isTransportationProvider={isTransportationProvider}
        />
      </div>
    );

  } catch (error) {
    console.error("Error in main page logic:", error);
    return (
      <div>
        <h1 className="text-2xl font-bold text-red-600">Application Error</h1>
        <p className="text-gray-700 mt-2">
          An error occurred while loading the page. Please try again later. Go back to the search page.
          <Link href="/src/app/(view)/rideSharing/maps/page.tsx"></Link>
        </p>
      </div>
    );
  }
}

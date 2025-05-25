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

interface SearchData {
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

export default async function Page({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  // Helper function to safely parse float values
  const safeParseFloat = (value: string | string[] | undefined, defaultValue: number = 0): number => {
    if (!value || Array.isArray(value)) return defaultValue;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // Helper function to safely parse int values
  const safeParseInt = (value: string | string[] | undefined, defaultValue: number = 0): number => {
    if (!value || Array.isArray(value)) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // Helper function to safely get string values
  const safeGetString = (value: string | string[] | undefined, defaultValue: string = ''): string => {
    if (!value) return defaultValue;
    if (Array.isArray(value)) return value[0] || defaultValue;
    try {
      return decodeURIComponent(value);
    } catch (error) {
      console.warn('Failed to decode URI component:', value, error);
      return value; // Return original value if decoding fails
    }
  };

  // Helper function to validate coordinates
  const isValidCoordinate = (lat: number, lng: number): boolean => {
    return lat !== 0 && lng !== 0 && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
  };

  // Helper function to validate time format
  const isValidTimeFormat = (time: string): boolean => {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  };

  // Helper function to validate date format
  const isValidDateFormat = (date: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  };

  let searchData: SearchData | null = null;
  let parseError: string | null = null;

  try {
    // Parse coordinates with validation
    const pickLat = safeParseFloat(searchParams.pickLat);
    const pickLng = safeParseFloat(searchParams.pickLng);
    const dropLat = safeParseFloat(searchParams.dropLat);
    const dropLng = safeParseFloat(searchParams.dropLng);

    // Validate coordinates
    if (!isValidCoordinate(pickLat, pickLng)) {
      throw new Error('Invalid pickup coordinates');
    }
    if (!isValidCoordinate(dropLat, dropLng)) {
      throw new Error('Invalid dropoff coordinates');
    }

    // Parse other parameters
    const date = safeGetString(searchParams.date);
    const timeStart = safeGetString(searchParams.timeStart, '09:00');
    const timeEnd = safeGetString(searchParams.timeEnd, '17:00');
    const priceMin = safeParseFloat(searchParams.priceMin, 0);
    const priceMax = safeParseFloat(searchParams.priceMax, 100);
    const travelers = safeParseInt(searchParams.travelers, 1);
    const luggage = safeParseInt(searchParams.luggage, 0);

    // Validate date format
    if (date && !isValidDateFormat(date)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }

    // Validate time format
    if (!isValidTimeFormat(timeStart) || !isValidTimeFormat(timeEnd)) {
      throw new Error('Invalid time format. Expected HH:MM');
    }

    // Validate time range
    if (timeStart >= timeEnd) {
      throw new Error('Start time must be before end time');
    }

    // Validate price range
    if (priceMin < 0 || priceMax < 0 || priceMin > priceMax) {
      throw new Error('Invalid price range');
    }

    // Validate travelers and luggage
    if (travelers < 1 || travelers > 10) {
      throw new Error('Invalid number of travelers (1-10)');
    }
    if (luggage < 0 || luggage > 20) {
      throw new Error('Invalid luggage count (0-20)');
    }

    searchData = {
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

  // If there's a parse error, redirect to search page or show error
  if (parseError) {
    console.error("Parse error:", parseError);
    // You might want to redirect to a search page or show an error component
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-600">Search Parameter Error</h1>
        <p className="text-gray-700 mt-2">{parseError}</p>
        <p className="text-sm text-gray-500 mt-4">
          Please go back and try your search again with valid parameters.
        </p>
      </div>
    );
  }

  try {
    // Get session and validate user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      redirect("/api/auth/signin");
    }

    // Initialize controllers
    const rideListingController = container.resolve(RideListingController);
    const rideRequestController = container.resolve(RideRequestController);
    const transformationProviderController = container.resolve(TransformationProviderController);
    const userController = container.resolve(UserController);
    const offerController = container.resolve(OfferController);

    // Get user data and validate
    const userData = await userController.getUserById(session.user.id);
    
    if (!userData) {
      redirect("/api/auth/signin");
    }

    // Check if user is a transportation provider
    if (!userData.roles.some(role => role === "transportationProvider")) {
      return <TransportationProviderForm />;
    }

    // Use search coordinates if available, otherwise use default coordinates
    const searchLat = searchData?.pickupLocation.coordinates.lat || 37.42564360372425;
    const searchLng = searchData?.pickupLocation.coordinates.lng || -122.098366767168;
    const searchRadius = 18000000; // 18,000 km radius

    // Fetch ride requests and listings based on search parameters
    const rideRequests: RideRequest[] = await rideRequestController.getNearByRideRequests(
      searchLat,
      searchLng,
      searchRadius
    );

    const rideListings: RideListing[] = await rideListingController.getNearByRideListing(
      searchLat,
      searchLng,
      searchRadius
    );

    // Get user's offers
    const offers = await offerController.getReceivedOffers(session.user.id);

    // You can now use the searchData to filter results further if needed
    // For example, filter by date, price range, etc.

    return (
      <div>
        {/* You can uncomment and use these components as needed */}
        {/* <ClientComponent 
          rideRequests={rideRequests} 
          rideListings={rideListings}
          userData={userData}
          searchData={searchData}
        /> */}

        {/* <ListingComponent rideListings={rideListings}/> */}

        <RideRequestComponent rideRequests={rideRequests}/>
        
        {/* Debug information - remove in production */}
        {process.env.NODE_ENV === 'development' && searchData && (
          <div className="mt-8 p-4 bg-gray-100 rounded">
            <h3 className="font-bold">Search Parameters:</h3>
            <pre className="text-sm mt-2 overflow-auto">
              {JSON.stringify(searchData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );

  } catch (error) {
    console.error("Error in main page logic:", error);
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-600">Application Error</h1>
        <p className="text-gray-700 mt-2">
          An error occurred while loading the page. Please try again later.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="text-sm mt-4 text-red-600">
            {error instanceof Error ? error.message : 'Unknown error'}
          </pre>
        )}
      </div>
    );
  }
}
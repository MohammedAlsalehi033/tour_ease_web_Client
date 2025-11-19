"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { container } from '@/app/lib/diContainer';
import { UserController } from '@/app/(controller)/user/userController';
import { TransformationProviderController } from '@/app/(controller)/rideSharing/transportationProviderContrroller';
import { AccommodationController } from '@/app/(controller)/accommodation/accommodationController';
import { User } from '@/app/(model)/user/userModel';
import OtherAvatarPic from '../../components/otherAvatarPic';
import ReportUserButton from '../../components/ReportUserButton';
import ProviderRatingDisplay from '../../components/ProviderRatingDisplay';
import DriverReviewsSection from '../../components/DriverReviewsSection';
import { Home, MapPin, Users, Calendar, Star } from 'lucide-react';
import Image from 'next/image';

// This is the page that displays another user's profile.
const UserProfilePage = ({ params }: { params: { id: string } }) => {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [userData, setUserData] = useState<User | null>(null);
  const [transportationProviderData, setTransportationProviderData] = useState<any>(null);
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // We will need controllers to fetch user and provider data.
        const userController = container.resolve(UserController);
        const transportationProviderController = container.resolve(TransformationProviderController);
        const accommodationController = container.resolve(AccommodationController);

        // Fetch the user's data using the ID from the URL params.
        const user = await userController.getUserById(params.id);
        setUserData(user);

        // Try to fetch transportation provider data
        try {
          const provider = await transportationProviderController.getTransformationProviderById(params.id);
          setTransportationProviderData(provider);
        } catch (err) {
          console.log("User is not a transportation provider");
        }

        // Try to fetch accommodation provider data
        try {
          const accommodationsResult = await accommodationController.getAllAccommodations({ providerId: params.id });
          if (accommodationsResult.data && accommodationsResult.data.length > 0) {
            setAccommodations(accommodationsResult.data);
          }
        } catch (err) {
          console.log("User is not an accommodation provider or has no listings");
        }
      } catch (error) {
        console.error("Error fetching user or provider data:", error);
        setError("Could not load user profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-headline-md text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-headline-md text-gray-500">{error || "User not found."}</p>
      </div>
    );
  }  return (
    <div className="font-sans text-gray-900 dark:text-gray-100 p-4 md:p-8">
      <div className="">
        
        {/* User Profile Card */}
          <div className="card shadow-lg rounded-lg p-6 mb-8 dark:border-dark-outline border border-light-outline ">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <OtherAvatarPic imageUrl={userData.mediaUrls[0]} otherUserId={userData.id}/>
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-display text-headline-lg font-bold mb-2">{userData.username || "User"}</h1>
              
              <div className="space-y-3 mt-4">
                <div>
                  <p className="font-sans text-body-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-sans text-body-lg">{userData.email || "No email provided"}</p>
                </div>
                
                <div>
                    <p className="font-sans text-body-sm text-gray-500 dark:text-gray-400">User ID</p>
                    <p className="font-mono text-body-md bg-gray-100 dark:bg-gray-700 p-1 rounded inline-block">{params.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Provider Details Card */}
        {transportationProviderData && (
          <div className="card shadow-lg rounded-lg p-6 mb-8 dark:border-dark-outline border border-light-outline ">
            <h2 className="font-display text-headline-md font-bold mb-4">Provider Details</h2>
            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-sans text-body-sm text-gray-500 dark:text-gray-400">Vehicle Type</p>
                <p className="font-sans text-body-lg">{transportationProviderData.vehicleType || "Not specified"}</p>
              </div>
              <div>
                <p className="font-sans text-body-sm text-gray-500 dark:text-gray-400">Seats Available</p>
                <p className="font-sans text-body-lg">{transportationProviderData.seatsAvailable ?? "Not specified"}</p>
              </div>
              <div>
                <p className="font-sans text-body-sm text-gray-500 dark:text-gray-400">Account Status</p>
                <p className={`font-sans text-body-lg font-semibold ${transportationProviderData.accountStatus === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                  {transportationProviderData.accountStatus || "Not specified"}
                </p>
              </div>
              <div>
                <p className="font-sans text-body-sm text-gray-500 dark:text-gray-400">Member Since</p>
                <p className="font-sans text-body-lg">
                  {transportationProviderData.createdAt 
                    ? new Date(transportationProviderData.createdAt).toLocaleDateString() 
                    : "Not specified"}
                </p>
              </div>
              <div>
                <p className="font-sans text-body-sm text-gray-500 dark:text-gray-400">Rating</p>
                <ProviderRatingDisplay providerId={params.id} />
              </div>
            </div>
          </div>
        )}

        {/* Driver Reviews Section */}
        {transportationProviderData && (
          <div className="card shadow-lg rounded-lg p-6 mb-8 dark:border-dark-outline border border-light-outline">
            <DriverReviewsSection 
              driverId={params.id}
              driverName={userData?.username || "User"}
            />
          </div>
        )}

        {/* Accommodation Listings Section */}
        {accommodations.length > 0 && (
          <div className="card shadow-lg rounded-lg p-6 mb-8 dark:border-dark-outline border border-light-outline">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-headline-md font-bold">Accommodation Listings</h2>
                <p className="text-body-sm text-gray-500 dark:text-gray-400">
                  {accommodations.length} propert{accommodations.length === 1 ? 'y' : 'ies'} available
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {accommodations.map((accommodation) => (
                <div 
                  key={accommodation.id}
                  className="group bg-gradient-to-br from-light-surface to-light-surface/80 dark:from-dark-surface dark:to-dark-surface/80 rounded-2xl border border-light-outline dark:border-dark-outline hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => window.location.href = `/accommodations/${accommodation.id}`}
                >
                  {/* Image */}
                  <div className="relative h-48 w-full overflow-hidden">
                    {accommodation.mediaUrls && accommodation.mediaUrls.length > 0 ? (
                      <Image
                        src={accommodation.mediaUrls[0].startsWith('http') 
                          ? accommodation.mediaUrls[0] 
                          : `${process.env.NEXT_PUBLIC_API_BASE_URL}/${accommodation.mediaUrls[0]}`
                        }
                        alt={accommodation.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Home className="w-16 h-16 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-lg">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold">4.5</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-light-on-surface dark:text-dark-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                        {accommodation.name}
                      </h3>
                      <div className="flex items-start gap-1.5 mt-1">
                        <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {accommodation.location}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {accommodation.description}
                    </p>

                    {/* Room Info */}
                    {accommodation.rooms && accommodation.rooms.length > 0 && (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{accommodation.rooms.length} room{accommodation.rooms.length > 1 ? 's' : ''}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">From</p>
                          <p className="text-lg font-bold text-primary">
                            PKR {Math.min(...accommodation.rooms.map((r: any) => Number(r.pricePerNight))).toLocaleString()}
                            <span className="text-xs font-normal">/night</span>
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Listed {new Date(accommodation.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions Card */}
        <div className="card shadow-lg rounded-lg p-6 mb-8 dark:border-dark-outline border border-light-outline ">
          <h2 className="font-display text-headline-md font-bold mb-4">Actions</h2>
          <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            {/* Chat Button */}
            <button
              onClick={() => {
                // Navigate to chat with this user
                window.location.href = `/chats/${params.id}`;
              }}
              className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-variant transition-colors duration-200 min-w-[140px]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Message
            </button>
            
            {/* Report Button */}
            <ReportUserButton 
              userId={params.id} 
              userName={userData?.username || "this user"}
              currentUserId={currentUserId}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfilePage;

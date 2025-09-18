import 'reflect-metadata';

import React from 'react'

import { container } from '@/app/lib/diContainer';
import { OfferController } from '../../(controller)/rideSharing/offerController';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { 
  Bell, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle, 
  XCircle, 
  MessageCircle,
  ArrowRight,
  User
} from 'lucide-react';
import { TransportationOffer } from '@/app/(model)/rideSharing/offer/offerModel';
import Link from 'next/link';
import AcceptButton from './components/acceptButton';
import RejectButton from './components/rejectButton';
import { off } from 'process';
import OtherAvatarPic from '../components/otherAvatarPic';

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const getTimeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const getPriceDisplay = (price) => {
  return `PKR ${price}`;
};

const getStatusBadgeStyles = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 'accepted':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};


const NotificationCard = ({ offer } : { offer: TransportationOffer }) => {
  const isListingOffer = offer.transportationListingId !== null;
  const routeInfo = isListingOffer ? offer.listing : offer.request;
  
  return (
    <div className="card p-6 rounded-lg border border-light-outline dark:border-dark-outline bg-light-surface dark:bg-dark-surface mb-4 ">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium mr-3">
            <OtherAvatarPic imageUrl={offer.sender?.mediaUrls?.[0]} otherUserId={offer.senderId} userName={offer.sender?.username} />
          </div>
          <div>
            <h3 className="text-title-md font-medium text-light-on-surface dark:text-dark-on-surface">
              {isListingOffer ? 'Ride Booking Request' : 'Ride Offer'}
            </h3>
            <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              From {offer.sender?.username || 'Unknown User'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyles(offer.status)}`}>
            {offer.status.toUpperCase()}
          </span>
          <span className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
            {getTimeAgo(offer.listing?.departureTime)}
          </span>
        </div>
      </div>

      {/* Route Information */}
      <div className="mb-4 p-4 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30">
        <div className="flex items-start mb-3">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">From</p>
            <p className="text-body-md font-medium text-light-on-surface dark:text-dark-on-surface">
              {routeInfo?.startLocationText}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center mb-3">
          <ArrowRight className="w-5 h-5 text-light-on-surface-variant dark:text-dark-on-surface-variant" />
        </div>
        
        <div className="flex items-start">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">To</p>
            <p className="text-body-md font-medium text-light-on-surface dark:text-dark-on-surface">
              {routeInfo?.endLocationText}
            </p>
          </div>
        </div>
      </div>

      {/* Trip Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30">
          <div className="flex items-center mb-1">
            <Calendar className="w-4 h-4 text-primary mr-1" />
            <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">Date</p>
          </div>
          <p className="text-body-sm font-medium text-light-on-surface dark:text-dark-on-surface">
            {formatDate(routeInfo?.departureTime)}
          </p>
        </div>
        
        <div className="p-3 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30">
          <div className="flex items-center mb-1">
            <Clock className="w-4 h-4 text-primary mr-1" />
            <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">Time</p>
          </div>
          <p className="text-body-sm font-medium text-light-on-surface dark:text-dark-on-surface">
            {formatTime(routeInfo?.departureTime)}
          </p>
        </div>
        
        <div className="p-3 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30">
          <div className="flex items-center mb-1">
            <DollarSign className="w-4 h-4 text-primary mr-1" />
            <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">Price</p>
          </div>
          <p className="text-body-sm font-medium text-primary">
            {getPriceDisplay(offer.pricePerSeat)}
          </p>
        </div>
        
        <div className="p-3 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30">
          <div className="flex items-center mb-1">
            <Users className="w-4 h-4 text-primary mr-1" />
            <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">Seats</p>
          </div>
          <p className="text-body-sm font-medium text-light-on-surface dark:text-dark-on-surface">
            {offer.seatsRequested} {isListingOffer ? 'requested' : 'offered'}
          </p>
        </div>
      </div>

      {/* Message */}
      {offer.message && (
        <div className="mb-4 p-3 rounded-lg bg-light-surface-variant/20 dark:bg-dark-surface-variant/20">
          <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">Message:</p>
          <p className="text-body-md text-light-on-surface dark:text-dark-on-surface italic">
            "{offer.message}"
          </p>
        </div>
      )}

      {/* Action Buttons - Only show for pending offers */}
      {offer.status === 'pending' && offer.isOutDated === false && (
        <div className="flex gap-3 flex-row sm:flex-col">
          
          <AcceptButton offer={offer} />
          <RejectButton offer={offer} />

          <Link href={`/chats/${offer.senderId}`} className="btn-outlined py-3 px-4 rounded-full border border-light-outline dark:border-dark-outline text-light-on-surface dark:text-dark-on-surface font-medium flex items-center justify-center hover:bg-light-surface-variant/30 dark:hover:bg-dark-surface-variant/30 transition-colors">
            <button>
              <MessageCircle className="w-4 h-4" />
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

const page = async () => {
  const offerController = container.resolve(OfferController);
  const session = await getServerSession(authOptions);
  
  let offers: TransportationOffer[] = [];
  try {
    console.log('Received offers:', offers);
    offers = await offerController.getReceivedOffers(session?.user?.id);

    offers = offers.map(offer => ({
      ...offer,
      isOutDated: new Date(offer.listing?.departureTime ?? '') < new Date(Date.now()) 
        && offer.status === 'pending'
    }));
  } catch (error)   {
    console.error('Error fetching offers:', error);
  }

  // Split offers into active and outdated
  const activeOffers = offers.filter(offer => !offer.isOutDated);
  const outdatedOffers = offers.filter(offer => offer.isOutDated);

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background transition-colors duration-300 py-8">
      <div className="px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-headline-lg font-bold text-light-on-surface dark:text-dark-on-surface">
                Notifications
              </h1>
              <p className="text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Manage your ride offers and requests
              </p>
            </div>
          </div>
          {activeOffers.length > 0 && (
            <div className="flex items-center mt-4">
              <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
                {activeOffers.length} {activeOffers.length === 1 ? 'notification' : 'notifications'}
              </span>
            </div>
          )}
        </div>

        {/* Organized Notifications by Category */}
        {activeOffers.length > 0 ? (
          <>
            {/* Ride Booking Requests */}
            <div className="mt-8">
              <h2 className="text-title-md font-semibold mb-4 text-primary">Ride Booking Requests</h2>
              <div className="space-y-4">
                {activeOffers.filter(o => o.transportationListingId !== null).length === 0 && (
                  <div className="text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">No ride booking requests.</div>
                )}
                {activeOffers.filter(o => o.transportationListingId !== null).map(offer => (
                  <NotificationCard key={offer.id} offer={offer} />
                ))}
              </div>
            </div>

            {/* Ride Offers */}
            <div className="mt-12">
              <h2 className="text-title-md font-semibold mb-4 text-green-600 dark:text-green-400">Ride Offers</h2>
              <div className="space-y-4">
                {activeOffers.filter(o => o.transportationListingId === null).length === 0 && (
                  <div className="text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">No ride offers.</div>
                )}
                {activeOffers.filter(o => o.transportationListingId === null).map(offer => (
                  <NotificationCard key={offer.id} offer={offer} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="card p-12 rounded-lg border border-light-outline dark:border-dark-outline text-center bg-light-surface dark:bg-dark-surface">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h2 className="text-title-lg mb-3 text-light-on-surface dark:text-dark-on-surface">
              No notifications yet
            </h2>
            <p className="text-body-lg mb-6 text-light-on-surface-variant dark:text-dark-on-surface-variant max-w-md mx-auto">
              When someone sends you a ride offer or requests to book your ride, you'll see it here.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="btn-primary py-3 px-6 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors">
                Browse Rides
              </button>
              <button className="btn-outlined py-3 px-6 rounded-full border border-light-outline dark:border-dark-outline text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-variant/30 dark:hover:bg-dark-surface-variant/30 transition-colors">
                Create Listing
              </button>
            </div>
          </div>
        )}

        {/* Outdated Notifications Section */}
        {outdatedOffers.length > 0 && (
          <div className="mt-12">
            <h2 className="text-title-md font-semibold mb-4 text-light-on-surface dark:text-dark-on-surface">
              Outdated Notifications
            </h2>
            <div className="space-y-4">
              {outdatedOffers.map(offer => (
                <NotificationCard key={offer.id} offer={offer} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default page;
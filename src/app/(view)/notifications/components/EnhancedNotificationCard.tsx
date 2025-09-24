'use client';

import React from 'react';
import Link from 'next/link';
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
  User,
  CheckCircle2
} from 'lucide-react';
import { TransportationOffer } from '@/app/(model)/rideSharing/offer/offerModel';
import AcceptButton from './acceptButton';
import RejectButton from './rejectButton';
import OtherAvatarPic from '../../components/otherAvatarPic';

interface EnhancedNotificationCardProps {
  offer: TransportationOffer & {
    isOutDated?: boolean;
    sender?: {
      username?: string;
      mediaUrls?: string[];
    };
  };
  isSelected: boolean;
  onSelect: (offerId: number) => void;
  searchTerm: string;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const getTimeAgo = (dateString: string) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const getPriceDisplay = (price: string | number) => {
  return `PKR ${price}`;
};

const getStatusBadgeStyles = (status: string) => {
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

// Helper function to highlight search terms
const highlightSearchTerm = (text: string, searchTerm: string) => {
  if (!searchTerm || !text) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 dark:bg-yellow-800/40 rounded px-1">
        {part}
      </mark>
    ) : part
  );
};

const EnhancedNotificationCard: React.FC<EnhancedNotificationCardProps> = ({
  offer,
  isSelected,
  onSelect,
  searchTerm
}) => {
  const isListingOffer = offer.transportationListingId !== null;
  const routeInfo = isListingOffer ? offer.listing : offer.request;
  
  return (
    <div className={`card p-6 rounded-lg border transition-all duration-200 mb-4 ${
      isSelected 
        ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]' 
        : 'border-light-outline dark:border-dark-outline bg-light-surface dark:bg-dark-surface hover:shadow-md hover:scale-[1.01]'
    }`}>
      {/* Header with Selection */}
      <div className="flex items-start mb-4">
        {/* Selection Checkbox */}
        <button
          onClick={() => onSelect(offer.id)}
          className="mr-4 mt-2"
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isSelected 
              ? 'bg-primary border-primary text-white' 
              : 'border-light-outline dark:border-dark-outline hover:border-primary'
          }`}>
            {isSelected && <CheckCircle2 className="w-3 h-3" />}
          </div>
        </button>
        
        <div className="flex justify-between items-start flex-1">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium mr-3">
              <OtherAvatarPic 
                imageUrl={offer.sender?.mediaUrls?.[0]} 
                otherUserId={offer.senderId} 
                userName={offer.sender?.username} 
              />
            </div>
            <div>
              <h3 className="text-title-md font-medium text-light-on-surface dark:text-dark-on-surface">
                {highlightSearchTerm(
                  isListingOffer ? 'Ride Booking Request' : 'Ride Offer', 
                  searchTerm
                )}
              </h3>
              <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                From {highlightSearchTerm(offer.sender?.username || 'Unknown User', searchTerm)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyles(offer.status)}`}>
              {offer.status.toUpperCase()}
            </span>
            <span className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
              {getTimeAgo(offer.listing?.departureTime || offer.request?.departureTime || '')}
            </span>
          </div>
        </div>
      </div>

      {/* Route Information */}
      <div className="mb-4 p-4 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30 ml-9">
        <div className="flex items-start mb-3">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">From</p>
            <p className="text-body-md font-medium text-light-on-surface dark:text-dark-on-surface">
              {highlightSearchTerm(routeInfo?.startLocationText || '', searchTerm)}
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
              {highlightSearchTerm(routeInfo?.endLocationText || '', searchTerm)}
            </p>
          </div>
        </div>
      </div>

      {/* Trip Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 ml-9">
        <div className="p-3 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30">
          <div className="flex items-center mb-1">
            <Calendar className="w-4 h-4 text-primary mr-1" />
            <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">Date</p>
          </div>
          <p className="text-body-sm font-medium text-light-on-surface dark:text-dark-on-surface">
            {formatDate(routeInfo?.departureTime || '')}
          </p>
        </div>
        
        <div className="p-3 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30">
          <div className="flex items-center mb-1">
            <Clock className="w-4 h-4 text-primary mr-1" />
            <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">Time</p>
          </div>
          <p className="text-body-sm font-medium text-light-on-surface dark:text-dark-on-surface">
            {formatTime(routeInfo?.departureTime || '')}
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
        <div className="mb-4 p-3 rounded-lg bg-light-surface-variant/20 dark:bg-dark-surface-variant/20 ml-9">
          <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">Message:</p>
          <p className="text-body-md text-light-on-surface dark:text-dark-on-surface italic">
            "{highlightSearchTerm(offer.message, searchTerm)}"
          </p>
        </div>
      )}

      {/* Action Buttons - Only show for pending offers */}
      {offer.status === 'pending' && offer.isOutDated === false && (
        <div className="flex gap-3 flex-row sm:flex-col ml-9">
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

export default EnhancedNotificationCard;
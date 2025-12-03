"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import Image from 'next/image';
import {
  MapPin,
  Star,
  Heart,
  Wifi,
  Car,
  Utensils,
  Waves,
  Users,
  Bed,
  Calendar,
  Banknote,
  ArrowLeft,
  Check,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  Phone,
  Mail,
  Share2,
  AlertCircle,
} from 'lucide-react';
import { container } from '@/app/lib/diContainer';
import { AccommodationController } from '@/app/(controller)/accommodation/accommodationController';
import { PaymentController } from '@/app/(controller)/payment/paymentController';
import { ReviewController } from '@/app/(controller)/review/reviewController';
import { ReportController } from '@/app/(controller)/report/reportController';
import type { CreateReportData, ReportableType } from '@/app/(model)/report/reportModel';
import { Accommodation, Room } from '@/app/(model)/accommodation/accommodationModel';
import { Review, ReviewStats } from '@/app/(model)/review/reviewModel';
import RatingDisplay from '../../components/RatingDisplay';
import { normalizeImageUrl, DEFAULT_IMAGE_PLACEHOLDER } from '@/app/lib/mediaUtils';
import { useSession } from 'next-auth/react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const PaymentForm = ({
  totalPrice,
  onSuccess,
  onCancel,
}: {
  totalPrice: number;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { data: session } = useSession();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paymentController = container.resolve(PaymentController);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // Step 1: Create payment intent
      const intentResult = await paymentController.createPaymentIntent({
        amount: totalPrice,
        currency: 'pkr',
        customerEmail: session?.user?.email || '',
      });

      if (!intentResult.success) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = intentResult.data as any;

      // Step 2: Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: session?.user?.name || '',
            email: session?.user?.email || '',
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Payment successful
      onSuccess(paymentIntentId);
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      <div className="p-4 border border-light-outline dark:border-dark-outline rounded-lg">
        <label className="block text-sm font-medium mb-2 text-light-on-surface dark:text-dark-on-surface">
          Card Details
        </label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
              invalid: { color: '#9e2146' },
            },
          }}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 py-3 rounded-lg border border-light-outline dark:border-dark-outline hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 btn-primary py-3 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <span>Pay PKR {totalPrice.toLocaleString()}</span>
          )}
        </button>
      </div>
    </form>
  );
};

const SafeAccommodationImage = ({
  src,
  alt,
}: {
  src?: string | null;
  alt: string;
}) => {
  const [currentSrc, setCurrentSrc] = useState(src ?? DEFAULT_IMAGE_PLACEHOLDER);

  useEffect(() => {
    setCurrentSrc(src ?? DEFAULT_IMAGE_PLACEHOLDER);
  }, [src]);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
      onError={() => {
        if (currentSrc !== DEFAULT_IMAGE_PLACEHOLDER) {
          setCurrentSrc(DEFAULT_IMAGE_PLACEHOLDER);
        }
      }}
    />
  );
};

const ReviewerAvatar = ({
  mediaUrl,
  username,
}: {
  mediaUrl?: string | null;
  username: string;
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    setImgError(false);
    if (mediaUrl) {
      try {
        const normalized = normalizeImageUrl(mediaUrl);
        setImgSrc(normalized);
      } catch {
        setImgError(true);
      }
    } else {
      setImgSrc(null);
    }
  }, [mediaUrl]);

  if (imgError || !imgSrc) {
    return (
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Users className="w-5 h-5 text-primary" />
      </div>
    );
  }

  return (
    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
      <Image
        src={imgSrc}
        alt={username}
        fill
        className="object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  );
};

export default function AccommodationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const accommodationId = parseInt(params.id as string);

  // Get search parameters from URL
  const urlCheckIn = searchParams.get('checkIn') || '';
  const urlCheckOut = searchParams.get('checkOut') || '';
  const urlGuests = searchParams.get('guests') || '';
  const urlBudget = searchParams.get('budget') || '';
  const urlLocation = searchParams.get('location') || '';

  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [checkInDate, setCheckInDate] = useState(urlCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(urlCheckOut);
  const [numberOfRooms, setNumberOfRooms] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment'>('details');
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const headerRef = useRef(null);
  const aboutRef = useRef(null);
  const amenitiesRef = useRef(null);
  const roomsRef = useRef(null);

  const isAboutInView = useInView(aboutRef, { once: true, margin: "-100px" });
  const isAmenitiesInView = useInView(amenitiesRef, { once: true, margin: "-100px" });
  const isRoomsInView = useInView(roomsRef, { once: true, margin: "-100px" });

  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const headerScale = useTransform(scrollY, [0, 200], [1, 0.95]);

  const accommodationController = container.resolve(AccommodationController);
  const reviewController = container.resolve(ReviewController);

  const fetchAccommodationDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const [accommodationResult, roomsResult] = await Promise.all([
        accommodationController.getAccommodationById(accommodationId),
        accommodationController.getRoomsByAccommodationId(accommodationId),
      ]);

      if (accommodationResult.success) {
        setAccommodation(accommodationResult.data);
      }

      if (roomsResult.success) {
        setRooms(roomsResult.data);
      }
    } catch (err: any) {
      console.error('Error fetching accommodation details:', err);
      setError(err.message || 'Failed to load accommodation details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      
      const [reviewsResult, statsResult] = await Promise.all([
        reviewController.getReviewsForItem('ACCOMMODATION', accommodationId, { page: 1, limit: 10 }),
        reviewController.getReviewStats('ACCOMMODATION', accommodationId),
      ]);

      if (reviewsResult.success) {
        setReviews(reviewsResult.data.reviews || []);
      }

      if (statsResult.success) {
        setReviewStats(statsResult.data);
      }
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccommodationDetails();
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accommodationId]);

  const handleBookRoom = (room: Room) => {
    if (!session) {
      router.push('/login');
      return;
    }
    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!selectedRoom || !session?.user || !checkInDate || !checkOutDate) {
      return;
    }

    try {
      setBookingLoading(true);

      const totalPrice = calculateTotalPrice();

      // Step 1: Create confirmed booking directly with payment ID
      const bookingResult = await accommodationController.createConfirmedBooking({
        travelerId: (session.user as any).id,
        roomId: selectedRoom.id,
        checkInDate,
        checkOutDate,
        totalPrice,
        paymentId: paymentIntentId,
      });

      if (!bookingResult.success) {
        throw new Error('Failed to create confirmed booking');
      }

      // Success - redirect to bookings
      router.push('/bookings');
    } catch (err: any) {
      console.error('Error completing booking:', err);
      alert(err.message || 'Failed to complete booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    if (!checkInDate || !checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }
    setPaymentStep('payment');
  };

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = () => {
    if (!selectedRoom) return 0;
    const nights = calculateNights();
    return parseFloat(selectedRoom.pricePerNight.toString()) * nights * numberOfRooms;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const images = accommodation?.mediaUrls || [];
  const amenityIcons = {
    wifi: Wifi,
    pool: Waves,
    restaurant: Utensils,
    parking: Car,
  };

  // Extract coordinates from location string for map
  const getStaticMapUrl = (location: string) => {
    // For demo, using Karachi coordinates - in production, geocode the address
    const defaultLat = 24.8607;
    const defaultLng = 67.0011;
    
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-l-building+3b82f6(${defaultLng},${defaultLat})/${defaultLng},${defaultLat},13,0/600x400@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: accommodation?.name,
        text: accommodation?.description,
        url: window.location.href,
      });
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const handleReportSubmit = async () => {
    if (!session?.user || !accommodation) {
      router.push('/login');
      return;
    }

    if (!reportReason.trim()) {
      setReportError('Please provide a reason for reporting');
      return;
    }

    if (!reportDescription.trim() || reportDescription.trim().length < 10) {
      setReportError('Please provide a detailed description (at least 10 characters)');
      return;
    }

    try {
      setReportLoading(true);
      setReportError(null);

      const reportController = container.resolve(ReportController);
      const reportData: CreateReportData = {
        reporterId: (session.user as any).id,
        reportableType: 'ACCOMMODATION' as ReportableType,
        reportReason: reportReason.trim(),
        description: reportDescription.trim(),
        accommodationId: accommodation.id,
      };

      const validation = reportController.validateReportData(reportData);
      if (!validation.isValid) {
        setReportError(validation.errors.join(', '));
        return;
      }

      await reportController.createReport(reportData);
      
      // Success - close modal and reset form
      setShowReportModal(false);
      setReportReason('');
      setReportDescription('');
      setReportError(null);
      
      // Show success message
      alert('Report submitted successfully. Our team will review it shortly.');
    } catch (err: any) {
      console.error('Error submitting report:', err);
      setReportError(err.message || 'Failed to submit report');
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !accommodation) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <X className="w-16 h-16 mx-auto mb-4 text-error" />
          <h2 className="text-headline-lg font-bold text-light-on-surface dark:text-dark-on-surface mb-2">
            Error Loading Accommodation
          </h2>
          <p className="text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant mb-4">
            {error || 'Accommodation not found'}
          </p>
          <button
            onClick={() => router.push('/accommodations')}
            className="btn-primary px-6 py-2 rounded-lg"
          >
            Back to Accommodations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      {/* Header */}
      <div className="bg-light-surface dark:bg-dark-surface border-b border-light-outline dark:border-dark-outline">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-primary hover:text-primary-variant transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          
          {/* Search Criteria Summary */}
          {(urlCheckIn || urlCheckOut || urlGuests || urlBudget) && (
            <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant mb-2">
                Your search criteria:
              </p>
              <div className="flex flex-wrap gap-2">
                {urlLocation && (
                  <span className="inline-flex items-center space-x-1 bg-light-surface dark:bg-dark-surface px-2 py-1 rounded text-body-xs">
                    <MapPin className="w-3 h-3" />
                    <span>{urlLocation}</span>
                  </span>
                )}
                {urlCheckIn && (
                  <span className="inline-flex items-center space-x-1 bg-light-surface dark:bg-dark-surface px-2 py-1 rounded text-body-xs">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(urlCheckIn).toLocaleDateString()}</span>
                  </span>
                )}
                {urlCheckOut && (
                  <span className="inline-flex items-center space-x-1 bg-light-surface dark:bg-dark-surface px-2 py-1 rounded text-body-xs">
                    <Calendar className="w-3 h-3" />
                    <span>to {new Date(urlCheckOut).toLocaleDateString()}</span>
                  </span>
                )}
                {urlGuests && (
                  <span className="inline-flex items-center space-x-1 bg-light-surface dark:bg-dark-surface px-2 py-1 rounded text-body-xs">
                    <Users className="w-3 h-3" />
                    <span>{urlGuests}</span>
                  </span>
                )}
                {urlBudget && (
                  <span className="inline-flex items-center space-x-1 bg-light-surface dark:bg-dark-surface px-2 py-1 rounded text-body-xs">
                    <Banknote className="w-3 h-3" />
                    <span>Max PKR {parseFloat(urlBudget).toLocaleString()}/night</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Image Gallery */}
        <div className="relative h-64 sm:h-96 lg:h-[500px] rounded-lg overflow-hidden mb-6">
          {images.length > 0 ? (
            <>
              <SafeAccommodationImage
                src={normalizeImageUrl(images[currentImageIndex])}
                alt={accommodation.name}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((currentImageIndex + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-variant/20" />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Rating */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="font-display text-headline-lg font-bold text-light-on-surface dark:text-dark-on-surface">
                  {accommodation.name}
                </h1>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowReportModal(true)}
                    className="p-2 hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant rounded-full transition-colors"
                    title="Report accommodation"
                  >
                    <AlertCircle className="w-6 h-6 text-light-on-surface-variant dark:text-dark-on-surface-variant" />
                  </button>
                  <button className="p-2 hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant rounded-full transition-colors">
                    <Heart className="w-6 h-6 text-light-on-surface-variant dark:text-dark-on-surface-variant" />
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-light-on-surface-variant dark:text-dark-on-surface-variant">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-body-md">{accommodation.location}</span>
                </div>
                {accommodation.averageRating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span className="text-body-md font-medium">{accommodation.averageRating.toFixed(1)}</span>
                    {accommodation.reviewCount && (
                      <span className="text-body-sm">({accommodation.reviewCount} reviews)</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="font-display text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface mb-3">
                About this place
              </h2>
              <p className="text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                {accommodation.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="card p-6">
              <h2 className="font-display text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface mb-4">
                Amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['wifi', 'pool', 'restaurant', 'parking'].map((amenity) => {
                  const IconComponent = amenityIcons[amenity as keyof typeof amenityIcons];
                  return (
                    <div
                      key={amenity}
                      className="flex items-center space-x-3 p-3 bg-light-surface-variant/30 dark:bg-dark-surface-variant/30 rounded-lg"
                    >
                      <IconComponent className="w-5 h-5 text-primary" />
                      <span className="text-body-md text-light-on-surface dark:text-dark-on-surface capitalize">
                        {amenity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Available Rooms */}
            <div className="card p-6">
              <h2 className="font-display text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface mb-4">
                Available Rooms ({rooms.length})
              </h2>
              
              <div className="space-y-4">
                {rooms.map((room) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-light-outline dark:border-dark-outline rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-display text-headline-sm font-bold text-light-on-surface dark:text-dark-on-surface">
                            {room.roomType}
                          </h3>
                          {urlGuests && (() => {
                            const guestCount = parseInt(urlGuests.split(' ')[0]) || 0;
                            const needsMultiple = guestCount > room.capacity;
                            const roomsNeeded = needsMultiple ? Math.ceil(guestCount / room.capacity) : 1;
                            return needsMultiple ? (
                              <span className="bg-warning/20 text-warning px-2 py-1 rounded text-xs font-medium">
                                {roomsNeeded} rooms needed
                              </span>
                            ) : null;
                          })()}
                        </div>
                        <div className="flex items-center space-x-4 text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>Up to {room.capacity} guests</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Bed className="w-4 h-4" />
                            <span>{room.roomType}</span>
                          </div>
                        </div>
                        {urlBudget && parseFloat(room.pricePerNight.toString()) > parseFloat(urlBudget) && (
                          <div className="mt-2 flex items-center space-x-1 text-body-xs text-error">
                            <Banknote className="w-3 h-3" />
                            <span>Over budget by PKR {(parseFloat(room.pricePerNight.toString()) - parseFloat(urlBudget)).toLocaleString()}/night</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Banknote className="w-5 h-5 text-primary" />
                            <span className="font-display text-headline-sm font-bold text-primary">
                              PKR {parseFloat(room.pricePerNight.toString()).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            per night
                          </p>
                        </div>
                        <button
                          onClick={() => handleBookRoom(room)}
                          className="btn-primary px-4 py-2 rounded-lg text-body-sm whitespace-nowrap"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {rooms.length === 0 && (
                  <p className="text-center text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant py-8">
                    No rooms available at the moment
                  </p>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="card p-6">
              <h2 className="font-display text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface mb-4">
                Guest Reviews
              </h2>

              {reviewsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* Review Stats */}
                  {reviewStats && reviewStats.totalReviews > 0 && (
                    <div className="bg-light-surface-variant/30 dark:bg-dark-surface-variant/30 rounded-lg p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-display text-headline-lg font-bold text-light-on-surface dark:text-dark-on-surface">
                              {reviewStats.averageRating.toFixed(1)}
                            </span>
                            <RatingDisplay rating={reviewStats.averageRating} size="lg" showNumber={false} />
                          </div>
                          <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            Based on {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Rating Distribution */}
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = reviewStats.ratingDistribution[rating] || 0;
                          const percentage = reviewStats.totalReviews > 0 
                            ? (count / reviewStats.totalReviews) * 100 
                            : 0;
                          return (
                            <div key={rating} className="flex items-center space-x-2">
                              <span className="text-body-sm text-light-on-surface dark:text-dark-on-surface w-8">
                                {rating} <Star className="inline w-3 h-3 fill-warning text-warning" />
                              </span>
                              <div className="flex-1 bg-light-surface dark:bg-dark-surface rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-warning h-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant w-12 text-right">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border border-light-outline dark:border-dark-outline rounded-lg p-4"
                        >
                          <div className="flex items-start space-x-3 mb-3">
                            <ReviewerAvatar 
                              mediaUrl={review.reviewer?.mediaUrls?.[0]} 
                              username={review.reviewer?.username || 'Anonymous'} 
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-body-md font-semibold text-light-on-surface dark:text-dark-on-surface">
                                  {review.reviewer?.username || 'Anonymous'}
                                </h4>
                                <span className="text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                                  {formatDate(review.createdAt)}
                                </span>
                              </div>
                              <RatingDisplay rating={review.rating} size="sm" showNumber={false} />
                            </div>
                          </div>
                          <p className="text-body-md text-light-on-surface dark:text-dark-on-surface leading-relaxed ml-13">
                            {review.comment}
                          </p>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Star className="w-12 h-12 text-light-on-surface-variant dark:text-dark-on-surface-variant mx-auto mb-3 opacity-50" />
                        <p className="text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                          No reviews yet. Be the first to review this accommodation!
                        </p>
                      </div>
                    )}
                  </div>

                  {reviews.length > 0 && reviews.length >= 10 && (
                    <div className="mt-6 text-center">
                      <button className="btn-outline px-6 py-2 rounded-lg">
                        Load More Reviews
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-4">
              <h3 className="font-display text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface mb-4">
                Property Information
              </h3>
              <div className="space-y-3 text-body-md">
                <div className="flex items-center justify-between">
                  <span className="text-light-on-surface-variant dark:text-dark-on-surface-variant">Location</span>
                  <span className="text-light-on-surface dark:text-dark-on-surface font-medium">
                    {accommodation.location}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-light-on-surface-variant dark:text-dark-on-surface-variant">Total Rooms</span>
                  <span className="text-light-on-surface dark:text-dark-on-surface font-medium">{rooms.length}</span>
                </div>
                {accommodation.averageRating && (
                  <div className="flex items-center justify-between">
                    <span className="text-light-on-surface-variant dark:text-dark-on-surface-variant">Rating</span>
                    <span className="text-light-on-surface dark:text-dark-on-surface font-medium">
                      {accommodation.averageRating.toFixed(1)} / 5.0
                    </span>
                  </div>
                )}
              </div>

              {/* View on Google Maps Button */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(accommodation.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full btn-outline px-4 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-primary hover:text-white transition-all"
              >
                <MapPin className="w-5 h-5" />
                <span>View on Google Maps</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowReportModal(false);
              setReportError(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface">
                    Report Accommodation
                  </h3>
                  <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Help us maintain quality by reporting issues
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportError(null);
                  }}
                  className="p-2 hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-body-sm font-medium mb-2 text-light-on-surface dark:text-dark-on-surface">
                    Reason for Report *
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="input w-full"
                    disabled={reportLoading}
                  >
                    <option value="">Select a reason</option>
                    <option value="Inaccurate information">Inaccurate information</option>
                    <option value="Safety concerns">Safety concerns</option>
                    <option value="Misleading photos">Misleading photos</option>
                    <option value="Property doesn't exist">Property doesn't exist</option>
                    <option value="Inappropriate content">Inappropriate content</option>
                    <option value="Pricing issues">Pricing issues</option>
                    <option value="Poor maintenance">Poor maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-body-sm font-medium mb-2 text-light-on-surface dark:text-dark-on-surface">
                    Description *
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Please provide details about your concern (minimum 10 characters)"
                    rows={5}
                    className="input w-full resize-none"
                    disabled={reportLoading}
                    minLength={10}
                    maxLength={1000}
                  />
                  <p className="text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1">
                    {reportDescription.length}/1000 characters
                  </p>
                </div>

                {reportError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{reportError}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReportModal(false);
                      setReportError(null);
                    }}
                    disabled={reportLoading}
                    className="flex-1 py-3 rounded-lg border border-light-outline dark:border-dark-outline hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReportSubmit}
                    disabled={reportLoading || !reportReason || !reportDescription}
                    className="flex-1 bg-error text-white py-3 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 hover:bg-error/90 transition-colors"
                  >
                    {reportLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5" />
                        <span>Submit Report</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowBookingModal(false);
              setPaymentStep('details');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface">
                    {paymentStep === 'details' ? 'Book' : 'Payment'} {selectedRoom.roomType}
                  </h3>
                  <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Step {paymentStep === 'details' ? '1' : '2'} of 2
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setPaymentStep('details');
                  }}
                  className="p-2 hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {paymentStep === 'details' ? (
                // Booking Details Form
                <div className="space-y-4">
                  <div>
                    <label className="block text-body-sm font-medium mb-2 text-light-on-surface dark:text-dark-on-surface">
                      Check-in Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="input w-full pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium mb-2 text-light-on-surface dark:text-dark-on-surface">
                      Check-out Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                      <input
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        min={checkInDate || new Date().toISOString().split('T')[0]}
                        className="input w-full pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium mb-2 text-light-on-surface dark:text-dark-on-surface">
                      Number of Rooms
                    </label>
                    <input
                      type="number"
                      value={numberOfRooms}
                      onChange={(e) => setNumberOfRooms(parseInt(e.target.value) || 1)}
                      min="1"
                      className="input w-full"
                    />
                  </div>

                  {checkInDate && checkOutDate && (
                    <div className="bg-light-surface-variant/30 dark:bg-dark-surface-variant/30 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                          {calculateNights()} nights × {numberOfRooms} room(s)
                        </span>
                        <span className="text-body-sm font-medium text-light-on-surface dark:text-dark-on-surface">
                          PKR {(parseFloat(selectedRoom.pricePerNight.toString()) * calculateNights() * numberOfRooms).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-light-outline dark:border-dark-outline">
                        <span className="font-display text-headline-sm font-bold text-light-on-surface dark:text-dark-on-surface">
                          Total
                        </span>
                        <span className="font-display text-headline-sm font-bold text-primary">
                          PKR {calculateTotalPrice().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleProceedToPayment}
                    disabled={!checkInDate || !checkOutDate}
                    className="btn-primary w-full py-3 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Proceed to Payment</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                // Payment Form
                <div className="space-y-4">
                  <div className="bg-light-surface-variant/30 dark:bg-dark-surface-variant/30 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-body-md text-light-on-surface dark:text-dark-on-surface">
                        Total Amount
                      </span>
                      <span className="font-display text-headline-md font-bold text-primary">
                        PKR {calculateTotalPrice().toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Elements stripe={stripePromise}>
                    <PaymentForm
                      totalPrice={calculateTotalPrice()}
                      onSuccess={handlePaymentSuccess}
                      onCancel={() => setPaymentStep('details')}
                    />
                  </Elements>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

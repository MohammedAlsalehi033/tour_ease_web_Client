import React, { useMemo } from 'react';
import { User } from '@/app/(model)/user/userModel';

interface Trip {
  id: string;
  type: 'offered' | 'booked';
  from: string;
  to: string;
  date: string;
  time: string;
  passengers?: number;
  maxPassengers?: number;
  price: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  driverName?: string;
  passengerNames?: string[];
  vehicleInfo?: string;
}

interface UpcomingTripsProps {
  user: User;
  userActivity: {
    isTransportationProvider?: boolean;
    totalTrips?: number;
    upcomingTrips?: Trip[];
  };
}

const UpcomingTrips: React.FC<UpcomingTripsProps> = ({ user, userActivity }) => {
  const trips = useMemo(() => {
    const isProvider = userActivity.isTransportationProvider || user.roles.includes('transportation_provider');
    const isNewUser = !userActivity.totalTrips || userActivity.totalTrips === 0;
    
    // Use actual trips if available, otherwise generate sample trips based on user type
    if (userActivity.upcomingTrips && userActivity.upcomingTrips.length > 0) {
      return userActivity.upcomingTrips;
    }
    
    if (isNewUser) {
      return [];
    } else if (isProvider) {
      // Sample trips for transportation providers
      return [
        {
          id: '1',
          type: 'offered' as const,
          from: 'Downtown Mall',
          to: 'International Airport',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
          time: '09:00',
          passengers: 2,
          maxPassengers: 4,
          price: 35,
          status: 'confirmed' as const,
          passengerNames: ['Sarah M.', 'John D.'],
          vehicleInfo: 'Honda Civic - Silver'
        },
        {
          id: '2',
          type: 'offered' as const,
          from: 'University Campus',
          to: 'Shopping Center',
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // day after tomorrow
          time: '14:30',
          passengers: 0,
          maxPassengers: 3,
          price: 15,
          status: 'pending' as const,
          vehicleInfo: 'Honda Civic - Silver'
        }
      ];
    } else {
      // Sample trips for passengers
      return [
        {
          id: '1',
          type: 'booked' as const,
          from: 'Home',
          to: 'Office Complex',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
          time: '08:30',
          price: 12,
          status: 'confirmed' as const,
          driverName: 'Mike T.',
          vehicleInfo: 'Toyota Camry - Blue'
        },
        {
          id: '2',
          type: 'booked' as const,
          from: 'Mall',
          to: 'Airport',
          date: new Date(Date.now() + 259200000).toISOString().split('T')[0], // 3 days from now
          time: '15:00',
          price: 40,
          status: 'confirmed' as const,
          driverName: 'Lisa K.',
          vehicleInfo: 'SUV - Black'
        }
      ];
    }
  }, [user, userActivity]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    return `${hour12}:${minutes} ${period}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const isProvider = userActivity.isTransportationProvider || user.roles.includes('transportation_provider');
  const isNewUser = !userActivity.totalTrips || userActivity.totalTrips === 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {isProvider ? 'Your Offered Rides' : 'Upcoming Trips'}
        </h2>
        {trips.length > 0 && (
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All
          </button>
        )}
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">
            {isNewUser ? '🚀' : isProvider ? '🚗' : '✈️'}
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {isNewUser 
              ? 'Ready for your first trip?' 
              : isProvider 
                ? 'No rides offered yet' 
                : 'No upcoming trips'
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {isNewUser
              ? 'Search for rides or offer your own to get started!'
              : isProvider
                ? 'Create your first ride offer to start earning.'
                : 'Book a ride to see your upcoming trips here.'
            }
          </p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            {isNewUser 
              ? 'Get Started' 
              : isProvider 
                ? 'Offer a Ride' 
                : 'Find a Ride'
            }
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">
                      {trip.type === 'offered' ? '🚗' : '📍'}
                    </span>
                    <h3 className="font-medium text-gray-800">
                      {trip.from} → {trip.to}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>📅 {formatDate(trip.date)}</span>
                    <span>🕐 {formatTime(trip.time)}</span>
                    <span>💰 ${trip.price}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(trip.status)}`}>
                  {trip.status}
                </span>
              </div>

              {/* Additional details based on trip type */}
              {trip.type === 'offered' && (
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    👥 {trip.passengers || 0}/{trip.maxPassengers} passengers
                    {trip.passengerNames && trip.passengerNames.length > 0 && (
                      <span className="ml-2">• {trip.passengerNames.join(', ')}</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Manage
                    </button>
                  </div>
                </div>
              )}

              {trip.type === 'booked' && (
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    🚗 {trip.driverName} • {trip.vehicleInfo}
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-green-600 hover:text-green-800 font-medium">
                      Contact
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick action based on user type */}
      {trips.length > 0 && !isNewUser && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-lg font-medium transition-colors duration-200">
            {isProvider ? '+ Offer Another Ride' : '+ Book Another Trip'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UpcomingTrips;
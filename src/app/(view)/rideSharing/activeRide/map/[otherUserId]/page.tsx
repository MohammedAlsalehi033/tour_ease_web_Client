"use client";
import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, set, remove } from "firebase/database";
import { useSession } from "next-auth/react";
import { useParams } from 'next/navigation';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export const Page = () => {
    const [locations, setLocations] = useState({});
    const [theme, setTheme] = useState('light');
    const { data: session } = useSession();
    const params = useParams(); 
    const otherUserId = params.otherUserId; 
    const userId = session?.user?.id;

    // Function to get current location
    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    // Fallback to default coordinates if geolocation fails
                    console.warn('Geolocation failed, using default coordinates:', error);
                    resolve({
                        latitude: 33.6576971,
                        longitude: 73.159057
                    });
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        });
    };

    // Function to create new instance in Firebase
    const createLocationInstance = async () => {
        if (!userId) return;

        try {
            const db = getDatabase();
            const location = await getCurrentLocation();
            
            // Create the data structure with userId as the main key
            const instanceData = {
                active: true,
                latitude: location.latitude,
                longitude: location.longitude,
                timestamp: Date.now()
            };

            // Use userId as the key directly in locationInstances
            const userLocationRef = ref(db, `locations/${userId}`);
            
            await set(userLocationRef, instanceData);
            
            console.log('New location instance created for user:', userId);
        } catch (error) {
            console.error('Error creating location instance:', error);
        }
    };

    // Function to delete the instance from Firebase
    const deleteLocationInstance = async () => {
        if (!userId) return;
        
        try {
            const db = getDatabase();
            const userLocationRef = ref(db, `locations/${userId}`);
            await remove(userLocationRef);
            console.log('Location instance deleted for privacy');
        } catch (error) {
            console.error('Error deleting location instance:', error);
        }
    };

    useEffect(() => {
        if (!userId) return;

        // Create new instance when page loads
        createLocationInstance();

        // Cleanup function to delete instance when component unmounts
        const handleBeforeUnload = () => {
            deleteLocationInstance();
        };

        // Handle browser/tab close, refresh, or navigation away
        window.addEventListener('beforeunload', handleBeforeUnload);

        const db = getDatabase();
        const userIds = [
            userId, // Current user's ID
            otherUserId // Other user's ID from the URL params
        ].filter(Boolean); // Remove any undefined values

        const listeners = userIds.map(uid => {
            const locationRef = ref(db, 'locations/' + uid);
            return onValue(locationRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setLocations(prevLocations => ({
                        ...prevLocations,
                        [uid]: data
                    }));
                }
            }, (error) => {
                console.error("Error fetching location for user:", uid, error);
            });
        });

        return () => {
            // Component unmount cleanup
            deleteLocationInstance();
            
            // Remove event listener
            window.removeEventListener('beforeunload', handleBeforeUnload);
            
            // Unsubscribe from Firebase listeners
            listeners.forEach(unsubscribe => {
                unsubscribe();
            });
        };
    }, [userId, otherUserId]);

    // Calculate map center and positions
    const locationValues = Object.values(locations);
    const positions = locationValues.map(loc => [loc.latitude, loc.longitude]);
    const center = positions.length > 0 ? positions[0] : [33.6576, 73.1590];

    return (
        <div className="min-h-screen bg-light-background dark:bg-dark-background transition-colors duration-300 p-4">
            {/* Main Content */}
            <div className="px-6 bg-light-background dark:bg-dark-background min-h-screen transition-colors duration-300">
                <div className="max-w-6xl mx-auto">
                    {/* Map Card */}
                    <div className="card p-10 transition-colors duration-300">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Live Location Map</h2>
                        <div className="rounded-lg overflow-hidden shadow-lg" style={{ height: '500px', width: '100%' }}>
                            <MapContainer 
                                center={center} 
                                zoom={15} 
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                {locationValues.map((location, index) => (
                                    <Marker key={index} position={[location.latitude, location.longitude]}>
                                        <Popup>
                                            <div className="text-sm">
                                                <strong>User Location</strong><br/>
                                                Lat: {location.latitude.toFixed(6)}<br/>
                                                Lng: {location.longitude.toFixed(6)}<br/>
                                                Updated: {new Date(location.timestamp).toLocaleTimeString()}
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                                {positions.length === 2 && (
                                    <Polyline positions={positions} color="blue" weight={3} opacity={0.8} />
                                )}
                            </MapContainer>
                        </div>
                    </div>

                    {/* Location Details Card */}
                    <div className="card p-10 mt-8">
                        <h2 className="text-xl font-semibold 100 mb-4">Location Details</h2>
                        
                        {locationValues.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-lg text-gray-600 dark:text-gray-400">
                                    No active locations found. Waiting for location data...
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(locations).map(([uid, location], index) => (
                                    <div key={uid} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                        <div className="flex items-center mb-3">
                                            <div className={`h-3 w-3 rounded-full mr-3 ${location.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                {uid === userId ? 'You' : `User ${index + 1}`}
                                            </h3>
                                        </div>
                                        
                                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Latitude:</span>
                                                <span className="font-mono">{location.latitude.toFixed(6)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Longitude:</span>
                                                <span className="font-mono">{location.longitude.toFixed(6)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                                                <span>{new Date(location.timestamp).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                                <span className={location.active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                    {location.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>  

          
        </div>
    );
};

export default Page;
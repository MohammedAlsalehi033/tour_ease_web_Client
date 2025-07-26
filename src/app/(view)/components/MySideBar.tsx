'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HomeIcon, ChatBubbleLeftRightIcon, UserIcon,
    MapIcon, TruckIcon, BuildingOfficeIcon,
    QuestionMarkCircleIcon, ChevronDownIcon, ChevronRightIcon
} from '@heroicons/react/24/outline';
import ThemeToggler from './themeToggler';

const UserSidebar = ({ hasActiveRide }: { hasActiveRide: boolean }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [rideSharingOpen, setRideSharingOpen] = useState(false); // NEW
    const pathname = usePathname();

    const isActive = (path: string) => {
        // Highlight ride-sharing if on the active ride page
        if (pathname === '/ridesharing/activeRide' && path.startsWith('/ride-sharing')) {
            return true;
        }
        if (path.startsWith('/ride-sharing') && pathname.startsWith('/rideSharing')) {
            return true;
        }
        return pathname === path;
    };

    // Remove rideSharingLinks from here
    return (
        <div>
            <ThemeToggler />

            {/* Mobile Sidebar Toggle */}
            <div className="xl:hidden fixed top-0 left-0 z-20 p-4">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-body-md focus:outline-none"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-10 w-64 bg-primary text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } xl:translate-x-0 transition-transform duration-300 ease-in-out`}
            >
                <div className="flex items-center justify-center h-16 border-b border-primary-light">
                    <p className="text-title-lg font-bold">TourEase</p>
                </div>
                <nav className="mt-8">
                    {/* Services Section */}
                    <div className="px-4 mb-4">
                        <p className="text-title-sm font-semibold text-primary-light uppercase tracking-wider">Services</p>
                        <div className="mt-3 space-y-1">
                            {/* Accommodations */}
                            <Link href="/accommodations"
                                className={`btn-text group flex items-center ${isActive('/accommodations') ? 'bg-primary-light text-white' : 'text-white hover:bg-primary-light'}`}
                            >
                                <BuildingOfficeIcon className="mr-3 h-6 w-6" />
                                Accommodations
                            </Link>
                            {/* Ride Sharing Collapsible Section */}
                            <button
                                type="button"
                                onClick={() => setRideSharingOpen((open) => !open)}
                                className={`btn-text group flex items-center w-full ${isActive('/ride-sharing') ? 'bg-primary-light text-white' : 'text-white hover:bg-primary-light'}`}
                                aria-expanded={rideSharingOpen}
                                aria-controls="ride-sharing-sub-links"
                            >
                                <TruckIcon className="mr-3 h-6 w-6" />
                                Ride Sharing
                                {rideSharingOpen ? (
                                    <ChevronDownIcon className="ml-auto h-5 w-5" />
                                ) : (
                                    <ChevronRightIcon className="ml-auto h-5 w-5" />
                                )}
                            </button>
                            {rideSharingOpen && (
                                <div id="ride-sharing-sub-links" className="ml-8 mt-1 flex flex-col space-y-1">
                                    <Link
                                        href={hasActiveRide ? '/rideSharing/activeRide' : '/rideSharing/maps'}
                                        title={hasActiveRide ? 'View your active ride' : 'View Listings'}
                                        className={`btn-text group flex items-center ${isActive('/rideSharing/maps') ? 'bg-primary-light text-white' : 'text-white hover:bg-primary-light'} ${hasActiveRide ? 'animate-pulse-glow' : ''}`}
                                    >
                                        View Listings
                                    </Link>
                                    <Link
                                        href={hasActiveRide ? '/rideSharing/activeRide' : '/rideSharing/listing/maps'}
                                        title={hasActiveRide ? 'View your active ride' : 'Create Listing'}
                                        className={`btn-text group flex items-center ${isActive('/rideSharing/listing/maps') ? 'bg-primary-light text-white' : 'text-white hover:bg-primary-light'} ${hasActiveRide ? 'animate-pulse-glow' : ''}`}
                                    >
                                        Create Listing
                                    </Link>
                                    <Link
                                        href={hasActiveRide ? '/rideSharing/activeRide' : '/rideSharing/request/maps'}
                                        title={hasActiveRide ? 'View your active ride' : 'Create Request'}
                                        className={`btn-text group flex items-center ${isActive('/rideSharing/request/maps') ? 'bg-primary-light text-white' : 'text-white hover:bg-primary-light'} ${hasActiveRide ? 'animate-pulse-glow' : ''}`}
                                    >
                                        Create Request
                                    </Link>
                                </div>
                            )}
                            {/* Trip Planner */}
                            <Link href="/trip-planner"
                                className={`btn-text group flex items-center ${isActive('/trip-planner') ? 'bg-primary-light text-white' : 'text-white hover:bg-primary-light'}`}
                            >
                                <MapIcon className="mr-3 h-6 w-6" />
                                Trip Planner
                            </Link>
                        </div>
                    </div>

                    {/* Communication Section */}
                    <div className="px-4 mb-4">
                        <p className="text-title-sm font-semibold text-primary-light uppercase tracking-wider">Communication</p>
                        <div className="mt-3 space-y-1">
                            {/* Chats */}
                            <Link href="/chats"
                                className={`btn-text group flex items-center ${isActive('/chats') ? 'bg-primary-light text-white' : 'text-white hover:bg-primary-light'}`}
                            >
                                <ChatBubbleLeftRightIcon className="mr-3 h-6 w-6" />
                                Chats
                            </Link>
                            {/* Questions */}
                            <Link href="/questions"
                                className={`btn-text group flex items-center ${isActive('/questions') ? 'bg-primary-light text-white' : 'text-white hover:bg-primary-light'}`}
                            >
                                <QuestionMarkCircleIcon className="mr-3 h-6 w-6" />
                                Questions
                            </Link>
                        </div>
                    </div>
                    {/* Account Section */}
                    <div className="px-4 mb-4">
                        <p className="text-title-sm font-semibold text-primary-light uppercase tracking-wider">Account</p>
                        <div className="mt-3 space-y-1">
                            {/* Profile */}
                            <Link href="/profile"
                                className={`btn-text group flex items-center ${isActive('/profile') ? 'bg-primary-light text-white' : 'text-white hover:bg-primary-light'}`}
                            >
                                <UserIcon className="mr-3 h-6 w-6" />
                                Profile
                            </Link>
                        </div>
                    </div>
                    {/* Notifications Section */}
                    <div className="px-4 mb-4">
                        <p className="text-title-sm font-semibold text-primary-light uppercase tracking-wider">Notifications</p>
                        <div className="mt-3 space-y-1">
                            {/* Notifications Link */}
                            <Link href="/notifications"
                                className={`btn-text group flex items-center ${isActive('/notifications') ? 'bg-primary-light text-white' : 'text-white hover:bg-primary-light'}`}
                            >
                                <UserIcon className="mr-3 h-6 w-6" />
                                Notifications
                            </Link>
                        </div>
                    </div>
                </nav>
            </aside>
        </div>
    )
}

export default UserSidebar;
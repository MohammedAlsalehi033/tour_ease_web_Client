'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, ChatBubbleLeftRightIcon, UserIcon,
  MapIcon, TruckIcon, BuildingOfficeIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import ThemeToggler from './themeToggler';

const UserSidebar = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    
    const isActive = (path) => {
      return pathname === path;
    };

  return (
    <div>
      <ThemeToggler />
      
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-0 left-0 z-20 p-4">
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
        className={`fixed inset-y-0 left-0 z-10 w-64 bg-primary text-white transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-center h-16 border-b border-primary-light">
          <p className="text-title-lg font-bold">TourEase</p>
        </div>
        <nav className="mt-8">
          <div className="px-4 mb-4">
            <p className="text-title-sm font-semibold text-primary-light uppercase tracking-wider">Services</p>
            <div className="mt-3 space-y-1">
              {/* Accommodations */}
              <Link href="/accommodations" 
                className={`group flex items-center px-2 py-2 text-body-md font-medium rounded-md ${
                  isActive('/accommodations') ? 'bg-primary-light text-white' : 'text-white hover:bg-primary-light'
                }`}
              >
                <BuildingOfficeIcon className="mr-3 h-6 w-6" />
                Accommodations
              </Link>
              
              {/* Ride Sharing */}
              <Link href="/rideSharing/maps" 
                className={`group flex items-center px-2 py-2 text-body-md font-medium rounded-md ${
                  isActive('/ride-sharing') ? 'bg-primary-light text-white' : 'text-white hover:bg-primary-light'
                }`}
              >
                <TruckIcon className="mr-3 h-6 w-6" />
                Ride Sharing
              </Link>

              <Link href="/rideSharing/listing/maps" 
                className={`group flex items-center px-2 py-2 text-body-md font-medium rounded-md ${
                  isActive('/ride-sharing') ? 'bg-primary-light text-white' : 'text-white hover:bg-primary-light'
                }`}
              >
                <TruckIcon className="mr-3 h-6 w-6" />
                Create Listing
              </Link>
              <Link href="/rideSharing/request/maps" 
                className={`group flex items-center px-2 py-2 text-body-md font-medium rounded-md ${
                  isActive('/ride-sharing') ? 'bg-primary-light text-white' : 'text-white hover:bg-primary-light'
                }`}
              >
                <TruckIcon className="mr-3 h-6 w-6" />
                Create Request
              </Link>
              
              {/* Trip Planner */}
              <Link href="/trip-planner" 
                className={`group flex items-center px-2 py-2 text-body-md font-medium rounded-md ${
                  isActive('/trip-planner') ? 'bg-primary-light text-white' : 'text-white hover:bg-primary-light'
                }`}
              >
                <MapIcon className="mr-3 h-6 w-6" />
                Trip Planner
              </Link>
            </div>
          </div>
          
          <div className="px-4 mb-4">
            <p className="text-title-sm font-semibold text-primary-light uppercase tracking-wider">Communication</p>
            <div className="mt-3 space-y-1">
              {/* Chats */}
              <Link href="/chats" 
                className={`group flex items-center px-2 py-2 text-body-md font-medium rounded-md ${
                  isActive('/chats') ? 'bg-primary-light text-white' : 'text-white hover:bg-primary-light'
                }`}
              >
                <ChatBubbleLeftRightIcon className="mr-3 h-6 w-6" />
                Chats
              </Link>
              
              {/* Questions */}
              <Link href="/questions" 
                className={`group flex items-center px-2 py-2 text-body-md font-medium rounded-md ${
                  isActive('/questions') ? 'bg-primary-light text-white' : 'text-white hover:bg-primary-light'
                }`}
              >
                <QuestionMarkCircleIcon className="mr-3 h-6 w-6" />
                Questions
              </Link>
            </div>
          </div>

          <div className="px-4 mb-4">
            <p className="text-title-sm font-semibold text-primary-light uppercase tracking-wider">Account</p>
            <div className="mt-3 space-y-1">
              {/* Profile */}
              <Link href="/profile" 
                className={`group flex items-center px-2 py-2 text-body-md font-medium rounded-md ${
                  isActive('/profile') ? 'bg-primary-light text-white' : 'text-white hover:bg-primary-light'
                }`}
              >
                <UserIcon className="mr-3 h-6 w-6" />
                Profile
              </Link>
            </div>
          </div>
        </nav>
      </aside>
    </div>
  )
}

export default UserSidebar
'use client'

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HomeIcon, ChatBubbleLeftRightIcon, UserIcon,
    MapIcon, TruckIcon, BuildingOfficeIcon,
    QuestionMarkCircleIcon, ChevronDownIcon, ChevronRightIcon, BellIcon, Bars3Icon
} from '@heroicons/react/24/outline';
import ThemeToggler from './themeToggler';







// Helper component for animated links
const NavLink = ({ href, icon: Icon, text, isActive, hasActiveRide, isSubLink = false, animationDelay = 0 }) => (
    <Link
        href={href}
        style={{ animationDelay: `${animationDelay}ms` }}
        title={text}
        className={`btn-text group flex items-center w-full transform transition-all duration-300 ${isSubLink ? 'pl-8' : ''} ${isActive ? 'bg-primary-light/90 text-white shadow-lg' : 'text-white hover:bg-primary-light/70 hover:translate-x-2'} ${hasActiveRide && href.includes('activeRide') ? 'animate-pulse-glow' : ''} animate-fade-in-up`}
    >
        {Icon && <Icon className="mr-3 h-6 w-6 transition-transform duration-300 group-hover:scale-110" />}
        <span className="truncate">{text}</span>
    </Link>
);

const UserSidebar = ({ hasActiveRide }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [rideSharingOpen, setRideSharingOpen] = useState(false);
    const [textIndex, setTextIndex] = useState(0);
    const pathname = usePathname();

    const slogans = [
        "Your Adventure Awaits.",
        "Travel Made Simple.",
        "Explore Without Limits.",
        "Journey Beyond Borders.",

    ];
    const cyclingText = ["TourEase", ...slogans];


    useEffect(() => {
    }, []);
    // Effect for cycling through slogans
    useEffect(() => {
        const intervalId = setInterval(() => {
            setTextIndex(prevIndex => (prevIndex + 1) % cyclingText.length);
        }, 10000); 

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [cyclingText.length]);


    // Close sidebar on route change on mobile
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    const isActive = (path) => {
        if (pathname.startsWith('/rideSharing') && path.startsWith('/rideSharing')) {
            return true;
        }
        return pathname === path;
    };

    const navSections = [
        {
            title: 'Services',
            links: [
                { href: '/accommodations', text: 'Accommodations', icon: BuildingOfficeIcon },
                {
                    text: 'Ride Sharing', icon: TruckIcon, isCollapsible: true,
                    isOpen: rideSharingOpen,
                    setOpen: setRideSharingOpen,
                    subLinks: [
                        { href: hasActiveRide ? '/rideSharing/activeRide' : '/rideSharing/maps', text: 'View Listings' },
                        { href: hasActiveRide ? '/rideSharing/activeRide' : '/rideSharing/listing/maps', text: 'Create Listing' },
                        { href: hasActiveRide ? '/rideSharing/activeRide' : '/rideSharing/request/maps', text: 'Create Request' },
                    ]
                },
                { href: '/tripPlanner', text: 'Trip Planner', icon: MapIcon },
            ]
        },
        {
            title: 'Communication',
            links: [
                { href: '/chats', text: 'Chats', icon: ChatBubbleLeftRightIcon },
                { href: '/questions', text: 'Questions', icon: QuestionMarkCircleIcon },
            ]
        },
        {
            title: 'Account',
            links: [
                { href: '/profile', text: 'Profile', icon: UserIcon },
                { href: '/notifications', text: 'Notifications', icon: BellIcon },
            ]
        }
    ];

    return (
        <div>
            <div className="fixed top-4 right-4 z-30">
                <ThemeToggler />
            </div>

            {/* Mobile Sidebar Toggle */}
            <div className="xl:hidden fixed top-4 left-4 z-30">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-md text-gray-700 dark:text-gray-200 bg-white/50 dark:bg-black/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <Bars3Icon className="h-6 w-6" />
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-20 w-64 bg-primary text-white transform transition-transform duration-500 ease-in-out ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} xl:translate-x-0`}
            >
                <div className="flex items-center justify-center h-20 border-b border-white/20">
                    {/* Animated Text */}
                    <p key={textIndex} className="text-2xl font-bold tracking-wider text-center px-2 animate-fade-in-up overflow-hidden ">
                        {cyclingText[textIndex]}
                    </p>
                </div>
                <nav className="mt-6 px-4 space-y-6">
                    {navSections.map((section, sectionIndex) => (
                        <div key={section.title}>
                            <p className="px-3 text-sm font-semibold text-white/60 uppercase tracking-wider animate-fade-in-up" style={{ animationDelay: `${sectionIndex * 100}ms` }}>{section.title}</p>
                            <div className="mt-3 space-y-1">
                                {section.links.map((link, linkIndex) => {
                                    const totalPreviousLinks = navSections.slice(0, sectionIndex).reduce((acc, sec) => acc + sec.links.length, 0);
                                    const animationDelay = (totalPreviousLinks + linkIndex) * 50 + 100;

                                    if (link.isCollapsible) {
                                        return (
                                            <div key={link.text}>
                                                <button
                                                    type="button"
                                                    onClick={() => link.setOpen(!link.isOpen)}
                                                    style={{ animationDelay: `${animationDelay}ms` }}
                                                    className={`btn-text group flex items-center w-full transform transition-all duration-300 ${isActive('/rideSharing') ? 'bg-primary-light/90 text-white shadow-lg' : 'text-white hover:bg-primary-light/70 hover:translate-x-2'} animate-fade-in-up`}
                                                    aria-expanded={link.isOpen}
                                                >
                                                    <link.icon className="mr-3 h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                                                    <span className="truncate">{link.text}</span>
                                                    <ChevronDownIcon className={`ml-auto h-5 w-5 transition-transform duration-300 ${link.isOpen ? 'rotate-180' : ''}`} />
                                                </button>
                                                <div className={`accordion-content ${link.isOpen ? 'max-h-40' : 'max-h-0'}`}>
                                                    <div className="pt-2 space-y-1">
                                                        {link.subLinks.map((subLink, subIndex) => (
                                                            <NavLink
                                                                key={subLink.text}
                                                                href={subLink.href}
                                                                text={subLink.text}
                                                                isActive={pathname === subLink.href}
                                                                isSubLink
                                                                animationDelay={animationDelay + (subIndex + 1) * 50}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <NavLink
                                            key={link.text}
                                            href={link.href}
                                            text={link.text}
                                            icon={link.icon}
                                            isActive={isActive(link.href)}
                                            hasActiveRide={hasActiveRide}
                                            animationDelay={animationDelay}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>
        </div>
    )
}

export default UserSidebar;

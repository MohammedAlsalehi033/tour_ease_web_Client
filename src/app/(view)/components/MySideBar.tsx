'use client'
import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HomeIcon, ChatBubbleLeftRightIcon, UserIcon,
    TruckIcon, BuildingOfficeIcon,
    QuestionMarkCircleIcon, BellIcon, Bars3Icon,
    CalendarDaysIcon, ChartBarIcon
} from '@heroicons/react/24/outline';
import ThemeToggler from './themeToggler';
import { useActiveRideContext } from '@/app/components/ActiveRideProvider';







// Helper component for animated links
const NavLink = ({ href, icon: Icon, text, isActive, hasActiveRide, isSubLink = false, animationDelay = 0, showActiveRideBadge = false }) => (
    <Link
        href={href}
        style={{ animationDelay: `${animationDelay}ms` }}
        title={text}
        className={`btn-text group flex items-center w-full transform transition-all duration-300 ${isSubLink ? 'pl-8' : ''} ${isActive ? 'bg-primary-light/90 text-white shadow-lg' : 'text-white hover:bg-primary-light/70 hover:translate-x-2'} ${hasActiveRide && href.includes('activeRide') ? 'animate-pulse-glow' : ''} animate-fade-in-up relative`}
    >
        {Icon && <Icon className="mr-3 h-6 w-6 transition-transform duration-300 group-hover:scale-110" />}
        <span className="truncate">{text}</span>
        {showActiveRideBadge && (
            <div className="ml-auto flex items-center animate-notification-bounce">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-active-ride-pulse"></div>
                <span className="ml-1 text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full font-medium animate-active-ride-pulse shadow-lg">
                    Active
                </span>
            </div>
        )}
    </Link>
);

const UserSidebar = ({ hasActiveRide: hasActiveRideProp }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [textIndex, setTextIndex] = useState(0);
    const pathname = usePathname();

    

    // Use real-time active ride context, fallback to prop
    const { hasActiveRide: hasActiveRideContext, activeRide } = useActiveRideContext();
    const hasActiveRide = hasActiveRideContext || hasActiveRideProp;

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
console.log(pathname)
    const navSections = [
        {
            title: 'Main',
            links: [
                { href: '/', text: 'Home', icon: HomeIcon },
                { href: '/dashboard', text: 'Dashboard', icon: ChartBarIcon },
            ]
        },
        {
            title: 'Services',
            links: [
                { href: '/accommodations', text: 'Accommodations', icon: BuildingOfficeIcon },
                { 
                    href: hasActiveRide ? '/rideSharing/activeRide' : '/rideSharing/maps', 
                    text: hasActiveRide ? 'Active Ride' : 'Ride Hub', 
                    icon: TruckIcon,
                    showActiveRideBadge: hasActiveRide
                },
                { href: '/tripPlanner', text: 'Trip Planner', icon: CalendarDaysIcon },
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
            <div className={`fixed top-4 right-4 z-30 ${pathname === '/' ? 'hidden' : ''}`}>
                <ThemeToggler />
            </div>

            {/* Mobile Sidebar Toggle */}
            <div className={`xl:hidden fixed top-4 left-4 z-30 ${pathname === '/' ? 'hidden' : ''}`}>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-md text-gray-700 dark:text-gray-200 bg-white/50 dark:bg-black/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <Bars3Icon className="h-6 w-6" />
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-20 w-64 bg-primary text-white transform transition-transform duration-500 ease-in-out ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} xl:translate-x-0 ${pathname === '/' ? 'hidden' : ''}`}
            >
                <div className="flex items-center justify-center h-20 border-b border-white/20">
                    {/* Animated Text */}
                    <p key={textIndex} className="text-2xl font-bold tracking-wider text-center px-2 animate-fade-in-up overflow-hidden">
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

                                    return (
                                        <NavLink
                                            key={link.text}
                                            href={link.href}
                                            text={link.text}
                                            icon={link.icon}
                                            isActive={isActive(link.href)}
                                            hasActiveRide={hasActiveRide}
                                            animationDelay={animationDelay}
                                            showActiveRideBadge={(link as any).showActiveRideBadge || false}
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

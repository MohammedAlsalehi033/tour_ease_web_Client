'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValue, useAnimationFrame, useAnimate, stagger } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import { 
  Car, 
  Home, 
  MapPin, 
  Shield, 
  Star, 
  MessageCircle, 
  BarChart3, 
  Users, 
  ArrowRight, 
  Play,
  Smartphone,
  Globe,
  Zap,
  HeartHandshake,
  ChevronDown,
  Clock,
  Award,
  TrendingUp,
  CheckCircle,
  Menu,
  X,
  Sun,
  Moon,
  User,
  Sparkles,
  Rocket,
  Target
} from 'lucide-react';

// --- Advanced Components ---

// 1. Spotlight Effect
const Spotlight = ({ className = "", fill = "white" }: { className?: string; fill?: string }) => {
  return (
    <svg
      className={`pointer-events-none absolute z-[1] h-[169%] w-[138%] lg:w-[84%] opacity-0 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <motion.g 
        filter="url(#filter0_f_29_29)"
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 0.5, y: 0 }}
        transition={{ duration: 1.5 }}
      >
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill}
          fillOpacity="0.21"
        />
      </motion.g>
      <defs>
        <filter
          id="filter0_f_29_29"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="151"
            result="effect1_foregroundBlur_29_29"
          />
        </filter>
      </defs>
    </svg>
  );
};

// 2. Infinite Marquee
const Marquee = ({ children, direction = "left", speed = 50 }: { children: React.ReactNode; direction?: "left" | "right"; speed?: number }) => {
  return (
    <div className="overflow-hidden flex whitespace-nowrap mask-image-gradient">
      <motion.div
        className="flex gap-8 items-center"
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
};

// 3. Card Spotlight Effect
const CardSpotlight = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(33, 150, 243, 0.1), transparent 40%)`,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

// 4. Text Generate Effect
const TextGenerateEffect = ({ words, className = "" }: { words: string; className?: string }) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");
  
  useEffect(() => {
    animate(
      "span",
      { opacity: 1, filter: "blur(0px)" },
      { duration: 1, delay: stagger(0.1) }
    );
  }, [scope.current]);

  return (
    <motion.div ref={scope} className={className}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={word + idx}
          className="opacity-0 blur-sm inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

// 5. Gradient Border Button
const GradientBorderButton = ({ children, href, className = "" }: { children: React.ReactNode; href: string; className?: string }) => (
  <Link href={href} className={`relative inline-flex h-14 overflow-hidden rounded-2xl p-[2px] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-50 ${className}`}>
    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#06b6d4_0%,#22d3ee_50%,#06b6d4_100%)]" />
    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-2xl bg-white dark:bg-slate-950 px-8 py-1 text-base font-medium text-slate-900 dark:text-white backdrop-blur-3xl transition-colors hover:bg-gray-50 dark:hover:bg-slate-900/80">
      {children}
    </span>
  </Link>
);

// 6. Animated Gradient Background
const AnimatedGradientBackground = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`relative flex flex-col min-h-screen items-center justify-center bg-white dark:bg-black overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 opacity-30 dark:opacity-20"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
        style={{
          backgroundImage: "radial-gradient(circle at center, rgba(33, 150, 243, 0.4) 0%, transparent 50%), radial-gradient(circle at top left, rgba(168, 85, 247, 0.4) 0%, transparent 50%)",
          backgroundSize: "120% 120%",
        }}
      />
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};

// 7. Hero Gallery Composition
const HeroGallery = () => {
  return (
    <div className="relative w-full h-[500px] lg:h-[600px] flex items-center justify-center perspective-1000">
      {/* Abstract Background Blobs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-tr from-green-500/30 to-emerald-500/30 rounded-full blur-3xl" 
      />
      
      {/* Main Card - Accommodation (Center-Left) */}
      <motion.div
        initial={{ opacity: 0, x: -50, rotateY: -20 }}
        animate={{ opacity: 1, x: 0, rotateY: -10 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute left-0 lg:left-4 top-10 w-64 sm:w-72 h-80 sm:h-96 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-white/20 overflow-hidden z-10"
      >
        <div className="h-48 sm:h-56 bg-gray-200 relative group overflow-hidden">
           <Image 
             src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80" 
             alt="Luxus Hunza"
             fill
             className="object-cover transition-transform duration-700 group-hover:scale-110"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
           <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
             <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> 4.9
           </div>
           <div className="absolute bottom-4 left-4 text-white">
             <p className="text-xs font-medium opacity-90">Attabad Lake, Hunza</p>
             <p className="text-lg font-bold">Luxus Hunza</p>
           </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                  {i}
                </div>
              ))}
            </div>
            <p className="text-sm font-bold text-cyan-500">PKR 45k<span className="text-gray-400 font-normal">/night</span></p>
          </div>
          <Link href="/accommodations" className="block w-full">
            <button className="w-full py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              View Details
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Secondary Card - Ride Sharing (Top-Right) */}
      <motion.div
        initial={{ opacity: 0, x: 50, y: -20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="absolute right-0 lg:right-4 top-0 w-60 sm:w-64 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-white/20 p-4 z-20"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Car className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white">Ride to Islamabad</h4>
            <p className="text-xs text-gray-500">Arriving in 5 mins</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <div className="w-0.5 h-8 bg-gray-200" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <div className="space-y-4 text-sm">
              <p className="text-gray-500">Current Location</p>
              <p className="font-medium">Lahore Junction</p>
            </div>
          </div>
          <Link href="/rideSharing" className="block w-full">
             <button className="w-full py-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 text-xs font-bold hover:bg-cyan-500/20 transition-colors">
               Track Ride
             </button>
          </Link>
        </div>
      </motion.div>

      {/* Tertiary Card - Trip Planning (Bottom-Right) */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="absolute right-4 lg:right-10 bottom-20 w-56 sm:w-60 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-white/20 p-5 z-30"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-gray-900 dark:text-white">Northern Trip</h4>
          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-1 rounded-full">Active</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800">
            <MapPin className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium">Faisal Mosque</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">08:00 AM</span>
          </div>
          <Link href="/tripPlanner" className="block w-full mt-2">
             <button className="w-full py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
               View Itinerary
             </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 0.8, 0.3, 0]);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { currentUser, loading } = useAuth() as any;

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Rotating text animation
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const rotatingTexts = [
    "Share Rides",
    "Book Stays", 
    "Plan Trips",
    "Connect Globally",
    "Travel Smart"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [rotatingTexts.length]);

  // Floating animation component with smoother, more subtle animations
  const FloatingElement = ({ children, delay = 0 }) => (
    <motion.div
      animate={{ 
        y: [0, -15, 0],
        rotate: [0, 1, -1, 0]
      }}
      transition={{ 
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay
      }}
    >
      {children}
    </motion.div>
  );

  // Animated progress indicator with glow
  const ProgressIndicator = () => {
    const scaleX = useSpring(scrollYProgress, {
      stiffness: 100,
      damping: 30,
      restDelta: 0.001
    });
    
    return (
      <>
        <motion.div 
          className="fixed top-0 left-0 right-0 h-1 bg-cyan-500 z-[100] shadow-lg shadow-cyan-500/50"
          style={{ scaleX, transformOrigin: '0%' }}
        />
        <motion.div 
          className="fixed top-0 left-0 right-0 h-1 bg-cyan-500/30 blur-sm z-[90]"
          style={{ scaleX, transformOrigin: '0%' }}
        />
      </>
    );
  };

  // Animated counter component
  const AnimatedCounter = ({ value, suffix = '' }: { value: string; suffix?: string }) => {
    return (
      <span className="font-bold">
        {value}{suffix}
      </span>
    );
  };

  // Particle effect component
  const ParticleField = () => {
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-cyan-500/20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  };

  // Interactive cursor follower
  const CursorFollower = () => {
    const cursorX = useMotionValue(0);
    const cursorY = useMotionValue(0);
    
    const springConfig = { damping: 25, stiffness: 150 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
      const moveCursor = (e: MouseEvent) => {
        cursorX.set(e.clientX - 20);
        cursorY.set(e.clientY - 20);
      };

      window.addEventListener('mousemove', moveCursor);
      return () => window.removeEventListener('mousemove', moveCursor);
    }, [cursorX, cursorY]);

    return (
      <motion.div
        className="fixed w-10 h-10 rounded-full border-2 border-cyan-500/30 pointer-events-none z-[100] hidden lg:block"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
        }}
      />
    );
  };

  // Services data with updated styling
  const services = [
    {
      icon: <Car className="w-8 h-8" />,
      title: "Ride Sharing",
      description: "Connect with drivers and travelers for shared journeys. Safe, affordable, and eco-friendly transportation.",
      features: ["Real-time tracking", "Driver verification", "Route optimization", "In-app messaging"],
      color: "primary",
      link: "/rideSharing/maps",
      bgPattern: "🚗"
    },
    {
      icon: <Home className="w-8 h-8" />,
      title: "Accommodations",
      description: "Find and book comfortable stays from verified hosts. Available on web and mobile app.",
      features: ["Verified hosts", "Property management", "Multi-platform access", "Flexible cancellation"],
      color: "accent",
      link: "/accommodations",
      bgPattern: "🏠"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Trip Planning",
      description: "AI-powered trip planner that creates personalized itineraries for your perfect journey.",
      features: ["AI recommendations", "Custom itineraries", "Budget planning", "Local insights"],
      color: "success",
      link: "/tripPlanner",
      bgPattern: "🗺️"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Community Chat",
      description: "Connect with fellow travelers, ask questions, and share experiences in real-time.",
      features: ["Real-time chat", "Travel forums", "Expert advice", "Local recommendations"],
      color: "info",
      link: "/chats",
      bgPattern: "💬"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Safety First",
      description: "Advanced safety features including identity verification and 24/7 emergency support.",
      features: ["Identity verification", "Emergency support", "Insurance coverage", "Trust ratings"],
      color: "warning",
      link: "/",
      bgPattern: "🛡️"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics Dashboard",
      description: "Comprehensive analytics for providers to track performance and optimize services.",
      features: ["Performance metrics", "Revenue tracking", "User insights", "Growth analytics"],
      color: "primary",
      link: "/dashboard",
      bgPattern: "📊"
    }
  ];

  // Technology stack
  const technologies = [
    { name: "Next.js", icon: "⚡", description: "Web application framework" },
    { name: "Flutter", icon: "📱", description: "Cross-platform mobile app" },
    { name: "Node.js", icon: "🟢", description: "Backend server runtime" },
    { name: "TypeScript", icon: "🔷", description: "Type-safe development" },
    { name: "Firebase", icon: "🔥", description: "Real-time database & auth" },
    { name: "Prisma", icon: "🔺", description: "Next-gen database toolkit" },
    { name: "Socket.io", icon: "🔌", description: "Real-time communication" },
    { name: "Framer Motion", icon: "🎬", description: "Smooth animations" },
    { name: "Tailwind CSS", icon: "🎨", description: "Utility-first styling" },
    { name: "AWS", icon: "☁️", description: "Cloud infrastructure" }
  ];

  // Stats data
  const stats = [
    { value: "10K+", label: "Active Users", icon: <Users className="w-6 h-6" />, description: "Growing community" },
    { value: "50K+", label: "Trips Completed", icon: <Car className="w-6 h-6" />, description: "Successful journeys" },
    { value: "4.8/5", label: "User Rating", icon: <Star className="w-6 h-6" />, description: "Satisfaction score" },
    { value: "24/7", label: "Support", icon: <Shield className="w-6 h-6" />, description: "Always available" }
  ];

  // Top Navigation
  const TopNavigation = () => (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-cyan-500 cursor-pointer hover:scale-105 transition-transform">TourEase</h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="#services" className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition-colors">Services</Link>
            <Link href="#technology" className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition-colors">Technology</Link>
            <Link href="#about" className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition-colors">About</Link>
            
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
            )}
            
            {/* User Profile or Sign In */}
            {!loading && (
              (currentUser as any) ? (
                <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
                  <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-cyan-500 transition-colors">
                    {(currentUser as any).name || (currentUser as any).email?.split('@')[0]}
                  </span>
                  {(currentUser as any).image ? (
                    <div className="relative w-10 h-10 rounded-full border-2 border-cyan-500 overflow-hidden">
                      <Image 
                        src={(currentUser as any).image} 
                        alt={(currentUser as any).name || 'User'} 
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-semibold border-2 border-cyan-500">
                      {((currentUser as any).name || (currentUser as any).email)?.[0]?.toUpperCase()}
                    </div>
                  )}
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-cyan-500 hover:text-cyan-600 transition-colors font-medium">Sign In</Link>
                  <Link href="/register" className="bg-cyan-500 text-white px-6 py-2.5 rounded-2xl hover:bg-cyan-600 transition-all hover:shadow-lg">Get Started</Link>
                </>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            {/* Mobile Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
            )}
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="#services" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-cyan-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">Services</Link>
              <Link href="#technology" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-cyan-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">Technology</Link>
              <Link href="#about" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-cyan-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">About</Link>
              
              {/* User Profile or Sign In - Mobile */}
              {!loading && (
                (currentUser as any) ? (
                  <Link href="/profile" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                    {(currentUser as any).image ? (
                      <div className="relative w-10 h-10 rounded-full border-2 border-cyan-500 overflow-hidden">
                        <Image 
                          src={(currentUser as any).image} 
                          alt={(currentUser as any).name || 'User'} 
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-semibold border-2 border-cyan-500">
                        {((currentUser as any).name || (currentUser as any).email)?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {(currentUser as any).name || (currentUser as any).email?.split('@')[0]}
                    </span>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="block px-3 py-2 text-cyan-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium">Sign In</Link>
                    <Link href="/register" className="block px-3 py-2 bg-cyan-500 text-white rounded-2xl hover:bg-cyan-600 transition-colors text-center font-medium">Get Started</Link>
                  </>
                )
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );

  return (
    // Override layout padding/margin with fixed positioning and full width
    <div className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-light-background dark:bg-dark-background">
      <ProgressIndicator />
      <CursorFollower />
      <TopNavigation />
      
      {/* Hero Section */}
      <AnimatedGradientBackground className="pt-20 pb-10 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <Meteors number={20} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-120px)]">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 text-center lg:text-left"
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-500 font-medium text-sm mb-4"
              >
                🚀 The Future of Travel is Here
              </motion.div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-bold leading-tight tracking-tight text-light-text dark:text-dark-text">
                Explore Pakistan with <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">TourEase</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Your all-in-one platform for ride sharing, accommodations, and trip planning across the breathtaking landscapes of Pakistan. 
                Connect with a local community of travelers and hosts.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <GradientBorderButton href="/tripPlanner">
                  <span className="flex items-center gap-2">
                    Start Your Journey
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </GradientBorderButton>
                
                <Link href="/accommodations" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-medium text-light-text dark:text-dark-text border border-gray-200 dark:border-gray-700 hover:border-green-600 hover:text-green-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Home className="w-5 h-5" />
                    Find Stays
                  </motion.button>
                </Link>
              </div>
              
              <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-light-text-secondary dark:text-dark-text-secondary">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 flex items-center justify-center overflow-hidden">
                       <User className="w-6 h-6 text-gray-400" />
                    </div>
                  ))}
                </div>
                <div className="text-sm text-left">
                  <span className="font-bold text-light-text dark:text-dark-text">10k+</span> Travelers
                  <br />Joined this month
                </div>
              </div>
            </motion.div>

            {/* Right Content - Hero Gallery */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <HeroGallery />
            </motion.div>
          </div>
        </div>
      </AnimatedGradientBackground>

      {/* Stats Section with animated counters */}
      <section className="py-20 md:py-24 bg-white dark:bg-gray-900 border-t border-b border-gray-100 dark:border-gray-800 relative overflow-hidden z-10">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="text-center group relative"
              >
                {/* Hover glow effect */}
                <motion.div
                  className="absolute inset-0 bg-cyan-500/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
                
                <motion.div 
                  className="flex justify-center mb-5 text-cyan-500 relative"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* SVG Path Animation for Icons */}
                  <svg className="absolute inset-0 w-full h-full overflow-visible">
                    <motion.circle
                      cx="50%"
                      cy="50%"
                      r="25"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="160"
                      strokeDashoffset="160"
                      whileInView={{ strokeDashoffset: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      className="opacity-20"
                    />
                  </svg>
                  {stat.icon}
                </motion.div>
                
                <motion.h3 
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-light-text dark:text-dark-text mb-3 tracking-tight"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                >
                  <AnimatedCounter value={stat.value} />
                </motion.h3>
                
                <p className="text-light-text dark:text-dark-text font-semibold mb-1">
                  {stat.label}
                </p>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  {stat.description}
                </p>
                
                {/* Animated underline */}
                <motion.div
                  className="h-1 bg-cyan-500 mt-4 mx-auto"
                  initial={{ width: 0 }}
                  whileInView={{ width: "60%" }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.6 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 md:py-28 bg-light-background dark:bg-dark-background relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 md:mb-20"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-6 text-light-text dark:text-dark-text tracking-tight">
              Our Services
            </h2>
            <p className="text-lg md:text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto font-light">
              Discover the comprehensive suite of services that make TourEase your ultimate travel companion
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <CardSpotlight key={index} className="group cursor-pointer h-full bg-light-surface dark:bg-gray-800 border-gray-100 dark:border-gray-700/50">
                <Link href={service.link} className="block p-8 h-full relative z-20">
                  <motion.div 
                    className="w-14 h-14 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-500 mb-6 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 relative overflow-hidden"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="relative z-10">{service.icon}</span>
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4 group-hover:text-cyan-500 transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        <CheckCircle className="w-4 h-4 text-cyan-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-auto flex items-center text-cyan-500 font-semibold text-sm group-hover:gap-2 transition-all duration-300">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </CardSpotlight>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section id="technology" className="py-20 md:py-28 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 md:mb-20"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-6 text-light-text dark:text-dark-text tracking-tight">
              Built with Modern Tech
            </h2>
            <p className="text-lg md:text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto font-light">
              Powered by cutting-edge technologies for the best performance, security, and user experience
            </p>
          </motion.div>

          <div className="relative w-full overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10" />
            
            <Marquee speed={40}>
              {technologies.map((tech, index) => (
                <div
                  key={index}
                  className="bg-light-surface dark:bg-gray-800 rounded-2xl p-6 text-center border border-gray-100 dark:border-gray-700/50 hover:border-cyan-500/30 dark:hover:border-cyan-500/40 transition-all duration-300 group relative overflow-hidden cursor-pointer w-48 mx-4"
                >
                  <div className="text-4xl mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300">
                    {tech.icon}
                  </div>
                  <h3 className="text-base font-bold text-light-text dark:text-dark-text mb-2 relative z-10">
                    {tech.name}
                  </h3>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary relative z-10">
                    {tech.description}
                  </p>
                </div>
              ))}
            </Marquee>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section id="about" className="py-20 md:py-28 bg-light-background dark:bg-dark-background relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-8 text-light-text dark:text-dark-text tracking-tight">
                Why Choose <span className="text-cyan-500">TourEase?</span>
              </h2>
              
              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-500 flex-shrink-0">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-3">
                      Multi-Platform Access
                    </h3>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                      Available on web and mobile (Flutter app for iOS & Android) for seamless travel experiences anywhere
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-500 flex-shrink-0">
                    <Globe className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-3">
                      Global Network
                    </h3>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                      Connect with travelers and providers worldwide for authentic local experiences
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-500 flex-shrink-0">
                    <HeartHandshake className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-3">
                      Community Driven
                    </h3>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                      Built by travelers, for travelers, with real feedback and genuine reviews
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative bg-cyan-500 rounded-3xl p-10 md:p-12 text-white">
                <h3 className="text-2xl md:text-3xl font-bold mb-5">Ready to get started?</h3>
                <p className="mb-8 text-base md:text-lg leading-relaxed opacity-95">
                  Join thousands of travelers who have already discovered the TourEase difference
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto bg-white text-cyan-500 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg"
                    >
                      Sign Up Free
                    </motion.button>
                  </Link>
                  
                  <Link href="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 transition-all duration-300"
                    >
                      Explore Dashboard
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;

// 9. Meteors Effect
const Meteors = ({ number = 20 }: { number?: number }) => {
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>([]);

  useEffect(() => {
    const styles = new Array(number).fill(true).map(() => ({
      top: 0,
      left: Math.floor(Math.random() * (800 - -800) + -800) + "px",
      animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
      animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
    }));
    setMeteorStyles(styles);
  }, [number]);

  return (
    <>
      {meteorStyles.map((style, idx) => (
        <span
          key={"meteor" + idx}
          className={
            "animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]" +
            " before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent"
          }
          style={style}
        ></span>
      ))}
    </>
  );
};

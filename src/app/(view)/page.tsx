'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from 'next-themes';
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
  Moon
} from 'lucide-react';

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 0.8, 0.3, 0]);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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

  // Floating animation component
  const FloatingElement = ({ children, delay = 0 }) => (
    <motion.div
      animate={{ 
        y: [0, -20, 0],
        rotate: [0, 2, -2, 0]
      }}
      transition={{ 
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay
      }}
    >
      {children}
    </motion.div>
  );

  // Cool progress indicator
  const ProgressIndicator = () => (
    <motion.div 
      className="fixed top-0 left-0 right-0 h-1 bg-primary-200 z-50"
      style={{ scaleX: scrollYProgress, transformOrigin: '0%' }}
    />
  );

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary cursor-pointer hover:scale-105 transition-transform">TourEase</h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="#services" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">Services</Link>
            <Link href="#technology" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">Technology</Link>
            <Link href="#about" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">About</Link>
            
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
            
            <Link href="/login" className="text-primary hover:text-primary-dark transition-colors font-medium">Sign In</Link>
            <Link href="/register" className="bg-primary text-white px-6 py-2.5 rounded-2xl hover:bg-primary-dark transition-all hover:shadow-lg">Get Started</Link>
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
              className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
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
              <Link href="#services" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">Services</Link>
              <Link href="#technology" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">Technology</Link>
              <Link href="#about" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">About</Link>
              <Link href="/login" className="block px-3 py-2 text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium">Sign In</Link>
              <Link href="/register" className="block px-3 py-2 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-colors text-center font-medium">Get Started</Link>
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
      <TopNavigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 px-4 sm:px-0">
        {/* Animated Background */}
        <motion.div 
          style={{ y, opacity }}
          className="absolute inset-0 opacity-20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        </motion.div>
        
        {/* Floating Elements - Hidden on smallest screens, optimized positions */}
        <FloatingElement delay={0}>
          <div className="hidden sm:block absolute top-24 left-4 sm:left-8 md:left-20 w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-primary/10 rounded-[40px] blur-xl" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <div className="hidden sm:block absolute bottom-24 right-4 sm:right-8 md:right-20 w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 bg-primary/15 rounded-[60px] blur-2xl" />
        </FloatingElement>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Main Logo/Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-bold leading-tight">
              <span className="text-primary">
                TourEase
              </span>
            </h1>
            
            {/* Rotating Text Section - Improved mobile layout */}
            <div className="min-h-[80px] sm:min-h-[100px] md:min-h-[120px] flex flex-col items-center justify-center gap-2 sm:gap-3 px-2">
              <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-light-text dark:text-dark-text">
                Your Gateway to
              </span>
              <motion.span
                key={currentTextIndex}
                initial={{ opacity: 0, y: 20, rotateX: 90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -20, rotateX: -90 }}
                transition={{ duration: 0.6 }}
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary"
              >
                {rotatingTexts[currentTextIndex]}
              </motion.span>
            </div>

            {/* Description - Better mobile padding and sizing */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto leading-relaxed px-2 sm:px-4">
              Experience the future of travel with our comprehensive platform that connects travelers, 
              hosts, and transportation providers in one seamless ecosystem.
            </p>

            {/* CTA Buttons - Full width on mobile */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-stretch sm:items-center pt-2 sm:pt-4 px-2 sm:px-4">
              <Link href="/register" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(33, 150, 243, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-3xl shadow-lg hover:bg-primary-dark transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3"
                >
                  Start Your Journey
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </Link>

              <Link href="/login" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto border-2 border-primary text-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-3xl hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  Sign In
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Scroll Indicator - Hidden on very small screens */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="hidden sm:block absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-primary opacity-70" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-light-surface dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-[32px] shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-center mb-4 text-primary">
                  {stat.icon}
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-light-text dark:text-dark-text mb-2">
                  {stat.value}
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary font-medium">
                  {stat.label}
                </p>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary opacity-70 mt-1">
                  {stat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-20 bg-light-background dark:bg-dark-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-6">
              <span className="text-primary">
                Our Services
              </span>
            </h2>
            <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto">
              Discover the comprehensive suite of services that make TourEase your ultimate travel companion
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 20px 60px rgba(33, 150, 243, 0.15)"
                }}
                className="relative bg-white dark:bg-gray-800 rounded-[32px] p-6 md:p-8 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 hover:border-primary/30 transition-all duration-300 group cursor-pointer overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute top-4 right-4 text-6xl opacity-5 group-hover:opacity-10 transition-opacity">
                  {service.bgPattern}
                </div>
                
                <Link href={service.link} className="block">
                  <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-4 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <ul className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        <CheckCircle className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section id="technology" className="py-16 md:py-20 bg-light-surface dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-6">
              <span className="text-primary">
                Built with Modern Tech
              </span>
            </h2>
            <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto">
              Powered by cutting-edge technologies for the best performance, security, and user experience
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {technologies.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-[32px] p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="text-3xl md:text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {tech.icon}
                </div>
                <h3 className="text-base md:text-lg font-semibold text-light-text dark:text-dark-text mb-2">
                  {tech.name}
                </h3>
                <p className="text-xs md:text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  {tech.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section id="about" className="py-16 md:py-20 bg-light-background dark:bg-dark-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-6">
                Why Choose <span className="text-primary">TourEase?</span>
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary rounded-3xl flex items-center justify-center text-white flex-shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
                      Multi-Platform Access
                    </h3>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                      Available on web and mobile (Flutter app for iOS & Android) for seamless travel experiences anywhere
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary rounded-3xl flex items-center justify-center text-white flex-shrink-0">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
                      Global Network
                    </h3>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                      Connect with travelers and providers worldwide for authentic local experiences
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary rounded-3xl flex items-center justify-center text-white flex-shrink-0">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
                      Community Driven
                    </h3>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                      Built by travelers, for travelers, with real feedback and genuine reviews
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative bg-primary rounded-[32px] p-6 md:p-8 text-white overflow-hidden">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute top-4 right-4 text-white/20"
                >
                  <Zap className="w-8 h-8" />
                </motion.div>
                
                <h3 className="text-xl md:text-2xl font-bold mb-4">Ready to get started?</h3>
                <p className="mb-6 opacity-90 text-sm md:text-base">
                  Join thousands of travelers who have already discovered the TourEase difference
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-primary px-6 py-3 rounded-3xl font-semibold transition-all duration-300"
                    >
                      Sign Up Free
                    </motion.button>
                  </Link>
                  
                  <Link href="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto bg-white text-primary px-6 py-3 rounded-3xl font-semibold hover:bg-gray-100 transition-all duration-300"
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

      {/* Call to Action */}
      <section className="py-16 md:py-20 bg-primary text-white relative overflow-hidden">
        <FloatingElement delay={0}>
          <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-white/10 rounded-full blur-3xl" />
        </FloatingElement>
        <FloatingElement delay={3}>
          <div className="absolute bottom-0 left-0 w-48 md:w-80 h-48 md:h-80 bg-white/10 rounded-full blur-3xl" />
        </FloatingElement>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              Start Your Adventure Today
            </h2>
            <p className="text-lg md:text-xl mb-12 opacity-90 max-w-4xl mx-auto">
              Whether you're looking to share a ride, find accommodation, or plan the perfect trip, 
              TourEase has everything you need for unforgettable travel experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <Link href="/register">
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 40px rgba(255, 255, 255, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto bg-white text-primary px-10 py-4 text-lg font-bold rounded-3xl hover:bg-gray-100 transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
                >
                  Join TourEase
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              
              <Link href="/rideSharing">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto border-2 border-white text-white px-10 py-4 text-lg font-semibold rounded-3xl hover:bg-white hover:text-primary transition-all duration-300"
                >
                  Explore Services
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

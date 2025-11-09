'use client';

import React from 'react';
import { 
  Bell, 
  Car, 
  UserCheck, 
  CheckCircle,
  Clock
} from 'lucide-react';

interface NotificationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    all: number;
    requests: number;
    offers: number;
    pending: number;
    completed: number;
  };
}

const NotificationTabs: React.FC<NotificationTabsProps> = ({
  activeTab,
  onTabChange,
  counts
}) => {
  const tabs = [
    {
      id: 'all',
      label: 'All',
      icon: Bell,
      count: counts.all,
      description: 'All notifications'
    },
    {
      id: 'requests',
      label: 'Ride Requests',
      icon: Car,
      count: counts.requests,
      description: 'Requests for your rides'
    },
    {
      id: 'offers',
      label: 'Ride Offers',
      icon: UserCheck,
      count: counts.offers,
      description: 'Offers from drivers'
    },
    {
      id: 'pending',
      label: 'Pending',
      icon: Clock,
      count: counts.pending,
      description: 'Awaiting response'
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: CheckCircle,
      count: counts.completed,
      description: 'Accepted or rejected'
    }
  ];

  return (
    <div className="mb-6">
      {/* Mobile Dropdown */}
      <div className="md:hidden">
        <select
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-light-outline dark:border-dark-outline bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label} ({tab.count})
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:flex bg-light-surface dark:bg-dark-surface rounded-lg p-1 shadow-sm border border-light-outline dark:border-dark-outline">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-variant/30 dark:hover:bg-dark-surface-variant/30'
              }`}
              title={tab.description}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium text-sm">{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Description (Desktop only) */}
      <div className="hidden md:block mt-2">
        <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant text-center">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>
    </div>
  );
};

export default NotificationTabs;
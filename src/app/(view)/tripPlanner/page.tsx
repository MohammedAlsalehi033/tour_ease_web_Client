"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapPin, Calendar, Users, Star, ArrowRight, Trash2, Plus } from 'lucide-react';
import TripPlannerWizard from './components/TripPlannerWizard';
import CurrentPlans from './components/CurrentPlans';

interface Plan {
  id: string;
  from: string;
  to: string;
  startDate: string;
  endDate: string;
  budget: number;
  activities: string[];
  travelers: number;
  createdAt: string;
  status: 'planned' | 'active' | 'completed';
}

const mockPlans: Plan[] = [
  {
    id: '1',
    from: 'New York, NY',
    to: 'Paris, France',
    startDate: '2024-06-15',
    endDate: '2024-06-25',
    budget: 3500,
    activities: ['Sightseeing', 'Dining', 'Museums'],
    travelers: 2,
    createdAt: '2024-01-15',
    status: 'planned'
  },
  {
    id: '2',
    from: 'Los Angeles, CA',
    to: 'Tokyo, Japan',
    startDate: '2024-08-10',
    endDate: '2024-08-20',
    budget: 4200,
    activities: ['Cultural Tours', 'Dining', 'Shopping'],
    travelers: 1,
    createdAt: '2024-02-20',
    status: 'planned'
  }
];

export default function TripPlanner() {
  const searchParams = useSearchParams();
  const [showWizard, setShowWizard] = useState(false);
  const [plans, setPlans] = useState<Plan[]>(mockPlans);
  const [successMessage, setSuccessMessage] = useState('');

  // Check for success parameter
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'plan-created') {
      setSuccessMessage('Your trip plan has been created successfully!');
      setShowWizard(false);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [searchParams]);

  const handleDeletePlan = (planId: string) => {
    setPlans(prev => prev.filter(plan => plan.id !== planId));
  };

  const handleUpdatePlan = (planId: string, updates: Partial<Plan>) => {
    setPlans(prev => prev.map(plan => 
      plan.id === planId ? { ...plan, ...updates } : plan
    ));
  };

  if (showWizard) {
    return <TripPlannerWizard />;
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-[rgba(var(--success),0.1)] border border-[rgb(var(--success))] rounded-lg">
            <p className="text-[rgb(var(--success))] font-medium">{successMessage}</p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[rgb(var(--text))] mb-2">
            Trip Planner
          </h1>
          <p className="text-[rgb(var(--text-secondary))] mb-6">
            Plan your perfect getaway with personalized recommendations
          </p>
          
          {/* Create New Plan Button */}
          <button
            onClick={() => setShowWizard(true)}
            className="btn btn-primary text-lg px-8 py-3 inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Plan New Trip
          </button>
        </div>

        {/* Current Plans Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-[rgb(var(--text))]">
              Your Trip Plans
            </h2>
            {plans.length > 0 && (
              <span className="bg-[rgba(var(--primary),0.1)] text-[rgb(var(--primary))] px-3 py-1 rounded-full text-sm font-medium">
                {plans.length} {plans.length === 1 ? 'plan' : 'plans'}
              </span>
            )}
          </div>
          
          <CurrentPlans 
            plans={plans}
            onDeletePlan={handleDeletePlan}
            onUpdatePlan={handleUpdatePlan}
          />
        </div>

        {/* Empty State */}
        {plans.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-[rgb(var(--surface))] rounded-lg p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-[rgba(var(--primary),0.1)] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-[rgb(var(--primary))]" size={24} />
              </div>
              <h3 className="text-lg font-medium text-[rgb(var(--text))] mb-2">
                No trips planned yet
              </h3>
              <p className="text-[rgb(var(--text-secondary))] mb-6">
                Start planning your next adventure by creating your first trip plan.
              </p>
              <button
                onClick={() => setShowWizard(true)}
                className="btn btn-primary"
              >
                Plan Your First Trip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
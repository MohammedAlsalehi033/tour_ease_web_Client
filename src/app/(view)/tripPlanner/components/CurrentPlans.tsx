import React from 'react';
import { MapPin, Calendar, Users, DollarSign, Edit, Trash2, Star, Clock, CheckCircle } from 'lucide-react';

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

interface CurrentPlansProps {
  plans: Plan[];
  onDeletePlan: (planId: string) => void;
  onUpdatePlan: (planId: string, updates: Partial<Plan>) => void;
}

const CurrentPlans: React.FC<CurrentPlansProps> = ({ plans, onDeletePlan, onUpdatePlan }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'text-[rgb(var(--primary))] bg-[rgba(var(--primary),0.1)]';
      case 'active': return 'text-[rgb(var(--success))] bg-[rgba(var(--success),0.1)]';
      case 'completed': return 'text-[rgb(var(--text-secondary))] bg-[rgba(var(--text-secondary),0.1)]';
      default: return 'text-[rgb(var(--text-secondary))] bg-[rgba(var(--text-secondary),0.1)]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return <Clock size={14} />;
      case 'active': return <Star size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-[rgb(var(--surface))] rounded-lg p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-[rgba(var(--primary),0.1)] rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="text-[rgb(var(--primary))]" size={24} />
          </div>
          <h3 className="text-lg font-medium text-[rgb(var(--text))] mb-2">
            No trips planned yet
          </h3>
          <p className="text-[rgb(var(--text-secondary))]">
            Your saved trip plans will appear here once you create them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {plans.map((plan) => (
        <div key={plan.id} className="bg-[rgb(var(--surface))] rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-600">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-[rgb(var(--text))]">
                  {plan.from} → {plan.to}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(plan.status)}`}>
                  {getStatusIcon(plan.status)}
                  {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                </span>
              </div>
              <p className="text-[rgb(var(--text-secondary))] text-sm">
                Created on {formatDate(plan.createdAt)}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdatePlan(plan.id, { status: plan.status === 'planned' ? 'active' : 'planned' })}
                className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--primary))] transition-colors"
                title="Edit Plan"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => onDeletePlan(plan.id)}
                className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--error))] transition-colors"
                title="Delete Plan"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Trip Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-[rgb(var(--primary))]" size={18} />
              <div>
                <p className="text-xs text-[rgb(var(--text-secondary))]">Dates</p>
                <p className="text-sm font-medium text-[rgb(var(--text))]">
                  {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                </p>
                <p className="text-xs text-[rgb(var(--text-secondary))]">
                  {getDuration(plan.startDate, plan.endDate)} days
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="text-[rgb(var(--success))]" size={18} />
              <div>
                <p className="text-xs text-[rgb(var(--text-secondary))]">Travelers</p>
                <p className="text-sm font-medium text-[rgb(var(--text))]">
                  {plan.travelers} {plan.travelers === 1 ? 'person' : 'people'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="text-[rgb(var(--secondary))]" size={18} />
              <div>
                <p className="text-xs text-[rgb(var(--text-secondary))]">Budget</p>
                <p className="text-sm font-medium text-[rgb(var(--text))]">
                  ${plan.budget.toLocaleString()}
                </p>
                <p className="text-xs text-[rgb(var(--text-secondary))]">
                  ${Math.round(plan.budget / plan.travelers)} per person
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Star className="text-[rgb(var(--warning))]" size={18} />
              <div>
                <p className="text-xs text-[rgb(var(--text-secondary))]">Activities</p>
                <p className="text-sm font-medium text-[rgb(var(--text))]">
                  {plan.activities.length} selected
                </p>
              </div>
            </div>
          </div>

          {/* Activities */}
          {plan.activities.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-[rgb(var(--text))] mb-2">Selected Activities:</p>
              <div className="flex flex-wrap gap-2">
                {plan.activities.map((activity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[rgba(var(--primary),0.1)] text-[rgb(var(--primary))] rounded-full text-xs font-medium"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="text-[rgb(var(--text-secondary))]" size={16} />
              <span className="text-sm text-[rgb(var(--text-secondary))]">
                {plan.from} to {plan.to}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdatePlan(plan.id, { 
                  status: plan.status === 'planned' ? 'active' : plan.status === 'active' ? 'completed' : 'planned' 
                })}
                className="btn btn-sm"
              >
                {plan.status === 'planned' ? 'Start Trip' : 
                 plan.status === 'active' ? 'Complete Trip' : 'Reactivate'}
              </button>
              <button className="btn btn-sm btn-primary">
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CurrentPlans;
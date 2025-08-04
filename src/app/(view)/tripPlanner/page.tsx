"use client"
import React, { useState } from 'react'
import NewPlanForm from './NewPlanForm'
import CurrentPlans from './CurrentPlans'

type PlanDetails = {
    fromLocation: string;
    toLocation: string;
    budget: string;
    startDate: string;
    endDate: string;
    travelers: number;
    requirements: string;
};

type Errors = {
    fromLocation?: string;
    toLocation?: string;
    budget?: string;
    startDate?: string;
    endDate?: string;
    travelers?: string;
    activities?: string;
};

const TripPlanner = () => {
    const [activeTab, setActiveTab] = useState<'newPlan' | 'currentPlans'>('newPlan');

    // State for all form inputs
    const [planDetails, setPlanDetails] = useState<PlanDetails>({
        fromLocation: '',
        toLocation: '',
        budget: '',
        startDate: '',
        endDate: '',
        travelers: 1,
        requirements: '',
    });

    // State to hold validation errors
    const [errors, setErrors] = useState<Errors>({});

    // State for the activities
    const [activities, setActivities] = useState([
        { name: 'Sightseeing', selected: false , icon: 'fa-solid fa-eye'},
        { name: 'Hiking', selected: false , icon: 'fa-solid fa-mountain'},
        { name: 'Dining', selected: false , icon: 'fa-solid fa-utensils'},
        { name: 'Shopping', selected: false , icon: 'fa-solid fa-bag-shopping'},
        { name: 'Cultural Tours', selected: false , icon: 'fa-solid fa-theater-masks'},
        { name: 'Adventure Sports', selected: false , icon: 'fa-solid fa-bolt'},
        { name: 'Relaxation', selected: false , icon: 'fa-solid fa-spa'},
        { name: 'Wildlife Safari', selected: false , icon: 'fa-solid fa-paw'},
    ]);

    // A single handler for all standard input fields
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPlanDetails(prevDetails => ({
            ...prevDetails,
            [name]: name === 'travelers' ? Number(value) : value
        }));
        // Optional: Clear error when user starts typing
        if (errors[name as keyof Errors]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
        }
    };

    // A dedicated handler for toggling activity selection
    const handleActivityToggle = (index: number) => {
        const newActivities = [...activities];
        newActivities[index].selected = !newActivities[index].selected;
        setActivities(newActivities);
        // Optional: Clear error when user selects an activity
        if (errors.activities) {
            setErrors(prevErrors => ({ ...prevErrors, activities: undefined }));
        }
    };
    
    // --- VALIDATION LOGIC ---
    const validateForm = () => {
        const newErrors: Errors = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Get start of today for comparison

        // Required fields
        if (!planDetails.fromLocation.trim()) newErrors.fromLocation = 'Starting location is required.';
        if (!planDetails.toLocation.trim()) newErrors.toLocation = 'Destination is required.';
        if (!planDetails.budget) newErrors.budget = 'Budget is required.';
        if (!planDetails.travelers) newErrors.travelers = 'Number of travelers is required.';
        if (!planDetails.startDate) newErrors.startDate = 'Start date is required.';
        if (!planDetails.endDate) newErrors.endDate = 'End date is required.';

        // Logical validations
        if (planDetails.fromLocation.trim() && planDetails.fromLocation.trim().toLowerCase() === planDetails.toLocation.trim().toLowerCase()) {
            newErrors.toLocation = 'Destination cannot be the same as the start.';
        }
        if (planDetails.budget && parseFloat(planDetails.budget) <= 0) {
            newErrors.budget = 'Budget must be a positive number.';
        }
        if (planDetails.travelers && planDetails.travelers < 1) {
            newErrors.travelers = 'Must have at least 1 traveler.';
        }
        if (planDetails.startDate && new Date(planDetails.startDate).setHours(0,0,0,0) < today.getTime()) {
            newErrors.startDate = 'Start date cannot be in the past.';
        }
        if (planDetails.startDate && planDetails.endDate && new Date(planDetails.endDate) < new Date(planDetails.startDate)) {
            newErrors.endDate = 'End date cannot be before the start date.';
        }
        if (!activities.some(activity => activity.selected)) {
            newErrors.activities = 'Please select at least one activity.';
        }

        return newErrors;
    };


    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault(); 
        const validationErrors = validateForm();
        setErrors(validationErrors);

        // If there are no errors, proceed with submission
        if (Object.keys(validationErrors).length === 0) {
            const selectedActivities = activities
                .filter(activity => activity.selected)
                .map(activity => activity.name);
            
            const submissionData = {
                ...planDetails,
                selectedActivities
            };
    
        } else {
            console.log("Validation failed. Please correct the errors.", validationErrors);
        }
    };

    return (
        <div>
            {/* Tab navigation */}
            <div className="flex flex-row w-full bg-gray-100 rounded-lg overflow-hidden tabs">
                <button type="button" className={`w-1/2 p-4 md:p-6 tab text-center font-semibold transition-colors duration-300 ${activeTab === 'newPlan' ? '!bg-primary text-white' : 'hover:bg-gray-200'}`} onClick={() => setActiveTab('newPlan')}>Make a New Plan</button>
                <button type="button" className={`w-1/2 p-4 md:p-6 tab text-center font-semibold transition-colors duration-300 ${activeTab === 'currentPlans' ? '!bg-primary text-white' : 'hover:bg-gray-200'}`} onClick={() => setActiveTab('currentPlans')}>Your Current Plans</button>
            </div>
            
            {activeTab === 'newPlan' && (
                <NewPlanForm
                    planDetails={planDetails}
                    setPlanDetails={setPlanDetails}
                    activities={activities}
                    setActivities={setActivities}
                    errors={errors}
                    setErrors={setErrors}
                    handleInputChange={handleInputChange}
                    handleActivityToggle={handleActivityToggle}
                    handleSubmit={handleSubmit}
                />
            )}

            {activeTab === 'currentPlans' && (
                <CurrentPlans />
            )}
        </div>
    )
}

export default TripPlanner;
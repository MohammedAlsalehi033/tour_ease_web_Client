"use client"
import React, { useState } from 'react'

const TripPlanner = () => {
    const [activeTab, setActiveTab] = useState('newPlan');
    
    // State for all form inputs
    const [planDetails, setPlanDetails] = useState({
        fromLocation: '',
        toLocation: '',
        budget: '',
        startDate: '',
        endDate: '',
        travelers: 1,
        requirements: '',
    });

    // State to hold validation errors
    const [errors, setErrors] = useState<any>({});

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
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPlanDetails(prevDetails => ({
            ...prevDetails,
            [name]: value
        }));
        // Optional: Clear error when user starts typing
        if (errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    // A dedicated handler for toggling activity selection
    const handleActivityToggle = (index) => {
        const newActivities = [...activities];
        newActivities[index].selected = !newActivities[index].selected;
        setActivities(newActivities);
        // Optional: Clear error when user selects an activity
        if (errors.activities) {
            setErrors(prevErrors => ({ ...prevErrors, activities: null }));
        }
    };
    
    // --- VALIDATION LOGIC ---
    const validateForm = () => {
        const newErrors = {};
        const today = new Date().setHours(0, 0, 0, 0); // Get start of today for comparison

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
        if (planDetails.travelers && parseInt(planDetails.travelers) < 1) {
            newErrors.travelers = 'Must have at least 1 traveler.';
        }
        if (planDetails.startDate && new Date(planDetails.startDate) < today) {
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
    
            // --- PRINT THE WHOLE THING TO THE CONSOLE ---
            console.log("✈️ Trip Plan Generated Successfully! ✈️");
            console.log("========================================");
            console.log(JSON.stringify(submissionData, null, 2));
            console.log("========================================");
            
            alert("Success! Your trip plan has been generated. Check the developer console (F12) for the details.");
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
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* From Location */}
                        <div className="flex flex-col">
                            <label htmlFor="fromLocation" className="mb-1 font-medium">From:</label>
                            <input type="text" id="fromLocation" name="fromLocation" value={planDetails.fromLocation} onChange={handleInputChange} className={`input ${errors.fromLocation ? '!border-red-500' : ''}`} placeholder="Enter starting location" />
                            {errors.fromLocation && <p className="text-red-500 text-sm mt-1">{errors.fromLocation}</p>}
                        </div>

                        {/* To Location */}
                        <div className="flex flex-col">
                            <label htmlFor="toLocation" className="mb-1 font-medium">To:</label>
                            <input type="text" id="toLocation" name="toLocation" value={planDetails.toLocation} onChange={handleInputChange} className={`input ${errors.toLocation ? '!border-red-500' : ''}`} placeholder="Enter destination" />
                            {errors.toLocation && <p className="text-red-500 text-sm mt-1">{errors.toLocation}</p>}
                        </div>

                        {/* Budget */}
                        <div className="flex flex-col">
                            <label htmlFor="budget" className="mb-1 font-medium">Budget (USD):</label>
                            <input type="number" id="budget" name="budget" value={planDetails.budget} onChange={handleInputChange} className={`input ${errors.budget ? '!border-red-500' : ''}`} placeholder="e.g., 1500" />
                            {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
                        </div>
                        
                        {/* Travelers */}
                        <div className="flex flex-col">
                            <label htmlFor="travelers" className="mb-1 font-medium">How many travelers?</label>
                            <input type="number" id="travelers" name="travelers" value={planDetails.travelers} onChange={handleInputChange} className={`input ${errors.travelers ? '!border-red-500' : ''}`} min="1" placeholder="Enter number of travelers" />
                            {errors.travelers && <p className="text-red-500 text-sm mt-1">{errors.travelers}</p>}
                        </div>

                        {/* Date selection */}
                        <div className="flex flex-col md:col-span-2 md:flex-row md:items-start md:space-x-4 space-y-4 md:space-y-0">
                            <div className="flex-1 flex flex-col">
                                <label htmlFor="startDate" className="mb-1 font-medium">Start Date:</label>
                                <input type="date" id="startDate" name="startDate" value={planDetails.startDate} onChange={handleInputChange} className={`input ${errors.startDate ? '!border-red-500' : ''}`} />
                                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                            </div>
                            <div className="flex-1 flex flex-col">
                                <label htmlFor="endDate" className="mb-1 font-medium">End Date:</label>
                                <input type="date" id="endDate" name="endDate" value={planDetails.endDate} onChange={handleInputChange} className={`input ${errors.endDate ? '!border-red-500' : ''}`} />
                                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                            </div>
                        </div>

                        {/* Special Requirements */}
                        <div className="flex flex-col md:col-span-2">
                            <label htmlFor="requirements" className="mb-1 font-medium">Any special requirements? (Optional)</label>
                            <textarea id="requirements" name="requirements" value={planDetails.requirements} onChange={handleInputChange} className="input"  placeholder="e.g., wheelchair access, dietary restrictions"></textarea>
                        </div>
                    </div>
                    
                    {/* Activities Selection */}
                    <div className="space-y-3">
                        <label className="font-medium">What activities are you interested in?</label>
                        {errors.activities && <p className="text-red-500 text-sm">{errors.activities}</p>}
                        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                            {activities.map((activity, index) => (
                                <div key={activity.name} className={`btn-activites flex flex-row items-center space-x-3 ${activity.selected ? '!btn-outlined' : ''}`} onClick={() => handleActivityToggle(index)}>
                                    <i className={activity.icon}></i>
                                    <span className='text-light-text dark:text-dark-text overflow-hidden text-ellipsis whitespace-nowrap'>{activity.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button type="submit" className="w-full btn-primary p-4 font-bold text-lg">
                            Generate Plan
                        </button>
                    </div>
                </form>
            )}

            {activeTab === 'currentPlans' && (
                <div className="mt-6 p-8 text-center bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-700">No Current Plans</h3>
                    <p className="text-gray-500 mt-2">Your saved trip plans will appear here once you create them.</p>
                </div>
            )}
        </div>
    )
}

export default TripPlanner;
import React, { useState } from 'react';

const NewPlanForm = ({
    planDetails,
    setPlanDetails,
    activities,
    setActivities,
    errors,
    setErrors,
    handleInputChange,
    handleActivityToggle,
    handleSubmit
}) => {
    return (
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* From Location */}
                <div className="flex flex-col">
                    <label htmlFor="fromLocation" className="mb-1 font-medium text-[rgb(var(--text))]">From:</label>
                    <input type="text" id="fromLocation" name="fromLocation" value={planDetails.fromLocation} onChange={handleInputChange} className={`input ${errors.fromLocation ? '!border-[rgb(var(--error))]' : ''}`} placeholder="Enter starting location" />
                    {errors.fromLocation && <p className="text-[rgb(var(--error))] text-sm mt-1">{errors.fromLocation}</p>}
                </div>
                {/* To Location */}
                <div className="flex flex-col">
                    <label htmlFor="toLocation" className="mb-1 font-medium text-[rgb(var(--text))]">To:</label>
                    <input type="text" id="toLocation" name="toLocation" value={planDetails.toLocation} onChange={handleInputChange} className={`input ${errors.toLocation ? '!border-[rgb(var(--error))]' : ''}`} placeholder="Enter destination" />
                    {errors.toLocation && <p className="text-[rgb(var(--error))] text-sm mt-1">{errors.toLocation}</p>}
                </div>
                {/* Budget */}
                <div className="flex flex-col">
                    <label htmlFor="budget" className="mb-1 font-medium text-[rgb(var(--text))]">Budget (USD):</label>
                    <input type="number" id="budget" name="budget" value={planDetails.budget} onChange={handleInputChange} className={`input ${errors.budget ? '!border-[rgb(var(--error))]' : ''}`} placeholder="e.g., 1500" />
                    {errors.budget && <p className="text-[rgb(var(--error))] text-sm mt-1">{errors.budget}</p>}
                </div>
                {/* Travelers */}
                <div className="flex flex-col">
                    <label htmlFor="travelers" className="mb-1 font-medium text-[rgb(var(--text))]">How many travelers?</label>
                    <input type="number" id="travelers" name="travelers" value={planDetails.travelers} onChange={handleInputChange} className={`input ${errors.travelers ? '!border-[rgb(var(--error))]' : ''}`} min="1" placeholder="Enter number of travelers" />
                    {errors.travelers && <p className="text-[rgb(var(--error))] text-sm mt-1">{errors.travelers}</p>}
                </div>
                {/* Date selection */}
                <div className="flex flex-col md:col-span-2 md:flex-row md:items-start md:space-x-4 space-y-4 md:space-y-0">
                    <div className="flex-1 flex flex-col">
                        <label htmlFor="startDate" className="mb-1 font-medium text-[rgb(var(--text))]">Start Date:</label>
                        <input type="date" id="startDate" name="startDate" value={planDetails.startDate} onChange={handleInputChange} className={`input ${errors.startDate ? '!border-[rgb(var(--error))]' : ''}`} />
                        {errors.startDate && <p className="text-[rgb(var(--error))] text-sm mt-1">{errors.startDate}</p>}
                    </div>
                    <div className="flex-1 flex flex-col">
                        <label htmlFor="endDate" className="mb-1 font-medium text-[rgb(var(--text))]">End Date:</label>
                        <input type="date" id="endDate" name="endDate" value={planDetails.endDate} onChange={handleInputChange} className={`input ${errors.endDate ? '!border-[rgb(var(--error))]' : ''}`} />
                        {errors.endDate && <p className="text-[rgb(var(--error))] text-sm mt-1">{errors.endDate}</p>}
                    </div>
                </div>
                {/* Special Requirements */}
                <div className="flex flex-col md:col-span-2">
                    <label htmlFor="requirements" className="mb-1 font-medium text-[rgb(var(--text))]">Any special requirements? (Optional)</label>
                    <textarea id="requirements" name="requirements" value={planDetails.requirements} onChange={handleInputChange} className="input"  placeholder="e.g., wheelchair access, dietary restrictions"></textarea>
                </div>
            </div>
            {/* Activities Selection */}
            <div className="space-y-3">
                <label className="font-medium text-[rgb(var(--text))]">What activities are you interested in?</label>
                {errors.activities && <p className="text-[rgb(var(--error))] text-sm">{errors.activities}</p>}
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                    {activities.map((activity, index) => (
                        <div key={activity.name} className={`btn flex flex-row items-center space-x-3 ${activity.selected ? 'btn-outlined' : ''}`} onClick={() => handleActivityToggle(index)}>
                            <i className={activity.icon}></i>
                            <span className='text-[rgb(var(--text))] overflow-hidden text-ellipsis whitespace-nowrap'>{activity.name}</span>
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
    );
};

export default NewPlanForm;

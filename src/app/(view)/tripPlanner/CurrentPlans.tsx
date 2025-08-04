import React from 'react';

const CurrentPlans = () => {
    return (
        <div className="card p-6 rounded-lg border border-light-outline dark:border-dark-outline bg-light-surface dark:bg-dark-surface">
            <div className='text-center'>
                <h3 className="text-xl font-semibold text-gray-700">No Current Plans</h3>
                <p className="text-gray-500 mt-2">Your saved trip plans will appear here once you create them.</p>
            </div>
        </div>
    );
};

export default CurrentPlans;

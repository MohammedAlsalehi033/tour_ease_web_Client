import React from 'react';

const CurrentPlans = () => {
    return (
        <div className="card p-6 rounded-lg">
            <div className='text-center'>
                <h3 className="text-xl font-semibold text-[rgb(var(--text))]">No Current Plans</h3>
                <p className="text-[rgb(var(--text-secondary))] mt-2">Your saved trip plans will appear here once you create them.</p>
            </div>
        </div>
    );
};

export default CurrentPlans;

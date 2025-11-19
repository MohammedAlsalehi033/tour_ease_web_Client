"use client";

import React from 'react';
import { formatBookingDateLabel, formatStatusLabel, CombinedBooking } from '@/app/(view)/users/bookingHelpers';

interface Props {
    booking: CombinedBooking;
    formatDate: (value?: string | null | undefined) => string;
    className?: string;
}

const CombinedBookingCard: React.FC<Props> = ({ booking, formatDate, className }) => {
    const dateLabel = formatBookingDateLabel(booking, formatDate);
    const statusLabel = formatStatusLabel(booking.status);

    return (
        <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3 ${className ?? ''}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">{booking.type === 'transportation' ? 'Ride booking' : 'Accommodation booking'}</p>
                    <h3 className="text-xl font-semibold text-gray-900 truncate">{booking.title}</h3>
                    <p className="text-sm text-gray-600">{booking.subtitle}</p>
                </div>
                <span className="text-sm font-medium text-blue-600 border border-blue-200 px-3 py-1 rounded-full bg-blue-50">
                    {statusLabel}
                </span>
            </div>

            <p className="text-sm text-gray-500">{dateLabel}</p>

            {booking.price !== undefined && (
                <p className="text-sm font-semibold text-gray-800">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(booking.price)}</p>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                {Object.entries(booking.details).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-xl p-3 border border-dashed border-gray-200">
                        <p className="text-xs uppercase tracking-wide text-gray-400">{key}</p>
                        <p className="font-medium text-gray-900 truncate">{value ?? 'N/A'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CombinedBookingCard;

import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProviderReviews } from '@/app/(model)/tripPlanner/tripPlannerModel';
import RatingDisplay from '../../components/RatingDisplay';
import OtherAvatarPic from '../../components/otherAvatarPic';

interface ProviderReviewsDisplayProps {
  providerReviews: ProviderReviews;
  providerName: string;
}

const ProviderReviewsDisplay: React.FC<ProviderReviewsDisplayProps> = ({ providerReviews, providerName }) => {
  const [expanded, setExpanded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { reviews, stats } = providerReviews;

  if (!reviews || reviews.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 250;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mt-4 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left group"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
            Provider Reviews
          </span>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
            {stats.totalReviews}
          </span>
        </div>
        {expanded ? (
          <ChevronUp size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
        ) : (
          <ChevronDown size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
        )}
      </button>

      {expanded && (
        <div className="relative group/slider">
          {reviews.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); scroll('left'); }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-white/80 hover:bg-white shadow-md rounded-full flex items-center justify-center text-gray-600 hover:text-primary transition-all opacity-0 group-hover/slider:opacity-100 -ml-2"
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); scroll('right'); }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-white/80 hover:bg-white shadow-md rounded-full flex items-center justify-center text-gray-600 hover:text-primary transition-all opacity-0 group-hover/slider:opacity-100 -mr-2"
              >
                <ChevronRight size={14} />
              </button>
            </>
          )}
          
          <div 
            ref={scrollContainerRef}
            className="mt-3 flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide snap-x"
          >
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="min-w-[240px] max-w-[240px] bg-gray-50 rounded-lg p-3 border border-gray-100 snap-center flex-shrink-0"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-gray-200 flex-shrink-0">
                      <OtherAvatarPic
                        imageUrl={review.reviewer.mediaUrls?.[0]}
                        otherUserId={review.reviewer.id}
                        userName={review.reviewer.username}
                      />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[11px] font-semibold text-gray-800 truncate w-[100px]">
                        {review.reviewer.username}
                      </span>
                      <span className="text-[9px] text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <RatingDisplay rating={review.rating} size="xs" />
                </div>
                
                <p className="text-[11px] text-gray-600 leading-snug line-clamp-3">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderReviewsDisplay;

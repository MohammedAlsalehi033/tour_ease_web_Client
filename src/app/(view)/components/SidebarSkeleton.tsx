// app/components/SidebarSkeleton.tsx
import React from 'react';

const SidebarSkeleton = () => {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 w-64 bg-gray-200 animate-pulse">
      <div className="h-16 bg-gray-300"></div>
      <div className="mt-8 px-4 space-y-4">
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        <div className="space-y-2">
          <div className="h-8 bg-gray-300 rounded"></div>
          <div className="h-8 bg-gray-300 rounded"></div>
          <div className="h-8 bg-gray-300 rounded"></div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
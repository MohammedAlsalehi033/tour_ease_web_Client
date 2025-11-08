# Trip Planner - Quick Start Guide

## 🚀 Quick Integration Overview

The Trip Planner is now fully integrated with the backend API following the MVC pattern.

## 📋 Three-Layer Architecture

```
┌─────────────────────────────────────────────────┐
│              VIEW LAYER (UI)                    │
│  Location: src/app/(view)/tripPlanner/         │
│  - page.tsx (Main component)                    │
│  - RefinePlanChat.tsx (AI chat)                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│         CONTROLLER LAYER (Business Logic)       │
│  Location: src/app/(controller)/tripPlanner/   │
│  - tripPlannerController.ts                     │
│  - Optimization algorithms                      │
│  - Validation logic                             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│           MODEL LAYER (Data Access)             │
│  Location: src/app/(model)/tripPlanner/        │
│  - tripPlannerRepo.ts (API calls)               │
│  - tripPlannerModel.ts (Types)                  │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
        Backend API (/planner/*)
```

## 🔧 Available Methods

### Repository (tripPlannerRepo.ts)
```typescript
// Generate trip plans
await tripPlannerRepo.generateTripPlans(params);

// Refine with AI
await tripPlannerRepo.refineTripPlans(refineRequest);

// Confirm booking
await tripPlannerRepo.confirmBooking(bookingRequest);

// Saved plans CRUD
await tripPlannerRepo.saveTripPlan(planRequest);
await tripPlannerRepo.getSavedPlans(filters);
await tripPlannerRepo.getSavedPlanById(id);
await tripPlannerRepo.updateSavedPlan(id, updates);
await tripPlannerRepo.deleteSavedPlan(id);
await tripPlannerRepo.bookSavedPlan(id);
```

### Controller (tripPlannerController.ts)
```typescript
// Same methods as repo, plus:
// - Optimization scoring
// - Room allocation
// - Booking validation
```

## 🎯 Usage in Components

### 1. Get Controller Instance
```typescript
import { container } from '@/app/lib/diContainer';
import { TripPlannerController } from '@/app/(controller)/tripPlanner/tripPlannerController';

const controller = container.resolve(TripPlannerController);
```

### 2. Search for Trips
```typescript
const params = {
  startLocation: "Cairo",
  endLocation: "Alexandria",
  startTime: "2025-12-01T00:00:00.000Z",
  endTime: "2025-12-05T00:00:00.000Z",
  budget: 10000,
  numberOfTravelers: 2,
  interests: ["beaches", "museums"],
  needsReturnTransport: true,
  useAIOptimization: true
};

const results = await controller.generateTripPlans(params);
```

### 3. Refine with AI
```typescript
const refined = await controller.refineTripPlans({
  originalRequest: params,
  currentResults: results,
  userMessage: "Show me cheaper options",
  conversationHistory: []
});
```

### 4. Book a Plan
```typescript
const booking = await controller.confirmBooking({
  outboundTransportId: 123,
  returnTransportId: 456,
  accommodationId: 789,
  selectedRoomAllocations: [
    { roomId: 1, numberOfRooms: 2 }
  ],
  seatsNeeded: 2,
  checkInDate: "2025-12-01T00:00:00.000Z",
  checkOutDate: "2025-12-05T00:00:00.000Z"
});
```

### 5. Save a Plan
```typescript
const saved = await controller.saveTripPlan({
  planName: "Weekend Trip",
  startLocation: "Cairo",
  endLocation: "Alexandria",
  startTime: "2025-12-01T00:00:00.000Z",
  endTime: "2025-12-05T00:00:00.000Z",
  numberOfTravelers: 2,
  budget: 10000,
  selectedOutboundTransportId: 123,
  selectedReturnTransportId: 456,
  selectedAccommodationId: 789,
  seatsNeeded: 2,
  totalCost: 8500,
  planData: { /* plan object */ }
});
```

## 📡 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/planner/generate` | Generate trip plans |
| POST | `/planner/refine` | AI refinement |
| POST | `/planner/confirm` | Book plan |
| POST | `/planner/saved` | Save plan |
| GET | `/planner/saved` | List saved plans |
| GET | `/planner/saved/:id` | Get plan details |
| PUT | `/planner/saved/:id` | Update plan |
| DELETE | `/planner/saved/:id` | Delete plan |
| POST | `/planner/saved/:id/book` | Book saved plan |

## 🎨 UI Components

### Main Views
- **Search** - Initial form for trip parameters
- **Results** - Display generated plans
  - Recommended Plans tab
  - Browse All Options tab
  - Refine with AI tab ✨
- **Saved Plans** - List of user's saved plans

### New: AI Refinement Chat
```typescript
<RefinePlanChat
  originalRequest={searchParams}
  currentResults={results}
  onRefinedResults={(refined) => setResults(refined)}
/>
```

## 🔍 Example: Complete Flow

```typescript
"use client";
import { useState } from 'react';
import { container } from '@/app/lib/diContainer';
import { TripPlannerController } from '@/app/(controller)/tripPlanner/tripPlannerController';

export default function MyTripPage() {
  const [results, setResults] = useState(null);
  const controller = container.resolve(TripPlannerController);

  const searchTrips = async () => {
    const params = {
      startLocation: "Cairo",
      endLocation: "Alexandria",
      startTime: new Date("2025-12-01").toISOString(),
      endTime: new Date("2025-12-05").toISOString(),
      budget: 10000,
      numberOfTravelers: 2,
      useAIOptimization: true
    };

    const results = await controller.generateTripPlans(params);
    setResults(results);
  };

  const bookPlan = async (plan) => {
    const booking = await controller.confirmBooking({
      outboundTransportId: plan.outboundTransport.id,
      accommodationId: plan.accommodation.id,
      selectedRoomAllocations: plan.accommodation.roomAllocations,
      seatsNeeded: 2,
      checkInDate: plan.startTime,
      checkOutDate: plan.endTime
    });
    
    alert(`Booked! Total: $${booking.totalCost}`);
  };

  return (
    <div>
      <button onClick={searchTrips}>Search Trips</button>
      
      {results?.data?.optimalPlan && (
        <div>
          <h2>{results.data.optimalPlan.planName}</h2>
          <p>Score: {results.data.optimalPlan.optimizationScore}</p>
          <p>Total: ${results.data.optimalPlan.costs.total}</p>
          <button onClick={() => bookPlan(results.data.optimalPlan)}>
            Book Now
          </button>
        </div>
      )}
    </div>
  );
}
```

## ✅ Checklist for New Features

When adding new trip planner features:

- [ ] Add types to `tripPlannerModel.ts`
- [ ] Add repo method to `tripPlannerRepo.ts`
- [ ] Add controller method to `tripPlannerController.ts`
- [ ] Update view components as needed
- [ ] Test with backend API
- [ ] Handle errors gracefully
- [ ] Update TypeScript types

## 🐛 Common Issues

### Issue: "Property does not exist on type"
**Solution:** Check that types are imported from `tripPlannerModel.ts`

### Issue: "Cannot resolve TripPlannerController"
**Solution:** Ensure controller is registered in `diContainer.ts`

### Issue: API returns 401 Unauthorized
**Solution:** Endpoints like `/confirm` and `/saved/*` require authentication

### Issue: Results not displaying
**Solution:** Check `results.data` structure matches `TripPlannerResponse` type

## 📚 Resources

- Full Documentation: `TRIP_PLANNER_INTEGRATION_SUMMARY.md`
- Type Definitions: `src/app/(model)/tripPlanner/tripPlannerModel.ts`
- Example Implementation: `src/app/(view)/tripPlanner/page.tsx`

---

**Ready to use!** ✅ All layers are connected and tested.

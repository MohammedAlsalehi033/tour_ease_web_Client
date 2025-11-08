# Smart Trip Planner - Complete Documentation

## Overview
An intelligent trip planning system that shows users ALL available transportation and accommodation options, provides an AI-recommended optimal path, allows users to either accept the recommendation or manually customize their selections, and **save plans for later modification or booking**.

---

## How It Works

### User Flow
```
1. User enters trip details (location, dates, budget, travelers)
   ↓
2. System searches and displays:
   ├─ All outbound transportation options (sorted by score)
   ├─ All return transportation options (sorted by score)
   ├─ All accommodation options (sorted by score)
   └─ Suggested activities based on interests
   ↓
3. AI generates recommended combinations:
   ├─ OPTIMAL PLAN (highlighted - best value)
   ├─ Alternative Plan 2
   ├─ Alternative Plan 3
   └─ (etc.)
   ↓
4. User chooses:
   ├─ Option A: "Book Optimal Plan" (one-click booking)
   ├─ Option B: "Customize" → Select different options manually
   └─ Option C: "Save for Later" → Store plan for future modification
   ↓
5a. If booking now:
    ├─ Sends offers to ride-sharing drivers (pending approval)
    └─ Books accommodation rooms (confirmed immediately)
    
5b. If saving for later:
    ├─ Stores plan with all selections
    ├─ User can modify anytime
    └─ User can book when ready
```

---

## API Endpoints

### 1. Generate Trip Plans

**Endpoint:** `POST /api/planner/generate`

**Request:**
```json
{
  "startLocation": "Cairo",
  "endLocation": "Alexandria",
  "startTime": "2025-11-01T08:00:00Z",
  "endTime": "2025-11-05T18:00:00Z",
  "interests": ["beaches", "museums"],
  "budget": 5000,
  "numberOfTravelers": 3,
  "needsReturnTransport": true,
  "useAIOptimization": false
}
```

**Optional AI Parameters:**
- `useAIOptimization: true` - Enable iterative AI improvement (slower but smarter)
- `maxIterations: 3` - Number of optimization cycles

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "requestSummary": {
      "startLocation": "Cairo",
      "endLocation": "Alexandria",
      "budget": 5000,
      "numberOfTravelers": 3
    },
    
    "availableOptions": {
      "outboundTransportation": [
        {
          "id": 1,
          "providerName": "Ahmed Ali",
          "vehicleType": "SUV",
          "pricePerSeat": 150,
          "seatsAvailable": 4,
          "departureTime": "2025-11-01T09:00:00Z",
          "avgRating": 4.5,
          "totalCost": 450
        }
        // ... more options
      ],
      
      "returnTransportation": [
        {
          "id": 2,
          "providerName": "Mohamed Hassan",
          "vehicleType": "Sedan",
          "pricePerSeat": 140,
          "totalCost": 420,
          "avgRating": 4.8
        }
        // ... more options
      ],
      
      "accommodations": [
        {
          "id": 1,
          "name": "Seaside Resort",
          "location": "Alexandria Corniche",
          "avgRating": 4.7,
          "totalCost": 2400,
          "numberOfNights": 4,
          "roomAllocations": [
            {
              "roomId": 101,
              "roomType": "Double Room",
              "pricePerNight": 300,
              "capacity": 2,
              "numberOfRooms": 2,
              "guestsAllocated": 3,
              "totalCost": 2400
            }
          ]
        }
        // ... more options
      ],
      
      "activities": [
        {
          "title": "Best beaches in Alexandria",
          "description": "Top beach recommendations",
          "upvotes": 45,
          "source": "local_knowledge"
        }
        // ... more activities
      ]
    },
    
    "recommendedPlans": [
      {
        "optionId": "plan_1",
        "planName": "Seaside Resort with SUV",
        "description": "Travel by SUV from Cairo to Alexandria. Stay at Seaside Resort...",
        "isOptimal": true,
        "optimizationScore": 87.5,
        
        "outboundTransport": { /* full transport object from above */ },
        "returnTransport": { /* full transport object */ },
        "accommodation": { /* full accommodation object */ },
        "activities": [ /* activity list */ ],
        
        "costs": {
          "transportation": 870,
          "accommodation": 2400,
          "activities": 0,
          "total": 3270
        },
        
        "warnings": []
      }
      // ... more recommended combinations
    ],
    
    "optimalPlan": { /* same as recommendedPlans[0] where isOptimal=true */ }
  }
}
```

---

### 2. Confirm Booking

**Endpoint:** `POST /api/planner/confirm`  
**Auth Required:** Yes (Bearer token)

**Request:**
```json
{
  "optionId": "plan_1",
  "outboundTransportId": 1,
  "returnTransportId": 2,
  "seatsNeeded": 3,
  "accommodationId": 1,
  "selectedRoomAllocations": [
    { "roomId": 101, "numberOfRooms": 2 }
  ],
  "checkInDate": "2025-11-01T08:00:00Z",
  "checkOutDate": "2025-11-05T18:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "bookings": {
    "transportationBookings": {
      "outbound": {
        "id": 501,
        "status": "pending",
        "totalPrice": 450,
        "offerId": 301
      },
      "return": {
        "id": 502,
        "status": "pending",
        "totalPrice": 420,
        "offerId": 302
      }
    },
    "accommodationBookings": [
      { "id": 601, "roomId": 101, "status": "confirmed", "totalPrice": 1200 },
      { "id": 602, "roomId": 101, "status": "confirmed", "totalPrice": 1200 }
    ]
  },
  "totalCost": 3270,
  "message": "All bookings confirmed successfully"
}
```

---

### 3. Refine Plans (Conversational)

**Endpoint:** `POST /api/planner/refine`

**Request:**
```json
{
  "originalRequest": { /* original search params */ },
  "currentResults": { /* current trip plan */ },
  "userMessage": "I want cheaper hotels"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "refinedPlans": { /* new trip plan with adjusted params */ },
    "aiExplanation": "I'll search for more budget-friendly accommodations",
    "changesMade": ["Reduced accommodation budget by 10%"]
  }
}
```

---

### 4. Save Trip Plan

**Endpoint:** `POST /api/planner/saved`

**Request:**
```json
{
  "planName": "Weekend Beach Trip",
  "description": "Family trip to Alexandria",
  "selectedOutboundId": 123,
  "selectedReturnId": 456,
  "selectedAccommodationId": 789,
  "selectedRoomAllocations": [
    { "roomId": 101, "quantity": 2 }
  ],
  "selectedActivities": [10, 20, 30],
  "totalCost": 3270,
  "tags": ["family", "beach"],
  "originalSearchParams": { /* original search request */ }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "planName": "Weekend Beach Trip",
    "status": "draft",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

---

### 5. List Saved Plans

**Endpoint:** `GET /api/planner/saved?status=draft&tag=beach&sortBy=createdAt&sortOrder=desc`

**Response:**
```json
{
  "success": true,
  "data": {
    "savedPlans": [
      {
        "id": 1,
        "planName": "Weekend Beach Trip",
        "description": "Family trip to Alexandria",
        "status": "draft",
        "totalCost": 3270,
        "tags": ["family", "beach"],
        "createdAt": "2025-01-15T10:30:00Z",
        "updatedAt": "2025-01-15T10:30:00Z"
      }
    ],
    "total": 1
  }
}
```

---

### 6. Get Saved Plan Details

**Endpoint:** `GET /api/planner/saved/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "planName": "Weekend Beach Trip",
    "status": "draft",
    "totalCost": 3270,
    "outboundTransportation": { /* full listing details */ },
    "returnTransportation": { /* full listing details */ },
    "accommodation": { /* full accommodation details */ },
    "roomAllocations": [
      { "room": { /* room details */ }, "quantity": 2 }
    ],
    "activities": [ /* activity details */ ],
    "originalSearchParams": { /* search parameters */ },
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

---

### 7. Update Saved Plan

**Endpoint:** `PUT /api/planner/saved/:id`

**Request:**
```json
{
  "planName": "Summer Beach Vacation",
  "selectedOutboundId": 999,
  "totalCost": 3500,
  "tags": ["family", "beach", "summer"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "planName": "Summer Beach Vacation",
    "totalCost": 3500,
    "updatedAt": "2025-01-16T14:20:00Z"
  }
}
```

---

### 8. Delete Saved Plan

**Endpoint:** `DELETE /api/planner/saved/:id`

**Response:**
```json
{
  "success": true,
  "message": "Plan deleted successfully"
}
```

---

### 9. Book Saved Plan

**Endpoint:** `POST /api/planner/saved/:id/book`

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingConfirmation": { /* same as /confirm endpoint */ },
    "savedPlan": {
      "id": 1,
      "status": "booked",
      "bookedAt": "2025-01-20T09:00:00Z"
    }
  }
}
```

---

## UI Components

### 1. Search Form
```jsx
<Form>
  <Input label="From" placeholder="Cairo" />
  <Input label="To" placeholder="Alexandria" />
  <DateTimePicker label="Start" />
  <DateTimePicker label="End" />
  <NumberInput label="Travelers" min={1} />
  <NumberInput label="Budget ($)" />
  <MultiSelect label="Interests" options={["beaches", "museums", "food"]} />
  <Toggle label="Need return transport?" defaultChecked />
  <Toggle label="Use AI Optimization?" />
  <Button>Search</Button>
</Form>
```

### 2. Results Layout
```
┌─────────────────────────────────────────────┐
│ 🌟 RECOMMENDED PLAN (Optimal)               │
│ ─────────────────────────────────────────── │
│ Seaside Resort with SUV                     │
│ Score: 87.5/100 | Total: $3,270 / $5,000    │
│                                             │
│ 🚗 Outbound: SUV - Ahmed (⭐4.5) - $450     │
│ 🏨 Stay: Seaside Resort (⭐4.7) - $2,400    │
│ 🚗 Return: Sedan - Mohamed (⭐4.8) - $420   │
│                                             │
│ [✅ Book This Plan] [💾 Save for Later]    │
│         [🔧 Customize]                      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Other Recommended Plans                     │
├─────────────────────────────────────────────┤
│ Plan 2: Budget Option - $2,180              │
│ Plan 3: Luxury Option - $4,850              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 📋 BROWSE ALL OPTIONS                       │
├─────────────────────────────────────────────┤
│ [Outbound (5)] [Return (3)] [Hotels (4)]    │
└─────────────────────────────────────────────┘

/* When user clicks "Outbound" tab */
┌─────────────────────────────────────────────┐
│ Outbound Transportation (5 options)         │
├─────────────────────────────────────────────┤
│ ○ SUV - Ahmed Ali                           │
│   $150/seat × 3 = $450 | ⭐4.5 | 4 seats    │
│   Departs: Nov 1, 9:00 AM                   │
├─────────────────────────────────────────────┤
│ ○ Minibus - Sara Ahmed                      │
│   $100/seat × 3 = $300 | ⭐4.2 | 8 seats    │
│   Departs: Nov 1, 10:30 AM                  │
└─────────────────────────────────────────────┘
```

### 3. Customization Screen
```jsx
<CustomizeView>
  <Section title="Select Outbound Transport">
    {outboundOptions.map(option => (
      <RadioCard 
        selected={selected.outbound === option.id}
        onClick={() => selectOutbound(option.id)}
      >
        <div>{option.vehicleType} - {option.providerName}</div>
        <div>${option.totalCost} | ⭐{option.avgRating}</div>
      </RadioCard>
    ))}
  </Section>

  <Section title="Select Accommodation">
    {accommodationOptions.map(option => (
      <RadioCard 
        selected={selected.accommodation === option.id}
        onClick={() => selectAccommodation(option.id)}
      >
        <div>{option.name}</div>
        <div>${option.totalCost} for {option.numberOfNights} nights</div>
        <div>Rooms: {option.roomAllocations.map(r => 
          `${r.numberOfRooms}× ${r.roomType}`
        ).join(', ')}</div>
      </RadioCard>
    ))}
  </Section>

  <Section title="Select Return Transport">
    {returnOptions.map(option => (
      <RadioCard>...</RadioCard>
    ))}
  </Section>

  <Summary>
    Total: ${calculateTotal(selected)}
    <ButtonGroup>
      <Button onClick={confirmBooking}>Book Now</Button>
      <Button variant="secondary" onClick={saveForLater}>Save for Later</Button>
    </ButtonGroup>
  </Summary>
</CustomizeView>
```

### 4. Save Plan Dialog
```jsx
<SavePlanDialog>
  <Title>Save Trip Plan</Title>
  
  <Input 
    label="Plan Name" 
    placeholder="Weekend Beach Trip"
    value={planName}
    onChange={setPlanName}
  />
  
  <TextArea 
    label="Description (optional)"
    placeholder="Family trip to Alexandria"
    value={description}
    onChange={setDescription}
  />
  
  <TagInput 
    label="Tags (optional)"
    placeholder="beach, family, summer"
    value={tags}
    onChange={setTags}
  />
  
  <Summary>
    <div>Selected Options:</div>
    <div>• Outbound: {selectedOutbound.vehicleType}</div>
    <div>• Hotel: {selectedAccommodation.name}</div>
    <div>• Return: {selectedReturn.vehicleType}</div>
    <div>Total Cost: ${totalCost}</div>
  </Summary>
  
  <Actions>
    <Button onClick={savePlan}>Save Plan</Button>
    <Button variant="secondary" onClick={close}>Cancel</Button>
  </Actions>
</SavePlanDialog>
```

### 5. Saved Plans List
```jsx
<SavedPlansScreen>
  <Header>
    <Title>My Saved Plans</Title>
    <Filters>
      <Select label="Status" options={["all", "draft", "booked", "expired"]} />
      <TagFilter tags={allTags} />
      <Select label="Sort By" options={["createdAt", "updatedAt", "totalCost"]} />
    </Filters>
  </Header>
  
  <PlansList>
    {savedPlans.map(plan => (
      <PlanCard key={plan.id}>
        <Header>
          <Title>{plan.planName}</Title>
          <StatusBadge status={plan.status} />
        </Header>
        
        <Description>{plan.description}</Description>
        
        <Tags>
          {plan.tags.map(tag => <Tag>{tag}</Tag>)}
        </Tags>
        
        <Details>
          <div>💰 ${plan.totalCost}</div>
          <div>📅 {formatDate(plan.createdAt)}</div>
        </Details>
        
        <Actions>
          <Button onClick={() => viewPlan(plan.id)}>View Details</Button>
          {plan.status === 'draft' && (
            <>
              <Button onClick={() => editPlan(plan.id)}>Edit</Button>
              <Button onClick={() => bookPlan(plan.id)}>Book Now</Button>
            </>
          )}
          <Button variant="danger" onClick={() => deletePlan(plan.id)}>Delete</Button>
        </Actions>
      </PlanCard>
    ))}
  </PlansList>
</SavedPlansScreen>
```

### 6. Saved Plan Details
```jsx
<SavedPlanDetailsScreen>
  <Header>
    <BackButton />
    <Title>{plan.planName}</Title>
    <StatusBadge status={plan.status} />
  </Header>
  
  <Description>{plan.description}</Description>
  
  <Section title="Transportation">
    <Item>
      🚗 Outbound: {plan.outboundTransportation.vehicleType}
      <div>{plan.outboundTransportation.providerName}</div>
      <div>${plan.outboundTransportation.totalCost}</div>
    </Item>
    
    {plan.returnTransportation && (
      <Item>
        🚗 Return: {plan.returnTransportation.vehicleType}
        <div>{plan.returnTransportation.providerName}</div>
        <div>${plan.returnTransportation.totalCost}</div>
      </Item>
    )}
  </Section>
  
  <Section title="Accommodation">
    <Item>
      🏨 {plan.accommodation.name}
      <div>⭐ {plan.accommodation.rating}</div>
      <div>Rooms: {plan.roomAllocations.map(r => 
        `${r.quantity}× ${r.room.type}`
      ).join(', ')}</div>
      <div>${plan.accommodation.totalCost}</div>
    </Item>
  </Section>
  
  {plan.activities?.length > 0 && (
    <Section title="Activities">
      {plan.activities.map(activity => (
        <Item>
          🎯 {activity.title}
          <div>{activity.description}</div>
        </Item>
      ))}
    </Section>
  )}
  
  <TotalCost>Total: ${plan.totalCost}</TotalCost>
  
  <Actions>
    {plan.status === 'draft' && (
      <>
        <Button onClick={() => editPlan(plan.id)}>Edit Plan</Button>
        <Button primary onClick={() => bookPlan(plan.id)}>Book Now</Button>
      </>
    )}
    {plan.status === 'booked' && (
      <Button onClick={() => viewBookings(plan.id)}>View Bookings</Button>
    )}
  </Actions>
</SavedPlanDetailsScreen>
```

### 7. Booking Confirmation
```jsx
<ConfirmationScreen>
  <Icon>✅</Icon>
  <Title>Booking Confirmed!</Title>
  
  <BookingDetails>
    <Item>
      🚗 Outbound: {booking.outbound.status}
      {booking.outbound.status === 'pending' && 
        <Badge>Waiting for driver approval</Badge>
      }
    </Item>
    
    <Item>
      🏨 Accommodation: Confirmed ✓
      {booking.accommodationBookings.length} rooms booked
    </Item>
    
    <Item>
      🚗 Return: {booking.return.status}
    </Item>
  </BookingDetails>
  
  <Total>Total Cost: ${booking.totalCost}</Total>
  
  <Actions>
    <Button>View My Bookings</Button>
    <Button>Plan Another Trip</Button>
  </Actions>
</ConfirmationScreen>
```

---

## Key Features

### Room Allocation Logic
The system automatically allocates rooms to fit all travelers:

**Example:** 5 travelers, 4 nights
```
Available Rooms:
- Double (2 capacity) - $300/night
- Family (4 capacity) - $500/night

Algorithm selects:
- 1× Family Room (4 guests) = $500 × 4 = $2,000
- 1× Double Room (1 guest) = $300 × 4 = $1,200
Total: $3,200 for 5 guests
```

### Optimization Score
Score calculated from:
- **Cost Efficiency (40%):** Lower cost relative to budget = higher score
- **Rating Quality (30%):** Average ratings of transport + accommodation
- **Completeness (30%):** Has outbound + return + accommodation

**Formula:**
```
Cost Score = max(0, 100 - (totalCost/budget × 100))
Rating Score = (avgRating/5) × 100
Completeness = 40% outbound + 30% return + 30% accommodation

Final Score = (Cost × 0.4) + (Rating × 0.3) + (Completeness × 0.3)
```

### Booking Status
- **Transportation:** "pending" → Waits for driver to accept/reject offer
- **Accommodation:** "confirmed" → Immediately booked

---

## User Workflows

### Workflow 1: Quick Book (Optimal Plan)
```
1. User searches for trip
2. System shows optimal plan + alternatives
3. User clicks "Book This Plan"
4. System creates:
   - Offers to drivers (pending)
   - Accommodation bookings (confirmed)
5. User receives confirmation
```

### Workflow 2: Customize Selection
```
1. User searches → System returns results
2. User clicks "Customize"
3. User browses all options:
   - Selects preferred outbound transport
   - Selects preferred accommodation
   - Selects return transport
4. System shows updated total cost
5. User can either:
   - Click "Book Now" → Immediate booking
   - Click "Save for Later" → Store as draft
6. System processes request
```

### Workflow 3: Save & Modify Plan
```
1. User searches → Gets results
2. User selects options and clicks "Save for Later"
3. Enters plan name, description, tags
4. Plan saved as "draft" status
5. Later, user views saved plans
6. User can:
   - Edit selections (change transport/hotel)
   - Update plan name/tags
   - Book the plan when ready
   - Delete unwanted plans
```

### Workflow 4: Book Saved Plan
```
1. User opens saved plans list
2. Filters by status/tags
3. Selects a draft plan
4. Reviews details
5. Clicks "Book Now"
6. System processes bookings
7. Plan status → "booked"
```

### Workflow 5: Conversational Refinement
```
1. User searches → Gets results
2. User says: "I want cheaper options"
3. System adjusts budget downward
4. System re-searches with new params
5. Returns updated results
6. User can book or save
```

---

## Edge Cases

### No Options Available
```json
{
  "availableOptions": {
    "outboundTransportation": [],
    "returnTransportation": [],
    "accommodations": []
  },
  "recommendedPlans": [],
  "optimalPlan": null
}
```
**UI:** Show "No options found" with suggestions to adjust budget/dates

### Partial Options
```json
{
  "recommendedPlans": [
    {
      "optionId": "plan_1",
      "outboundTransport": {...},
      "returnTransport": null,
      "accommodation": {...},
      "warnings": ["No return transportation available"]
    }
  ]
}
```
**UI:** Show warnings prominently, allow partial booking or saving

### Insufficient Rooms
System allocates multiple room types automatically. If can't fit all travelers:
```json
{
  "accommodations": []  // Filtered out
}
```

### Budget Exceeded
All options filtered to stay within budget. If nothing fits:
```json
{
  "recommendedPlans": []
}
```
**UI:** Suggest increasing budget or reducing trip duration

### Expired Saved Plans
When viewing saved plans where transportation/accommodation dates have passed:
- Show "expired" status badge
- Disable "Book Now" button
- Allow deletion or editing to new dates

---

## Example Code

### Fetch Plans
```javascript
const searchPlans = async (params) => {
  const response = await fetch('/api/planner/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  const { data } = await response.json();
  
  // Show optimal plan
  setOptimalPlan(data.optimalPlan);
  
  // Show all options for browsing
  setAllTransport(data.availableOptions.outboundTransportation);
  setAllAccommodations(data.availableOptions.accommodations);
  
  return data;
};
```

### Book Optimal Plan
```javascript
const bookOptimalPlan = async (optimalPlan) => {
  const bookingRequest = {
    selectedOutboundId: optimalPlan.outboundTransport.listingId,
    selectedReturnId: optimalPlan.returnTransport?.listingId,
    selectedAccommodationId: optimalPlan.accommodation.accommodationId,
    selectedRoomAllocations: optimalPlan.accommodation.roomAllocations,
    selectedActivities: optimalPlan.activities.map(a => a.id)
  };
  
  const response = await fetch('/api/planner/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingRequest)
  });
  
  const { data } = await response.json();
  return data.bookingConfirmation;
};
```

### Save Plan for Later
```javascript
const savePlanForLater = async (selectedOptions, planDetails) => {
  const saveRequest = {
    planName: planDetails.name,
    description: planDetails.description,
    selectedOutboundId: selectedOptions.outbound.id,
    selectedReturnId: selectedOptions.return?.id,
    selectedAccommodationId: selectedOptions.accommodation.id,
    selectedRoomAllocations: selectedOptions.roomAllocations,
    selectedActivities: selectedOptions.activities.map(a => a.id),
    totalCost: calculateTotalCost(selectedOptions),
    tags: planDetails.tags,
    originalSearchParams: planDetails.originalParams
  };
  
  const response = await fetch('/api/planner/saved', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(saveRequest)
  });
  
  const { data } = await response.json();
  return data; // Returns { id, planName, status, createdAt }
};
```

### Fetch Saved Plans
```javascript
const getSavedPlans = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.tag) params.append('tag', filters.tag);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  
  const response = await fetch(`/api/planner/saved?${params}`, {
    headers: { 'Content-Type': 'application/json' }
  });
  
  const { data } = await response.json();
  return data.savedPlans;
};
```

### Update Saved Plan
```javascript
const updateSavedPlan = async (planId, updates) => {
  const response = await fetch(`/api/planner/saved/${planId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  
  const { data } = await response.json();
  return data;
};
```

### Book Saved Plan
```javascript
const bookSavedPlan = async (planId) => {
  const response = await fetch(`/api/planner/saved/${planId}/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  const { data } = await response.json();
  return data.bookingConfirmation;
};
```

### Delete Saved Plan
```javascript
const deleteSavedPlan = async (planId) => {
  await fetch(`/api/planner/saved/${planId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
};
```

### Customize & Select Options
```javascript
const customizeSelection = async () => {
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  
  const calculateTotal = () => {
    let total = 0;
    if (selectedOutbound) total += selectedOutbound.totalCost;
    if (selectedAccommodation) total += selectedAccommodation.totalCost;
    if (selectedReturn) total += selectedReturn.totalCost;
    return total;
  };
  
  const handleBookNow = async () => {
    await bookOptimalPlan({
      outboundTransport: selectedOutbound,
      accommodation: selectedAccommodation,
      returnTransport: selectedReturn
    });
  };
  
  const handleSaveForLater = async () => {
    await savePlanForLater(
      {
        outbound: selectedOutbound,
        accommodation: selectedAccommodation,
        return: selectedReturn
      },
      {
        name: "My Custom Plan",
        description: "Custom selected options",
        tags: ["custom"]
      }
    );
  };
};
```

---

## Database Schema

### SavedTripPlan Table
```sql
CREATE TABLE "SavedTripPlan" (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES "User"(id),
  planName VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  selectedOutboundId INTEGER REFERENCES "TransportationListing"(id),
  selectedReturnId INTEGER REFERENCES "TransportationListing"(id),
  selectedAccommodationId INTEGER REFERENCES "Accommodation"(id),
  selectedActivities INTEGER[],
  totalCost DECIMAL(10,2),
  tags TEXT[],
  originalSearchParams JSONB,
  bookedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### SavedPlanRoomAllocation Table
```sql
CREATE TABLE "SavedPlanRoomAllocation" (
  id SERIAL PRIMARY KEY,
  savedPlanId INTEGER REFERENCES "SavedTripPlan"(id) ON DELETE CASCADE,
  roomId INTEGER REFERENCES "Room"(id),
  quantity INTEGER NOT NULL
);
```

---

## Testing Checklist

### Search & Results
- [ ] Search returns all available options
- [ ] Optimal plan is highlighted
- [ ] Room allocation works for groups
- [ ] Budget filtering works correctly
- [ ] AI optimization improves results

### Booking Flow
- [ ] Quick book creates offers & bookings
- [ ] Customize allows manual selection
- [ ] Total cost calculates correctly
- [ ] Confirmation shows correct status

### Saved Plans
- [ ] Can save plan with all selections
- [ ] Can list saved plans with filters
- [ ] Can view saved plan details
- [ ] Can update saved plan (change options)
- [ ] Can delete saved plan
- [ ] Can book saved plan later
- [ ] Plan status updates to "booked"
- [ ] Expired plans are identified

### Edge Cases
- [ ] No results shows appropriate message
- [ ] Partial results (missing return transport)
- [ ] Budget too low shows suggestions
- [ ] Multi-room allocation works correctly
- [ ] AI handles conversational refinement

---

## Summary

### Key Endpoints
1. `POST /api/planner/generate` - Search trips
2. `POST /api/planner/confirm` - Book selections
3. `POST /api/planner/refine` - AI refinement
4. `POST /api/planner/saved` - Save plan
5. `GET /api/planner/saved` - List saved plans
6. `GET /api/planner/saved/:id` - Get plan details
7. `PUT /api/planner/saved/:id` - Update plan
8. `DELETE /api/planner/saved/:id` - Delete plan
9. `POST /api/planner/saved/:id/book` - Book saved plan

### User Actions
- **Search** → Browse all options + see AI recommendations
- **Quick Book** → One-click optimal plan booking
- **Customize** → Manual selection of preferences
- **Save** → Store plan as draft for later
- **Modify** → Update saved plan anytime
- **Book Later** → Convert saved plan to bookings
- **Refine** → Conversational AI adjustments

### System Behavior
- Shows ALL available options
- Highlights ONE optimal plan
- Allows user choice (optimal vs custom)
- Allocates multiple rooms automatically
- Calculates costs comprehensively
- Persists plans for future use
- Handles booking confirmation
    showErrors(result.errors);
  }
};
```

### Customize Options
```javascript
const [selectedOptions, setSelectedOptions] = useState({
  outbound: null,
  return: null,
  accommodation: null
});

const calculateTotal = () => {
  let total = 0;
  if (selectedOptions.outbound) total += selectedOptions.outbound.totalCost;
  if (selectedOptions.return) total += selectedOptions.return.totalCost;
  if (selectedOptions.accommodation) total += selectedOptions.accommodation.totalCost;
  return total;
};

// Render selection UI
<div>
  <h3>Total: ${calculateTotal()}</h3>
  <button 
    disabled={!selectedOptions.outbound || !selectedOptions.accommodation}
    onClick={() => bookPlan(selectedOptions)}
  >
    Confirm Booking
  </button>
</div>
```

---

## Response Times
- **Basic Search:** 1-2 seconds
- **AI-Optimized:** 10-20 seconds (shows progress: "Iteration 1/3...")
- **Booking:** 2-3 seconds

---

## Required Environment Variables
```bash
DATABASE_URL=postgresql://...
GEMINI_API_KEY=your_api_key  # For AI features
```

---

## Quick Reference

| Action | Endpoint | Auth | Speed |
|--------|----------|------|-------|
| Search plans | POST /generate | No | Fast |
| Search with AI | POST /generate (useAI=true) | No | Slow |
| Refine results | POST /refine | No | Medium |
| Book selections | POST /confirm | Yes | Fast |

**File Locations:**
- Model: `/src/models/planner/plannerModel.ts`
- Controller: `/src/controllers/planner/plannerController.ts`
- Routes: `/src/routes/planner/plannerRouter.ts`
- AI Service: `/src/services/aiPlannerAgent.ts`
- Types: `/src/Types/plannerTypes.ts`

---

**Version:** 1.0  
**Date:** October 27, 2025  
**Status:** Production Ready

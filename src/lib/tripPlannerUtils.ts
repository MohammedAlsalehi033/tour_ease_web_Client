
import { AccommodationOption, Room, RoomAllocation, SavedPlan } from "@/app/(model)/tripPlanner/tripPlanner.types";

export const toNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
};
  
export const getRoomCatalog = (accommodation: AccommodationOption | null): Room[] => {
    if (!accommodation) return [];
    if (Array.isArray(accommodation.roomAllocations) && accommodation.roomAllocations.length > 0) {
        return accommodation.roomAllocations.map(alloc => ({
        ...alloc.room,
        id: alloc.room?.id || alloc.roomId,
        roomType: alloc.room?.roomType || alloc.roomType || 'Unknown Room',
        capacity: alloc.room?.capacity || alloc.capacity || 0,
        pricePerNight: toNumber(alloc.pricePerNight) || toNumber(alloc.room?.pricePerNight) || 0,
        totalCost: toNumber(alloc.totalCost) || toNumber(alloc.room?.totalCost) || 0,
        })).filter(room => room.id);
    }
    return [];
};
  
export const buildInitialRoomSelections = (
    accommodation: AccommodationOption | null,
    savedAllocations?: RoomAllocation[]
    ): Record<number, { quantity: number }> => {
    const selections: Record<number, { quantity: number }> = {};
    if (!accommodation || !Array.isArray(savedAllocations) || savedAllocations.length === 0) {
        return selections;
    }

    const roomCatalog = getRoomCatalog(accommodation);

    for (const savedAllocation of savedAllocations) {
        const roomInCatalog = roomCatalog.find(r => r.id === savedAllocation.roomId);
        if (roomInCatalog) {
        selections[savedAllocation.roomId] = { quantity: savedAllocation.numberOfRooms || 1 };
        }
    }
    return selections;
};

export const buildSelectedRoomAllocations = (
    roomSelections: Record<number, { quantity: number }>,
    roomCatalog: Room[]
): (Room & { quantity: number })[] => {
    return Object.entries(roomSelections).map(([roomId, { quantity }]) => {
        const room = roomCatalog.find(r => r.id === Number(roomId));
        return room ? { ...room, quantity } : null;
    }).filter((r): r is Room & { quantity: number } => r !== null);
};

// Shared helpers and small types for the Trip Planner page
export type RoomSelectionMap = Record<number, boolean>;

export type RoomCatalogEntry = {
  id: number;
  roomType: string;
  capacity?: number;
  pricePerNight: number;
  totalCost: number;
};

export type SelectedRoomAllocation = {
  roomId: number;
  roomType: string;
  capacity: number | undefined;
  pricePerNight: number;
  totalCost: number;
};

export function toNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function extractRoomId(room: any): number | null {
  if (!room) return null;
  const idCandidate =
    room.id ??
    room.roomId ??
    room.room?.id ??
    room.Room?.id ??
    room.room?.roomId ??
    room.Room?.roomId;
  if (typeof idCandidate === 'number') return idCandidate;
  if (typeof idCandidate === 'string') {
    const parsed = parseInt(idCandidate, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

export function getRoomCatalog(acc: any): RoomCatalogEntry[] {
  const catalogMap = new Map<number, RoomCatalogEntry>();
  if (!acc) return [];

  const recordRoom = (room: any) => {
    const roomId = extractRoomId(room);
    if (roomId == null) return;

    const existing = catalogMap.get(roomId);
    const roomType =
      room.roomType ||
      room.room?.roomType ||
      room.Room?.roomType ||
      existing?.roomType ||
      'Room';
    const capacity =
      room.capacity ??
      room.room?.capacity ??
      room.Room?.capacity ??
      existing?.capacity;
    const pricePerNight = toNumber(
      room.pricePerNight ?? room.room?.pricePerNight ?? room.Room?.pricePerNight ?? existing?.pricePerNight ?? 0
    );
    const totalCost = toNumber(room.totalCost ?? existing?.totalCost ?? 0);

    catalogMap.set(roomId, {
      id: roomId,
      roomType,
      capacity,
      pricePerNight,
      totalCost
    });
  };

  if (Array.isArray(acc?.availableRooms)) {
    acc.availableRooms.forEach(recordRoom);
  }
  if (Array.isArray(acc?.rooms)) {
    acc.rooms.forEach(recordRoom);
  }
  if (Array.isArray(acc?.roomAllocations)) {
    acc.roomAllocations.forEach((allocation: any) => {
      const roomData = allocation.room || allocation.Room || allocation;
      recordRoom({
        ...roomData,
        roomType: roomData?.roomType || allocation.roomType,
        pricePerNight: allocation.pricePerNight ?? roomData?.pricePerNight,
        totalCost: allocation.totalCost,
        capacity: roomData?.capacity ?? allocation.capacity
      });
    });
  }

  return Array.from(catalogMap.values());
}

export function buildInitialRoomSelections(accommodation: any, existingAllocations?: any[]): RoomSelectionMap {
  const selections: RoomSelectionMap = {};

  const registerAllocation = (allocation: any) => {
    if (!allocation) return;
    const roomId =
      allocation.roomId ??
      allocation.Room?.id ??
      allocation.room?.id ??
      allocation.id ??
      allocation.room?.roomId ??
      allocation.Room?.roomId;
    if (roomId == null) return;
    const quantity =
      allocation.numberOfRooms ??
      allocation.quantity ??
      allocation.count ??
      allocation.rooms ??
      allocation.roomsBooked ??
      (allocation.selected ? 1 : 0);
    if (quantity && Number(quantity) > 0) {
      selections[Number(roomId)] = true;
    }
  };

  if (Array.isArray(existingAllocations) && existingAllocations.length > 0) {
    existingAllocations.forEach(registerAllocation);
    return selections;
  }

  if (Array.isArray(accommodation?.roomAllocations)) {
    accommodation.roomAllocations.forEach(registerAllocation);
  }

  return selections;
}

export function buildSelectedRoomAllocations(
  roomSelections: RoomSelectionMap,
  roomCatalog: RoomCatalogEntry[]
): SelectedRoomAllocation[] {
  const allocations = Object.entries(roomSelections)
    .filter(([, isSelected]) => Boolean(isSelected))
    .map(([roomIdStr]) => {
      const roomId = Number(roomIdStr);
      const catalogEntry = roomCatalog.find(room => room.id === roomId);
      if (!catalogEntry) return null;
      return {
        roomId,
        roomType: catalogEntry.roomType || 'Room',
        capacity: catalogEntry.capacity,
        pricePerNight: catalogEntry.pricePerNight || 0,
        totalCost: catalogEntry.totalCost || 0
      } as SelectedRoomAllocation;
    })
    .filter(Boolean) as SelectedRoomAllocation[];

  return allocations;
}

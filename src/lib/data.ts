import type { Cabin, Reservation } from './types';

export const cabins: Cabin[] = [
  {
    id: 'cabin1',
    name: 'Lakeside Retreat',
    description: 'A beautiful cabin by the serene lake, perfect for a weekend getaway.',
    imageUrl: 'https://picsum.photos/seed/cabin1/600/400',
    basePrice: 150,
    amenities: ['Wi-Fi', 'Kitchen', 'Lake View', 'Fireplace'],
    capacity: 4,
  },
  {
    id: 'cabin2',
    name: 'Mountain Hideaway',
    description: 'Cozy cabin nestled in the mountains, offering breathtaking views.',
    imageUrl: 'https://picsum.photos/seed/cabin2/600/400',
    basePrice: 180,
    amenities: ['Hot Tub', 'Mountain View', 'Hiking Trails Access', 'BBQ Grill'],
    capacity: 6,
  },
  {
    id: 'cabin3',
    name: 'Forest Haven',
    description: 'A secluded cabin deep in the forest, ideal for nature lovers.',
    imageUrl: 'https://picsum.photos/seed/cabin3/600/400',
    basePrice: 120,
    amenities: ['Pet Friendly', 'Forest Access', 'Private Deck', 'Star Gazing'],
    capacity: 2,
  },
];

// Store reservations in-memory for this example
// Note: In a real app, this state would not persist across requests/rebuilds.
// For proper persistence, a database is needed.
let reservationsStore: Reservation[] = [
  {
    id: 'res-initial-1',
    cabinId: 'cabin1',
    cabinName: 'Lakeside Retreat',
    userId: 'user123',
    checkInDate: getFutureDateString(3),
    checkOutDate: getFutureDateString(4),
    totalPrice: 150,
    status: 'confirmed',
    paymentId: 'pay_initial_xyz123',
    createdAt: new Date().toISOString(),
  },
];

// Helper to get a date string for N days from now
export function getFutureDateString(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function getBookedDates(cabinId: string): string[] {
  return reservationsStore
    .filter(res => res.cabinId === cabinId && (res.status === 'confirmed' || res.status === 'pending_payment'))
    .map(res => res.checkInDate);
}

export function calculatePrice(basePrice: number, date: Date): number {
  const day = date.getDay(); // 0 for Sunday, 6 for Saturday
  if (day === 0 || day === 6) { // Weekend
    return Math.round(basePrice * 1.2);
  }
  return basePrice;
}

export function addReservation(reservationData: Omit<Reservation, 'id' | 'createdAt' | 'status'> & { status: 'pending_payment' }): Reservation {
  const newReservation: Reservation = {
    ...reservationData,
    id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date().toISOString(),
  };
  reservationsStore.push(newReservation);
  return newReservation;
}

export function updateReservationStatus(
  reservationId: string,
  status: Reservation['status'],
  paymentId?: string
): Reservation | undefined {
  const reservationIndex = reservationsStore.findIndex(res => res.id === reservationId);
  if (reservationIndex > -1) {
    reservationsStore[reservationIndex].status = status;
    if (paymentId) {
      reservationsStore[reservationIndex].paymentId = paymentId;
    }
    return reservationsStore[reservationIndex];
  }
  return undefined;
}

export function cancelReservation(reservationId: string): Reservation | undefined {
  const reservation = reservationsStore.find(res => res.id === reservationId);
  if (reservation && (reservation.status === 'confirmed' || reservation.status === 'pending_payment')) {
    reservation.status = 'cancelled';
    return reservation;
  }
  return undefined;
}

export function getReservationsForUser(userId: string): Reservation[] {
  return reservationsStore.filter(res => res.userId === userId);
}

export function getReservationById(reservationId: string): Reservation | undefined {
  return reservationsStore.find(res => res.id === reservationId);
}

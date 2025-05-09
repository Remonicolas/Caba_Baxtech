import type { Cabin, Reservation } from './types';

export const cabins: Cabin[] = [
  {
    id: 'cabin1',
    name: 'Retiro junto al lago',
    description: 'Una hermosa cabaña junto a un lago sereno, perfecta para una escapada de fin de semana.',
    imageUrl: 'https://picsum.photos/id/10/600/400',
    basePrice: 150,
    amenities: ['Wi-Fi', 'Cocina', 'Vista al lago', 'Chimenea'],
    capacity: 4,
  },
  {
    id: 'cabin2',
    name: 'Escondite en la montaña',
    description: 'Acogedora cabaña en las montañas, con vistas impresionantes.',
    imageUrl: 'https://picsum.photos/id/28/600/400',
    basePrice: 180,
    amenities: ['Jacuzzi', 'Vista a la montaña', 'Acceso a senderos', 'Parrilla'],
    capacity: 6,
  },
  {
    id: 'cabin3',
    name: 'Refugio en el bosque',
    description: 'Cabaña aislada en medio del bosque, ideal para amantes de la naturaleza.',
    imageUrl: 'https://picsum.photos/id/76/600/400',
    basePrice: 120,
    amenities: ['Admite mascotas', 'Acceso al bosque', 'Terraza privada', 'Observación de estrellas'],
    capacity: 2,
  },
];

// Almacena las reservas en memoria solo para este ejemplo
// Nota: En una app real, este estado no persistiría entre solicitudes o recargas.
// Para una persistencia adecuada, se necesita una base de datos.
let reservationsStore: Reservation[] = [
  {
    id: 'res-initial-1',
    cabinId: 'cabin1',
    cabinName: 'Retiro junto al lago',
    userId: 'user123',
    checkInDate: getFutureDateString(3),
    checkOutDate: getFutureDateString(4),
    totalPrice: 150,
    status: 'confirmed',
    paymentId: 'pay_initial_xyz123',
    createdAt: new Date().toISOString(),
  },
];

// Función auxiliar para obtener una fecha N días en el futuro
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
  const day = date.getDay(); // 0 es domingo, 6 es sábado
  if (day === 0 || day === 6) { // Fin de semana
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

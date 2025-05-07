export interface Cabin {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  amenities: string[];
  capacity: number;
}

export interface Reservation {
  id: string;
  cabinId: string;
  cabinName: string;
  userId: string; // Simplified: using a generic user ID
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD (1 night stay)
  totalPrice: number;
  status: 'pending_payment' | 'confirmed' | 'cancelled' | 'payment_failed';
  paymentId?: string;
  createdAt: string; // ISO date string
}

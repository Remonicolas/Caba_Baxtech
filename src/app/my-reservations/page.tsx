
import { Suspense } from 'react';
import MyReservationsClient from './MyReservationsClient';

export default function MyReservationsPage() {
  return (
    <Suspense fallback={<div>Loading your reservations...</div>}>
      <MyReservationsClient />
    </Suspense>
  );
}

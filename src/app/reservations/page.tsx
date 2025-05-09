
import { Suspense } from 'react';
import ReservationsClient from './ReservationsClient';

export default function ReservationPage() {
  return (
    <Suspense fallback={<div>Loading reservation options...</div>}>
      <ReservationsClient />
    </Suspense>
  );
}

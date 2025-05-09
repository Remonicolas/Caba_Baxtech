
import React, { Suspense } from 'react';
import PaymentClient from './PaymentClient';

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Cargando pago...</div>}>
      <PaymentClient />
    </Suspense>
  );
}

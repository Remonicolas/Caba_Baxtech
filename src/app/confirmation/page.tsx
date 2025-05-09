
import { Suspense } from 'react';
import ConfirmationClient from './ConfirmationClient';

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading confirmation details...</div>}>
      <ConfirmationClient />
    </Suspense>
  );
}

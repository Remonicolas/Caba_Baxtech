
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Home, CalendarDays, Eye } from 'lucide-react';
import { format } from 'date-fns';

import type { Reservation } from '@/lib/types';
import { getReservationById } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

export default function ConfirmationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const reservationId = searchParams.get('reservationId');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (reservationId) {
      const res = getReservationById(reservationId);
      if (res && res.status === 'confirmed') {
        setReservation(res);
      } else {
        toast({
          title: "Invalid Confirmation",
          description: "Reservation not found or not confirmed.",
          variant: "destructive",
        });
        router.push('/my-reservations');
      }
    } else {
      toast({
          title: "Missing Reservation ID",
          description: "No reservation ID provided for confirmation.",
          variant: "destructive",
        });
      router.push('/');
    }
    setIsLoading(false);
  }, [reservationId, router, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex justify-center items-center">
          <p className="text-lg text-foreground/80">Loading confirmation...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!reservation) {
     // Fallback, should be handled by useEffect redirect
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <p className="text-lg text-destructive">Could not load reservation details.</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            <Home className="mr-2 h-4 w-4" /> Go to Homepage
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader className="bg-accent/10 p-8 rounded-t-lg text-center">
            <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
            <CardTitle className="text-3xl md:text-4xl text-accent">Reservation Confirmed!</CardTitle>
            <CardDescription className="text-accent/80 text-lg mt-2">
              Thank you for booking with CabinStay. Your getaway is secured.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6">
            <Alert variant="default" className="bg-secondary/10 border-secondary/30">
              <AlertTitle className="font-semibold text-secondary-foreground">Your Booking Details:</AlertTitle>
              <AlertDescription className="text-secondary-foreground/90 mt-2 space-y-1">
                <p><strong>Cabin:</strong> {reservation.cabinName}</p>
                <p>
                  <strong>Dates:</strong> {format(new Date(reservation.checkInDate + 'T00:00:00'), 'PPP')} - {format(new Date(reservation.checkOutDate + 'T00:00:00'), 'PPP')}
                </p>
                <p><strong>Total Price:</strong> ${reservation.totalPrice}</p>
                <p><strong>Reservation ID:</strong> {reservation.id}</p>
                <p><strong>Payment ID:</strong> {reservation.paymentId || 'N/A'}</p>
              </AlertDescription>
            </Alert>
            
            <p className="text-center text-foreground/80">
              A confirmation email has been (simulated) sent to your address. 
              You can view and manage your bookings in the "My Reservations" section.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Button onClick={() => router.push('/my-reservations')} variant="outline" className="border-primary text-primary hover:bg-primary/10" size="lg">
                <Eye className="mr-2 h-5 w-5" /> View My Reservations
              </Button>
              <Button onClick={() => router.push('/')} className="bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
                <CalendarDays className="mr-2 h-5 w-5" /> Book Another Cabin
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

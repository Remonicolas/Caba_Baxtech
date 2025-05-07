'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CreditCard, AlertTriangle, CheckCircle, Home } from 'lucide-react';
import { format } from 'date-fns';

import type { Reservation } from '@/lib/types';
import { getReservationById, updateReservationStatus } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const reservationId = searchParams.get('reservationId');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (reservationId) {
      const res = getReservationById(reservationId);
      if (res && res.status === 'pending_payment') {
        setReservation(res);
      } else if (res) {
        // Already processed or invalid status
        toast({
          title: "Invalid Reservation Status",
          description: "This reservation cannot be processed for payment.",
          variant: "destructive",
        });
        router.push(res.status === 'confirmed' ? `/confirmation?reservationId=${res.id}` : '/my-reservations');
      }
       else {
        toast({
          title: "Reservation Not Found",
          description: "Could not find the reservation details.",
          variant: "destructive",
        });
        router.push('/');
      }
    } else {
       toast({
          title: "Missing Reservation ID",
          description: "No reservation ID provided for payment.",
          variant: "destructive",
        });
      router.push('/');
    }
    setIsLoading(false);
  }, [reservationId, router, toast]);

  const handlePayment = async (success: boolean) => {
    if (!reservation) return;

    setIsProcessingPayment(true);

    // Simulate payment API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    let updatedReservation: Reservation | undefined;
    if (success) {
      const paymentId = `pay_${Date.now()}`;
      updatedReservation = updateReservationStatus(reservation.id, 'confirmed', paymentId);
      if (updatedReservation) {
        toast({
          title: "Payment Successful!",
          description: "Your reservation is confirmed.",
          variant: "default",
          className: "bg-accent text-accent-foreground border-accent/50",
        });
        router.push(`/confirmation?reservationId=${reservation.id}`);
      } else {
        // This case should ideally not happen if updateReservationStatus is robust
         toast({
          title: "Update Error",
          description: "Payment was successful but status update failed. Contact support.",
          variant: "destructive",
        });
        setIsProcessingPayment(false);
      }
    } else {
      updatedReservation = updateReservationStatus(reservation.id, 'payment_failed');
       toast({
          title: "Payment Failed",
          description: "Your payment could not be processed. Please try again or use a different payment method.",
          variant: "destructive",
        });
      setIsProcessingPayment(false);
      if (updatedReservation) {
        setReservation(updatedReservation); // Update local state to show payment_failed
      }
    }
  };

  if (isLoading) {
    return (
       <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-foreground/80">Loading payment details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!reservation) {
    // This case should be handled by useEffect redirect, but as a fallback:
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
           <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Reservation details could not be loaded. Please try navigating from your bookings.
            </AlertDescription>
          </Alert>
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
        <Card className="max-w-lg mx-auto shadow-xl">
          <CardHeader className="bg-card-foreground/5 p-6 rounded-t-lg">
            <CardTitle className="text-3xl text-accent">Complete Your Payment</CardTitle>
            <CardDescription className="text-foreground/70">
              Review your reservation details and proceed with payment for {reservation.cabinName}.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Reservation Summary:</h3>
              <p className="text-foreground/80"><strong>Cabin:</strong> {reservation.cabinName}</p>
              <p className="text-foreground/80">
                <strong>Dates:</strong> {format(new Date(reservation.checkInDate + 'T00:00:00'), 'PPP')} - {format(new Date(reservation.checkOutDate + 'T00:00:00'), 'PPP')}
              </p>
              <p className="text-2xl font-bold text-accent mt-2">
                Total Amount: ${reservation.totalPrice}
              </p>
            </div>

            {reservation.status === 'payment_failed' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle>Previous Payment Attempt Failed</AlertTitle>
                <AlertDescription>
                  Your last payment attempt was unsuccessful. Please try again.
                </AlertDescription>
              </Alert>
            )}
            
            <Alert variant="default" className="bg-secondary/10 border-secondary/30">
              <CreditCard className="h-5 w-5 text-secondary-foreground" />
              <AlertTitle className="text-secondary-foreground font-semibold">Payment Simulation</AlertTitle>
              <AlertDescription className="text-secondary-foreground/80">
                This is a simulated payment process. No real transaction will occur.
              </AlertDescription>
            </Alert>

          </CardContent>
          <CardFooter className="p-6 bg-card-foreground/5 rounded-b-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              onClick={() => handlePayment(true)}
              disabled={isProcessingPayment}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              {isProcessingPayment ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-5 w-5" />
              )}
              Simulate Successful Payment
            </Button>
            <Button
              onClick={() => handlePayment(false)}
              disabled={isProcessingPayment}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              {isProcessingPayment ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <AlertTriangle className="mr-2 h-5 w-5" />
              )}
              Simulate Failed Payment
            </Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

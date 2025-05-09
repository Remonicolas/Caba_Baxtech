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
        // Ya procesado o estado inválido
        toast({
          title: "Estado de Reserva Inválido",
          description: "Esta reserva no puede ser procesada para el pago.",
          variant: "destructive",
        });
        router.push(res.status === 'confirmed' ? `/confirmation?reservationId=${res.id}` : '/my-reservations');
      } else {
        toast({
          title: "Reserva No Encontrada",
          description: "No se pudo encontrar los detalles de la reserva.",
          variant: "destructive",
        });
        router.push('/');
      }
    } else {
      toast({
        title: "ID de Reserva Faltante",
        description: "No se proporcionó un ID de reserva para el pago.",
        variant: "destructive",
      });
      router.push('/');
    }
    setIsLoading(false);
  }, [reservationId, router, toast]);

  const handlePayment = async (success: boolean) => {
    if (!reservation) return;

    setIsProcessingPayment(true);

    // Simulamos la llamada a la API de pago
    await new Promise(resolve => setTimeout(resolve, 2000));

    let updatedReservation: Reservation | undefined;
    if (success) {
      const paymentId = `pay_${Date.now()}`;
      updatedReservation = updateReservationStatus(reservation.id, 'confirmed', paymentId);
      if (updatedReservation) {
        toast({
          title: "¡Pago Exitoso!",
          description: "Tu reserva ha sido confirmada.",
          variant: "default",
          className: "bg-accent text-accent-foreground border-accent/50",
        });
        router.push(`/confirmation?reservationId=${reservation.id}`);
      } else {
        toast({
          title: "Error de Actualización",
          description: "El pago fue exitoso, pero la actualización del estado falló. Contacta con soporte.",
          variant: "destructive",
        });
        setIsProcessingPayment(false);
      }
    } else {
      updatedReservation = updateReservationStatus(reservation.id, 'payment_failed');
      toast({
        title: "Pago Fallido",
        description: "No se pudo procesar tu pago. Intenta de nuevo o usa otro método de pago.",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
      if (updatedReservation) {
        setReservation(updatedReservation); // Actualizar estado local para mostrar payment_failed
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-foreground/80">Cargando detalles del pago...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              No se pudieron cargar los detalles de la reserva. Intenta navegar desde tus reservas.
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/')} className="mt-4">
            <Home className="mr-2 h-4 w-4" /> Ir al Inicio
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
            <CardTitle className="text-3xl text-accent">Completa tu Pago</CardTitle>
            <CardDescription className="text-foreground/70">
              Revisa los detalles de tu reserva y procede con el pago de la cabaña {reservation.cabinName}.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Resumen de la Reserva:</h3>
              <p className="text-foreground/80"><strong>Cabaña:</strong> {reservation.cabinName}</p>
              <p className="text-foreground/80">
                <strong>Fechas:</strong> {format(new Date(reservation.checkInDate + 'T00:00:00'), 'PPP')} - {format(new Date(reservation.checkOutDate + 'T00:00:00'), 'PPP')}
              </p>
              <p className="text-2xl font-bold text-accent mt-2">
                Monto Total: ${reservation.totalPrice}
              </p>
            </div>

            {reservation.status === 'payment_failed' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle>Intento de Pago Fallido Anterior</AlertTitle>
                <AlertDescription>
                  Tu último intento de pago no fue exitoso. Por favor, intenta de nuevo.
                </AlertDescription>
              </Alert>
            )}
            
            <Alert variant="default" className="bg-secondary/10 border-secondary/30">
              <CreditCard className="h-5 w-5 text-secondary-foreground" />
              <AlertTitle className="text-secondary-foreground font-semibold">Simulación de Pago</AlertTitle>
              <AlertDescription className="text-secondary-foreground/80">
                Este es un proceso de pago simulado. No se realizará ninguna transacción real.
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
              Simular Pago Exitoso
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
              Simular Pago Fallido
            </Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

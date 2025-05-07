'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarX2, CheckCircle, XCircle, Hourglass, DollarSign, Home, Info, ListChecks } from 'lucide-react';

import type { Reservation } from '@/lib/types';
import { getReservationsForUser, cancelReservation as apiCancelReservation } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function MyReservationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>('testUser123'); // Placeholder for actual user ID

  useEffect(() => {
    // In a real app, userId would come from auth context
    const userReservations = getReservationsForUser(userId);
    setReservations(userReservations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setIsLoading(false);
  }, [userId]);

  const handleCancelReservation = async (reservationId: string) => {
    try {
      // In a real app, this would be an API call
      const updatedReservation = apiCancelReservation(reservationId);
      if (updatedReservation) {
        setReservations(prev =>
          prev.map(res => (res.id === reservationId ? updatedReservation : res))
        );
        toast({
          title: "Reservation Cancelled",
          description: `Your reservation for ${updatedReservation.cabinName} has been cancelled.`,
          variant: "default",
          className: "bg-accent text-accent-foreground border-accent/50"
        });
      } else {
        toast({
          title: "Cancellation Failed",
          description: "Could not cancel the reservation. It might have already been processed or cancelled.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during cancellation.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white"><CheckCircle size={14} className="mr-1" />Confirmed</Badge>;
      case 'pending_payment':
        return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-black"><Hourglass size={14} className="mr-1" />Pending Payment</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="bg-red-600 hover:bg-red-700"><XCircle size={14} className="mr-1" />Cancelled</Badge>;
      case 'payment_failed':
        return <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600"><CalendarX2 size={14} className="mr-1" />Payment Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex justify-center items-center">
          <p className="text-lg text-foreground/80">Loading your reservations...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="flex flex-col items-center mb-10">
          <ListChecks className="h-16 w-16 text-accent mb-4" />
          <h1 className="text-4xl font-bold text-accent text-center">My Reservations</h1>
          <p className="text-lg text-foreground/70 mt-2 text-center max-w-xl">
            View, manage, or cancel your cabin bookings. Your adventure history, all in one place.
          </p>
        </div>

        {reservations.length === 0 ? (
          <Card className="text-center py-12 shadow-lg">
            <CardHeader>
              <CalendarX2 size={48} className="mx-auto text-muted-foreground mb-4" />
              <CardTitle className="text-2xl text-foreground">No Reservations Yet</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-lg text-muted-foreground">
                You haven't made any bookings. Time to find your perfect cabin!
              </CardDescription>
            </CardContent>
            <CardFooter className="justify-center">
              <Button onClick={() => router.push('/')} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Home className="mr-2 h-5 w-5" /> Explore Cabins
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="space-y-6">
            {reservations.map(res => (
              <Card key={res.id} className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <CardHeader className={cn(
                    "p-4 sm:p-6",
                    res.status === 'confirmed' && 'bg-green-500/10',
                    res.status === 'pending_payment' && 'bg-yellow-500/10',
                    res.status === 'cancelled' && 'bg-red-500/10',
                    res.status === 'payment_failed' && 'bg-orange-500/10',
                  )}>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <CardTitle className="text-xl text-accent">{res.cabinName}</CardTitle>
                    {getStatusBadge(res.status)}
                  </div>
                   <CardDescription className="text-sm text-foreground/70 mt-1">
                    Booked on: {format(new Date(res.createdAt), 'PPP p')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-foreground">Dates:</p>
                    <p className="text-foreground/80">
                      {format(new Date(res.checkInDate + 'T00:00:00'), 'EEE, MMM d, yyyy')} - {format(new Date(res.checkOutDate + 'T00:00:00'), 'EEE, MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground flex items-center">
                      <DollarSign size={16} className="mr-1 text-primary" /> Total Price:
                    </p>
                    <p className="text-foreground/80">${res.totalPrice}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-semibold text-foreground">Reservation ID:</p>
                    <p className="text-xs text-muted-foreground">{res.id}</p>
                  </div>
                </CardContent>
                {(res.status === 'confirmed' || res.status === 'pending_payment') && (
                  <CardFooter className="p-4 sm:p-6 bg-muted/30">
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <XCircle size={16} className="mr-2" /> Cancel Reservation
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will cancel your reservation for {res.cabinName} from {format(new Date(res.checkInDate + 'T00:00:00'), 'PPP')} to {format(new Date(res.checkOutDate + 'T00:00:00'), 'PPP')}. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleCancelReservation(res.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            Confirm Cancellation
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                )}
                {res.status === 'payment_failed' && (
                   <CardFooter className="p-4 sm:p-6 bg-muted/30">
                    <Button onClick={() => router.push(`/payment?reservationId=${res.id}`)} variant="outline" className="border-primary text-primary hover:bg-primary/10">
                      <Info size={16} className="mr-2" /> Retry Payment
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

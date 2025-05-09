
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { CalendarIcon, AlertTriangle, CheckCircle, Info, Users, DollarSign } from 'lucide-react';
import { format, addDays } from 'date-fns';

import type { Cabin, Reservation } from '@/lib/types';
import { cabins, getBookedDates, calculatePrice, addReservation } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ReservationsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const cabinId = searchParams.get('cabinId');
  const [selectedCabin, setSelectedCabin] = useState<Cabin | null>(null);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true); // This manages loading of cabin details

  useEffect(() => {
    setIsLoading(true); // Start loading when cabinId changes or on mount
    if (cabinId) {
      const cabin = cabins.find(c => c.id === cabinId);
      if (cabin) {
        setSelectedCabin(cabin);
        const cabinBookedDates = getBookedDates(cabinId).map(dateStr => new Date(dateStr + 'T00:00:00'));
        setBookedDates(cabinBookedDates);
      } else {
        toast({
          title: "Cabin not found",
          description: "The selected cabin could not be found. Please try again.",
          variant: "destructive",
        });
        router.push('/');
      }
    } else {
      toast({
          title: "No Cabin Selected",
          description: "Please select a cabin first.",
          variant: "destructive",
        });
      router.push('/');
    }
    setIsLoading(false); // Finish loading
  }, [cabinId, router, toast]);

  const currentPrice = useMemo(() => {
    if (selectedCabin && checkInDate) {
      return calculatePrice(selectedCabin.basePrice, checkInDate);
    }
    return selectedCabin?.basePrice || 0;
  }, [selectedCabin, checkInDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const isBooked = bookedDates.some(
        bookedDate => format(bookedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      if (isBooked) {
         toast({
          title: "Date Unavailable",
          description: "This date is already booked. Please select another date.",
          variant: "destructive",
        });
        return;
      }
      if (date < new Date(new Date().setHours(0,0,0,0))) {
        toast({
          title: "Invalid Date",
          description: "Cannot book dates in the past. Please select a future date.",
          variant: "destructive",
        });
        return;
      }
    }
    setCheckInDate(date);
  };

  const handleConfirmReservation = async () => {
    if (!selectedCabin || !checkInDate) {
      toast({
        title: "Missing Information",
        description: "Please select a cabin and a check-in date.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true); // Indicate processing
    const reservationData: Omit<Reservation, 'id' | 'createdAt'> = {
      cabinId: selectedCabin.id,
      cabinName: selectedCabin.name,
      userId: 'testUser123', 
      checkInDate: format(checkInDate, 'yyyy-MM-dd'),
      checkOutDate: format(addDays(checkInDate, 1), 'yyyy-MM-dd'),
      totalPrice: currentPrice,
      status: 'pending_payment',
    };
    
    try {
      const newReservation = addReservation(reservationData as Reservation & { status: 'pending_payment' });
      router.push(`/payment?reservationId=${newReservation.id}`);
    } catch (error) {
      console.error("Reservation error:", error);
      toast({
        title: "Reservation Failed",
        description: "Could not create reservation. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false); // Reset loading on error
    }
    // setIsLoading(false) might not be reached if router.push succeeds quickly.
    // The page transition handles the visual change.
  };
  
  if (isLoading || !selectedCabin) { // Manages initial loading of cabin data
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex justify-center items-center">
          <p className="text-lg text-foreground/80">Cargando detalles de cabaña...</p>
        </main>
        <Footer />
      </div>
    );
  }
  
  const dataAiHint = selectedCabin.name.toLowerCase().includes('lake') ? 'cabin lake' : 
                     selectedCabin.name.toLowerCase().includes('mountain') ? 'cabin mountain' : 'cabin forest';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto shadow-xl">
          <CardHeader className="bg-card-foreground/5 p-6 rounded-t-lg">
            <CardTitle className="text-3xl text-accent">{selectedCabin.name}</CardTitle>
            <CardDescription className="text-foreground/70">{selectedCabin.description}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="relative w-full h-64 rounded-md overflow-hidden shadow-md">
              <Image
                src={selectedCabin.imageUrl}
                alt={selectedCabin.name}
                fill
                style={{objectFit: 'cover'}}
                data-ai-hint={dataAiHint}
                priority={true} // For LCP
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Seleccion Check-in Date</h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !checkInDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      {checkInDate ? format(checkInDate, "PPP") : <span>Elegi la fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover" align="start">
                    <Calendar
                      mode="single"
                      selected={checkInDate}
                      onSelect={handleDateSelect}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0,0,0,0)) || 
                        bookedDates.some(bookedDate => format(bookedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                 <p className="text-sm text-muted-foreground flex items-center">
                  <Info size={14} className="mr-1 text-primary" />
                  Las reservas son por una noche. La salida es al día siguiente..
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Detalles de cabaña</h3>
                <p className="flex items-center text-foreground/80">
                  <Users size={16} className="mr-2 text-primary" /> Capacidad: {selectedCabin.capacity} guests
                </p>
                <p className="text-2xl font-bold text-accent flex items-center">
                  <DollarSign size={24} className="mr-1" /> Precio: ${currentPrice}
                  <span className="text-sm font-normal text-muted-foreground ml-1">/night</span>
                </p>
              </div>
            </div>

            {checkInDate && (
              <Alert variant="default" className="bg-accent/10 border-accent/30">
                <CheckCircle className="h-5 w-5 text-accent" />
                <AlertTitle className="text-accent font-semibold">Has seleccionado:</AlertTitle>
                <AlertDescription className="text-accent/90">
                  Check-in: {format(checkInDate, "PPP")} <br />
                  Check-out: {format(addDays(checkInDate, 1), "PPP")} <br />
                  Precio Total: ${currentPrice}
                </AlertDescription>
              </Alert>
            )}

            {!checkInDate && (
              <Alert variant="default" className="bg-secondary/10 border-secondary/30">
                <AlertTriangle className="h-5 w-5 text-secondary-foreground" />
                <AlertTitle className="text-secondary-foreground">Seleccione fecha</AlertTitle>
                <AlertDescription className="text-secondary-foreground/80">
                  Seleccione una fecha de llegada para ver el precio final y continuar con su reserva.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="p-6 bg-card-foreground/5 rounded-b-lg">
            <Button
              onClick={handleConfirmReservation}
              disabled={!checkInDate || isLoading} // Disable button while processing
              className="w-full text-lg py-3 bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              {isLoading && !selectedCabin ? "Loading..." : // Initial page load
               isLoading ? "Processing..." : "Proceed to Payment"}
            </Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

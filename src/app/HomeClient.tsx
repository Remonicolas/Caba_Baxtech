
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Cabin } from '@/lib/types';
import { cabins } from '@/lib/data';
import { CabinCard } from '@/components/CabinCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function HomeClient() {
  const router = useRouter();
  const [selectedCabin, setSelectedCabin] = useState<Cabin | null>(null);

  const handleBookNow = (cabin: Cabin) => {
    setSelectedCabin(cabin); // Optional: can be used for modal or direct navigation
    router.push(`/reservations?cabinId=${cabin.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-accent mb-4">
            Discover Your Perfect Cabin Getaway
          </h1>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Escape to nature with our selection of beautiful and cozy cabins. Find the ideal spot for your next adventure or relaxing retreat.
          </p>
        </section>

        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cabins.map((cabin) => (
              <CabinCard key={cabin.id} cabin={cabin} onBookNow={handleBookNow} />
            ))}
          </div>
        </section>

        <section className="text-center mt-16 py-12 bg-card rounded-lg shadow-md">
          <h2 className="text-3xl font-semibold text-accent mb-4">Ready for an Adventure?</h2>
          <p className="text-foreground/80 mb-6 max-w-xl mx-auto">
            View your existing bookings or explore more options. Your next unforgettable experience is just a click away.
          </p>
          <Button size="lg" onClick={() => router.push('/my-reservations')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            My Reservations
            <ArrowRight size={20} className="ml-2" />
          </Button>
        </section>
      </main>
      <Footer />
    </div>
  );
}

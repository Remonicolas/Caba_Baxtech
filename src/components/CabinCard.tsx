"use client";

import Image from 'next/image';
import type { Cabin } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  BedDouble,
  DollarSign,
  Wifi,
  MountainSnow,
  Waves,
  Utensils,
} from 'lucide-react';
import { Badge } from './ui/badge';

interface CabinCardProps {
  cabin: Cabin;
  onBookNow: (cabin: Cabin) => void;
}

function IconoBosque(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m17 14 3-3-3-3" />
      <path d="M7 14l-3-3 3-3" />
      <path d="M12 19l-3-3 3-3" />
      <path d="M12 19l3-3-3-3" />
      <path d="M12 22v-3" />
      <path d="M12 9V2" />
      <path d="m4.22 10.78-1.19.22" />
      <path d="m19.78 10.78 1.19.22" />
      <path d="M4.22 13.22l-1.19-.22" />
      <path d="m19.78 13.22 1.19-.22" />
    </svg>
  );
}

const iconosServicios: { [key: string]: React.ElementType } = {
  'Wi-Fi': Wifi,
  'Cocina': Utensils,
  'Vista al Lago': Waves,
  'Chimenea': BedDouble,
  'Hidromasaje': () => <span className="text-sm">♨️</span>,
  'Vista a la Montaña': MountainSnow,
  'Acceso a Senderos': MountainSnow,
  'Parrilla': BedDouble,
  'Apto Mascotas': () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 10c0-2.5-2-4.5-4.5-4.5S5.5 7.5 5.5 10s2 4.5 4.5 4.5 4.5-2 4.5-4.5Z" />
      <path d="M11.5 17H12c1.7 0 3 1.3 3 3V21" />
      <path d="m5 21 4-4" />
      <path d="M17.5 10c4.5 0 4.5-4.5 4.5-4.5S17.5 1 17.5 1 13 5.5 13 10c0 2 1 3.5 2.5 4.5" />
    </svg>
  ),
  'Acceso al Bosque': IconoBosque,
  'Deck Privado': () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  ),
  'Observación de Estrellas': () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l1.88 5.84L20 9.24l-4.94 4.2L16.24 20 12 16.54 7.76 20l1.18-6.56L4 9.24l6.12-1.4Z" />
    </svg>
  ),
};

export function CabinCard({ cabin, onBookNow }: CabinCardProps) {
  const dataAiHint = cabin.name.toLowerCase().includes('lago')
    ? 'cabaña lago'
    : cabin.name.toLowerCase().includes('montaña')
    ? 'cabaña montaña'
    : 'cabaña bosque';

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
      <CardHeader className="p-0">
        <div className="relative w-full h-48">
          <Image
            src={cabin.imageUrl}
            alt={cabin.name}
            fill
            style={{ objectFit: "cover" }}
            data-ai-hint={dataAiHint}
            priority={cabin.id === 'cabin1'}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-6">
          <CardTitle className="text-2xl text-accent">{cabin.name}</CardTitle>
          <CardDescription className="mt-1 text-foreground/80">
            {cabin.description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-6 pt-0">
        <div className="space-y-3">
          <div className="flex items-center text-foreground/90">
            <Users size={18} className="mr-2 text-primary" />
            <span>Capacidad: {cabin.capacity} personas</span>
          </div>
          <div className="flex items-center text-foreground/90">
            <DollarSign size={18} className="mr-2 text-primary" />
            <span>Desde ${cabin.basePrice}/noche</span>
          </div>
          <div>
            <h4 className="font-semibold mb-1 text-foreground/90">
              Servicios:
            </h4>
            <div className="flex flex-wrap gap-2">
              {cabin.amenities.map((amenity) => {
                const Icono = iconosServicios[amenity] || BedDouble;
                const iconElement =
                  typeof Icono === 'function' && Icono.displayName
                    ? <Icono size={14} />
                    : <Icono />;
                return (
                  <Badge
                    key={amenity}
                    variant="secondary"
                    className="flex items-center gap-1.5 bg-secondary/70 text-secondary-foreground/90"
                  >
                    {iconElement}
                    {amenity}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button
          onClick={() => onBookNow(cabin)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Ver disponibilidad y reservar
        </Button>
      </CardFooter>
    </Card>
  );
}

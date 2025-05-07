"use client";

import Link from 'next/link';
import { TreePine } from 'lucide-react';

export function Header() {
  return (
    <header className="py-6 mb-8 border-b border-border">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-accent hover:text-accent/90 transition-colors">
          <TreePine size={28} />
          <span>CabinStay</span>
        </Link>
        {/* Future navigation links can go here */}
      </div>
    </header>
  );
}

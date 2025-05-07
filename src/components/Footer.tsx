"use client";

export function Footer() {
  return (
    <footer className="py-8 mt-16 border-t border-border text-center text-muted-foreground">
      <p>&copy; {new Date().getFullYear()} CabinStay. All rights reserved.</p>
      <p className="text-sm mt-1">Find your perfect nature escape.</p>
    </footer>
  );
}

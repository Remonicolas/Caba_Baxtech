"use client";

export function Footer() {
  return (
    <footer className="py-8 mt-16 border-t border-border text-center text-muted-foreground">
      <p>&copy; {new Date().getFullYear()} Baxtech. Derechos reservados.</p>
      <p className="text-sm mt-1">Encontratu escapada perfecta a la naturaleza.</p>
    </footer>
  );
}

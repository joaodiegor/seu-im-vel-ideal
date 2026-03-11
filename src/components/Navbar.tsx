import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-primary-foreground/10">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <Home className="h-6 w-6 text-coral" />
          <span className="text-xl font-bold text-primary-foreground font-display">ImovelJá</span>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#como-funciona" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
            Como funciona
          </a>
          <a href="#corretores" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
            Corretores
          </a>
          <Button variant="hero" size="sm">
            Publicar pedido
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-primary-foreground" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-primary/95 backdrop-blur-md border-t border-primary-foreground/10 px-6 pb-4 space-y-3">
          <a href="#como-funciona" className="block text-sm text-primary-foreground/80 py-2">Como funciona</a>
          <a href="#corretores" className="block text-sm text-primary-foreground/80 py-2">Corretores</a>
          <Button variant="hero" size="sm" className="w-full">Publicar pedido</Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

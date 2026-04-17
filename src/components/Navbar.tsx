import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Menu, X, LogOut, User, LayoutDashboard, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const isBroker = profile?.user_type === "broker";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <img src="/images/logo-color.png" alt="Brazuka Imóveis" className="h-20" />
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <a href="/#como-funciona" className="text-sm text-foreground/70 hover:text-primary transition-colors">
            Como funciona
          </a>
          <a href="/corretores" className="text-sm text-foreground/70 hover:text-primary transition-colors">
            Corretores
          </a>
          {user && isBroker && (
            <a href="/painel-corretor" className="text-sm text-foreground/70 hover:text-primary transition-colors flex items-center gap-1.5">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Painel
            </a>
          )}
          {user && !isBroker && (
            <a href="/meus-pedidos" className="text-sm text-foreground/70 hover:text-primary transition-colors flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Meus Pedidos
            </a>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-foreground hover:bg-muted gap-2">
                  <User className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">
                    {profile?.full_name || user.email?.split("@")[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{profile?.full_name || "Usuário"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  {profile?.user_type && (
                    <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {profile.user_type === "buyer" ? "Comprador" : "Corretor"}
                    </span>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <a href="/perfil"><User className="h-4 w-4 mr-2" />Meu Perfil</a>
                </DropdownMenuItem>
                {isBroker ? (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <a href="/painel-corretor"><LayoutDashboard className="h-4 w-4 mr-2" />Painel do Corretor</a>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <a href="/meus-pedidos"><FileText className="h-4 w-4 mr-2" />Meus Pedidos</a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <a href="/auth" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                Entrar
              </a>
              <Button variant="hero" size="sm" asChild>
                <a href="/auth">Cadastrar</a>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-border px-6 pb-4 space-y-3">
          <a href="/#como-funciona" className="block text-sm text-foreground/70 py-2" onClick={() => setOpen(false)}>Como funciona</a>
          <a href="/corretores" className="block text-sm text-foreground/70 py-2">Corretores</a>
          {user ? (
            <>
              <a href="/perfil" className="block text-sm text-foreground/70 py-2">Meu Perfil</a>
              {isBroker ? (
                <a href="/painel-corretor" className="block text-sm text-foreground/70 py-2">Painel do Corretor</a>
              ) : (
                <a href="/meus-pedidos" className="block text-sm text-foreground/70 py-2">Meus Pedidos</a>
              )}
              <div className="text-sm text-foreground/70 py-2">
                Olá, {profile?.full_name || user.email?.split("@")[0]}
              </div>
              <Button variant="ghost" size="sm" className="w-full" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" /> Sair
              </Button>
            </>
          ) : (
            <Button variant="hero" size="sm" className="w-full" asChild>
              <a href="/auth">Entrar / Cadastrar</a>
            </Button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

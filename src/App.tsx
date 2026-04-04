import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Pedidos from "./pages/Pedidos.tsx";
import PainelCorretor from "./pages/PainelCorretor.tsx";
import MeusPedidos from "./pages/MeusPedidos.tsx";
import Perfil from "./pages/Perfil.tsx";
import Corretores from "./pages/Corretores.tsx";
import InstallPWA from "./components/InstallPWA.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/painel-corretor" element={<PainelCorretor />} />
            <Route path="/meus-pedidos" element={<MeusPedidos />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/corretores" element={<Corretores />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <InstallPWA />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

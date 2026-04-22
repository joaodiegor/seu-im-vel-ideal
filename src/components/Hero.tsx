import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BRAZIL_STATES, getCitiesByState } from "@/lib/locations";

const Hero = () => {
  const { user } = useAuth();
  const [brokerCount, setBrokerCount] = useState<number>(0);
  const [quickTipo, setQuickTipo] = useState("");
  const [quickEstado, setQuickEstado] = useState("");
  const [quickCidade, setQuickCidade] = useState("");
  const [locLoading, setLocLoading] = useState<"estado" | null>(null);

  const quickCities = quickEstado ? getCitiesByState(quickEstado) : [];

  useEffect(() => {
    supabase
      .from("profiles")
      .select("user_id", { count: "exact", head: true })
      .eq("user_type", "broker")
      .then(({ count }) => setBrokerCount(count ?? 0));
  }, []);

  const triggerPrefillAndScroll = (tipo: string, estado: string, cidade: string) => {
    window.dispatchEvent(new CustomEvent("prefill-request", {
      detail: { tipo, estado, cidade },
    }));
    setTimeout(() => {
      document.getElementById("publicar")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleQuickSearch = () => {
    triggerPrefillAndScroll(quickTipo, quickEstado, quickCidade);
  };

  const handleCityChange = (v: string) => {
    setQuickCidade(v);
    // Auto-expand: ao selecionar cidade, leva o usuário aos demais campos do pedido
    triggerPrefillAndScroll(quickTipo, quickEstado, v);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-hero">
      {/* Decorative pattern inspired by azulejos */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="container relative z-10 mx-auto px-6 py-20">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            <span className="inline-block rounded-full bg-accent/20 px-4 py-1.5 text-sm font-medium text-accent-foreground mb-6 backdrop-blur-sm border border-accent-foreground/10">
              🇧🇷 Em todo o Brasil
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-[1.1] mb-6 font-display"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}>
            Diga o que você quer.{" "}
            <span className="text-coral">Corretores encontram</span>{" "}
            para você.
          </motion.h1>

          <motion.p
            className="text-lg text-primary-foreground/80 mb-8 max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}>
            Descreva o imóvel dos seus sonhos e receba propostas exclusivas dos melhores corretores do Brasil.
          </motion.p>

          {user && (
            <motion.div
              className="bg-card rounded-2xl p-4 sm:p-5 shadow-elevated border border-border/50"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Tipo</label>
                  <Select value={quickTipo} onValueChange={setQuickTipo}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Qualquer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartamento">Apartamento</SelectItem>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="casa_condominio">Casa de Condomínio</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="terreno">Terreno / Lote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Estado</label>
                  <Select
                    value={quickEstado}
                    onValueChange={(v) => {
                      setLocLoading("estado");
                      setQuickEstado(v);
                      setQuickCidade("");
                      setTimeout(() => setLocLoading(null), 150);
                    }}>
                    <SelectTrigger className="h-12">
                      {locLoading === "estado" ? (
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
                        </span>
                      ) : (
                        <SelectValue placeholder="UF" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {BRAZIL_STATES.map((s) => (
                        <SelectItem key={s.uf} value={s.uf}>{s.uf} - {s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Cidade</label>
                  <Select
                    value={quickCidade}
                    onValueChange={handleCityChange}
                    disabled={!quickEstado || quickCities.length === 0}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {quickCities.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full mt-4 text-base py-6"
                onClick={handleQuickSearch}>
                <Search className="mr-2 h-5 w-5" />
                Publicar meu pedido
              </Button>
            </motion.div>
          )}

          {!user && (
            <motion.div
              className="mt-6 flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}>
              <Button
                variant="hero-outline"
                size="lg"
                className="text-base"
                onClick={() => window.location.href = '/auth'}>
                Entrar / Cadastrar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {brokerCount > 0 && (
            <motion.div
              className="mt-8 flex items-center gap-6 text-primary-foreground/70 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}>
              <span>+{brokerCount} corretores já cadastrados</span>
            </motion.div>
          )}
        </div>
      </div>
    </section>);
};

export default Hero;

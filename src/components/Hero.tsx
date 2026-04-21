import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import heroCoupleHouse from "@/assets/hero-couple-house.jpg";

const Hero = () => {
  const { user } = useAuth();
  const [brokerCount, setBrokerCount] = useState<number>(0);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("user_id", { count: "exact", head: true })
      .eq("user_type", "broker")
      .then(({ count }) => setBrokerCount(count ?? 0));
  }, []);
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-hero">
      {/* Decorative pattern inspired by azulejos */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="container relative z-10 mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            
            <span className="inline-block rounded-full bg-accent/20 px-4 py-1.5 text-sm font-medium text-accent-foreground mb-6 backdrop-blur-sm border border-accent-foreground/10">
              🇧🇷 Em todo o Brasil
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-primary-foreground leading-[1.1] mb-6 font-display"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}>
            
            Diga o que você quer.{" "}
            <span className="text-coral">Corretores encontram
            </span>{" "}
            para você.
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-primary-foreground/80 mb-10 max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}>
            
            Descreva o imóvel dos seus sonhos e receba propostas exclusivas dos melhores corretores do Brasil. Sem ligações, sem correria — você escolhe a melhor oferta.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}>
            
            <Button variant="hero" size="lg" className="text-base px-8 py-6" onClick={() => document.getElementById('publicar')?.scrollIntoView({ behavior: 'smooth' })}>
              <Search className="mr-2 h-5 w-5" />
              Publicar meu pedido
            </Button>
            {!user && (
              <Button variant="hero-outline" size="lg" className="text-base px-8 py-6" onClick={() => window.location.href = '/auth'}>
                Entrar / Cadastrar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </motion.div>

          {brokerCount > 0 && (
            <motion.div
              className="mt-12 flex items-center gap-6 text-primary-foreground/60 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}>
              <span>+{brokerCount} corretores já cadastrados</span>
            </motion.div>
          )}
        </div>

          <motion.div
            className="hidden lg:block relative"
            initial={{ opacity: 0, scale: 0.9, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}>
            <div className="absolute -inset-4 bg-gradient-to-tr from-coral/30 to-accent/20 rounded-3xl blur-2xl" />
            <img
              src={heroCoupleHouse}
              alt="Casal entrando em sua nova casa"
              width={1024}
              height={1024}
              className="relative rounded-2xl shadow-2xl w-full h-auto object-cover ring-1 ring-primary-foreground/10"
            />
          </motion.div>
        </div>
      </div>
    </section>);

};

export default Hero;
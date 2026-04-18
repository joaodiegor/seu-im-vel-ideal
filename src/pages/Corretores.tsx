import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DirectChat from "@/components/DirectChat";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BRAZIL_STATES } from "@/lib/locations";
import { Star, Award, MapPin, MessageCircle, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface BrokerWithStats {
  user_id: string;
  full_name: string;
  specialty: string | null;
  area: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  agency: string | null;
  state: string | null;
  avg_rating: number;
  review_count: number;
}

const Corretores = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialState = searchParams.get("state") || "all";
  const [stateFilter, setStateFilter] = useState<string>(initialState);
  const [brokers, setBrokers] = useState<BrokerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeBroker, setActiveBroker] = useState<BrokerWithStats | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);

  useEffect(() => {
    fetchBrokers();
  }, []);

  const fetchBrokers = async () => {
    setLoading(true);

    const { data: brokerProfiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, specialty, area, avatar_url, phone, bio, agency, state")
      .eq("user_type", "broker");

    if (!brokerProfiles || brokerProfiles.length === 0) {
      setBrokers([]);
      setLoading(false);
      return;
    }

    const { data: reviews } = await supabase
      .from("broker_reviews")
      .select("broker_id, rating");

    const statsMap: Record<string, { total: number; count: number }> = {};
    (reviews || []).forEach((r: any) => {
      if (!statsMap[r.broker_id]) statsMap[r.broker_id] = { total: 0, count: 0 };
      statsMap[r.broker_id].total += r.rating;
      statsMap[r.broker_id].count += 1;
    });

    const enriched: BrokerWithStats[] = brokerProfiles.map((b: any) => {
      const stats = statsMap[b.user_id];
      return {
        ...b,
        avg_rating: stats ? Math.round((stats.total / stats.count) * 10) / 10 : 0,
        review_count: stats?.count || 0,
      };
    });

    enriched.sort((a, b) => b.avg_rating - a.avg_rating || b.review_count - a.review_count);
    setBrokers(enriched);
    setLoading(false);
  };

  const handleOpenChat = async (broker: BrokerWithStats) => {
    if (!user) {
      toast.error("Faça login para conversar com o corretor.");
      return;
    }
    if (user.id === broker.user_id) {
      toast.error("Você não pode conversar consigo mesmo.");
      return;
    }

    setActiveBroker(broker);
    setLoadingChat(true);
    setChatOpen(true);

    // Check existing conversation (either direction)
    const p1 = user.id < broker.user_id ? user.id : broker.user_id;
    const p2 = user.id < broker.user_id ? broker.user_id : user.id;

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("participant_1", p1)
      .eq("participant_2", p2)
      .maybeSingle();

    if (existing) {
      setConversationId(existing.id);
    } else {
      const { data: created, error } = await supabase
        .from("conversations")
        .insert({ participant_1: p1, participant_2: p2 })
        .select("id")
        .single();

      if (error) {
        toast.error("Erro ao iniciar conversa.");
        setChatOpen(false);
      } else {
        setConversationId(created.id);
      }
    }
    setLoadingChat(false);
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const digits = phone.replace(/\D/g, "");
    const number = digits.startsWith("55") ? digits : `55${digits}`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(`Olá ${name}, encontrei seu perfil na plataforma e gostaria de conversar sobre a venda de um imóvel.`)}`, "_blank");
  };

  const filteredBrokers = useMemo(() => {
    if (stateFilter === "all") return brokers;
    return brokers.filter((b) => b.state === stateFilter);
  }, [brokers, stateFilter]);

  const handleStateChange = (v: string) => {
    setStateFilter(v);
    const next = new URLSearchParams(searchParams);
    if (v === "all") next.delete("state");
    else next.set("state", v);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-16 bg-gradient-hero">
        <div className="container mx-auto px-6 text-center">
          <motion.h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground font-display mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Corretores do Brasil
          </motion.h1>
          <motion.p
            className="text-lg text-primary-foreground/80 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Encontre os melhores profissionais avaliados por clientes reais. Converse diretamente e negocie a venda do seu imóvel.
          </motion.p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-16 h-16 rounded-xl" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mt-4" />
                    <Skeleton className="h-10 w-full mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : brokers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">Ainda não há corretores cadastrados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {brokers.map((broker, index) => (
                <motion.div
                  key={broker.user_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-elevated transition-all duration-300">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                          {broker.avatar_url ? (
                            <img src={broker.avatar_url} alt={broker.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl font-bold text-primary font-display">
                              {broker.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-foreground font-display truncate">{broker.full_name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(broker.avg_rating) ? "fill-amber-400 text-amber-400" : "text-border"}`}
                              />
                            ))}
                            <span className="text-sm text-muted-foreground ml-1">
                              {broker.avg_rating > 0 ? `${broker.avg_rating.toFixed(1)} (${broker.review_count})` : "Sem avaliações"}
                            </span>
                          </div>
                          {broker.agency && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">{broker.agency}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 flex-1">
                        {broker.specialty && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Award className="h-4 w-4 text-primary shrink-0" />
                            <span>{broker.specialty}</span>
                          </div>
                        )}
                        {broker.area && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 text-accent shrink-0" />
                            <span>{broker.area}</span>
                          </div>
                        )}
                        {broker.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{broker.bio}</p>
                        )}
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button
                          className="flex-1"
                          size="sm"
                          onClick={() => handleOpenChat(broker)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Conversar
                        </Button>
                        {broker.phone && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWhatsApp(broker.phone!, broker.full_name)}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="font-display">
              Chat com {activeBroker?.full_name}
            </DialogTitle>
          </DialogHeader>
          {loadingChat ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : conversationId ? (
            <DirectChat conversationId={conversationId} otherName={activeBroker?.full_name || ""} />
          ) : null}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Corretores;

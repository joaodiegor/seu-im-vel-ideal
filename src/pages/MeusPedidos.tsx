import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Home, MapPin, DollarSign, BedDouble, Clock, MessageSquare, User, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Proposal {
  id: string;
  message: string;
  price: number | null;
  property_link: string | null;
  created_at: string;
  broker_profile: {
    full_name: string;
    phone: string | null;
    creci: string | null;
  } | null;
}

interface MyRequest {
  id: string;
  property_type: string;
  neighborhood: string;
  bedrooms: number | null;
  max_budget: number | null;
  details: string | null;
  status: string;
  created_at: string;
  proposals: Proposal[];
}

const typeLabels: Record<string, string> = {
  casa: "Casa",
  apartamento: "Apartamento",
  terreno: "Terreno",
  comercial: "Comercial",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
};

const MeusPedidos = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [myRequests, setMyRequests] = useState<MyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchMyRequests();
  }, [user, authLoading]);

  const fetchMyRequests = async () => {
    setLoading(true);

    // Fetch user's requests
    const { data: requestsData } = await supabase
      .from("property_requests")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (!requestsData || requestsData.length === 0) {
      setMyRequests([]);
      setLoading(false);
      return;
    }

    // Fetch proposals for these requests
    const requestIds = requestsData.map((r: any) => r.id);
    const { data: proposalsData } = await supabase
      .from("proposals")
      .select("*")
      .in("request_id", requestIds)
      .order("created_at", { ascending: false });

    // Fetch broker profiles for proposals
    const brokerIds = [...new Set((proposalsData || []).map((p: any) => p.broker_id))];
    let brokerProfiles: Record<string, any> = {};
    if (brokerIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone, creci")
        .in("user_id", brokerIds);
      if (profiles) {
        brokerProfiles = Object.fromEntries(profiles.map((p: any) => [p.user_id, p]));
      }
    }

    const enrichedRequests: MyRequest[] = requestsData.map((req: any) => ({
      ...req,
      proposals: (proposalsData || [])
        .filter((p: any) => p.request_id === req.id)
        .map((p: any) => ({
          ...p,
          broker_profile: brokerProfiles[p.broker_id] || null,
        })),
    }));

    setMyRequests(enrichedRequests);
    setLoading(false);
  };

  if (authLoading) return null;

  const totalProposals = myRequests.reduce((sum, r) => sum + r.proposals.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="mb-10">
            <Badge variant="secondary" className="mb-3">Meus Pedidos</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-display">
              Seus pedidos de imóveis
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Acompanhe seus pedidos e veja as propostas recebidas dos corretores.
            </p>
            {!loading && myRequests.length > 0 && (
              <div className="flex gap-4 mt-4">
                <Badge variant="outline" className="text-sm py-1 px-3">
                  {myRequests.length} pedido{myRequests.length !== 1 ? "s" : ""}
                </Badge>
                <Badge variant="outline" className="text-sm py-1 px-3">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {totalProposals} proposta{totalProposals !== 1 ? "s" : ""}
                </Badge>
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl p-6 border border-border/50">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-16">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Você ainda não publicou nenhum pedido</h3>
              <p className="text-muted-foreground mt-1 mb-6">Publique seu primeiro pedido e corretores enviarão propostas.</p>
              <Button variant="hero" asChild>
                <a href="/#publicar">Publicar pedido</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {myRequests.map((req) => (
                <motion.div
                  key={req.id}
                  className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Request header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{typeLabels[req.property_type] || req.property_type}</Badge>
                        <Badge variant={req.status === "active" ? "default" : "outline"}>
                          {req.status === "active" ? "Ativo" : "Encerrado"}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(req.created_at)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-foreground">
                      <span className="flex items-center gap-1.5 capitalize">
                        <MapPin className="h-4 w-4 text-primary" /> {req.neighborhood}
                      </span>
                      {req.bedrooms && (
                        <span className="flex items-center gap-1.5">
                          <BedDouble className="h-4 w-4 text-primary" /> {req.bedrooms}+ quartos
                        </span>
                      )}
                      {req.max_budget && (
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4 text-primary" /> Até {formatCurrency(req.max_budget)}
                        </span>
                      )}
                    </div>

                    {req.details && (
                      <p className="text-sm text-muted-foreground mt-3">{req.details}</p>
                    )}

                    {/* Proposals toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 w-full justify-between"
                      onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                    >
                      <span className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {req.proposals.length} proposta{req.proposals.length !== 1 ? "s" : ""} recebida{req.proposals.length !== 1 ? "s" : ""}
                      </span>
                      {expandedId === req.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Proposals list */}
                  <AnimatePresence>
                    {expandedId === req.id && req.proposals.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border/50 bg-secondary/30 p-6 space-y-4">
                          {req.proposals.map((proposal) => (
                            <div
                              key={proposal.id}
                              className="bg-card rounded-lg p-4 border border-border/50 shadow-sm"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">
                                      {proposal.broker_profile?.full_name || "Corretor"}
                                    </p>
                                    {proposal.broker_profile?.creci && (
                                      <p className="text-xs text-muted-foreground">CRECI: {proposal.broker_profile.creci}</p>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground">{timeAgo(proposal.created_at)}</span>
                              </div>

                              <p className="text-sm text-foreground mt-2 whitespace-pre-wrap">{proposal.message}</p>

                              <div className="flex flex-wrap gap-3 mt-3">
                                {proposal.price && (
                                  <Badge variant="outline" className="text-sm">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    {formatCurrency(proposal.price)}
                                  </Badge>
                                )}
                                {proposal.property_link && (
                                  <a
                                    href={proposal.property_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary flex items-center gap-1 hover:underline"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Ver imóvel
                                  </a>
                                )}
                                {proposal.broker_profile?.phone && (
                                  <a
                                    href={`https://wa.me/55${proposal.broker_profile.phone.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-green-600 flex items-center gap-1 hover:underline"
                                  >
                                    WhatsApp
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {expandedId === req.id && req.proposals.length === 0 && (
                    <div className="border-t border-border/50 bg-secondary/30 p-6 text-center">
                      <p className="text-sm text-muted-foreground">Nenhuma proposta recebida ainda. Aguarde os corretores.</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MeusPedidos;

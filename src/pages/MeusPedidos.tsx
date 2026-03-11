import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Home, MapPin, DollarSign, BedDouble, Clock, MessageSquare, User,
  ExternalLink, ChevronDown, ChevronUp, CheckCircle, XCircle, Archive, Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Proposal {
  id: string;
  message: string;
  price: number | null;
  property_link: string | null;
  status: string;
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

const statusLabels: Record<string, string> = {
  active: "Ativo",
  closed: "Encerrado",
};

const proposalStatusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "outline" },
  accepted: { label: "Aceita", variant: "default" },
  rejected: { label: "Recusada", variant: "destructive" },
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

    const requestIds = requestsData.map((r: any) => r.id);
    const { data: proposalsData } = await supabase
      .from("proposals")
      .select("*")
      .in("request_id", requestIds)
      .order("created_at", { ascending: false });

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

  const handleProposalAction = async (proposalId: string, newStatus: "accepted" | "rejected") => {
    setActionLoading(proposalId);
    const { error } = await supabase
      .from("proposals")
      .update({ status: newStatus })
      .eq("id", proposalId);

    setActionLoading(null);

    if (error) {
      toast.error("Erro ao atualizar proposta.");
      return;
    }

    toast.success(newStatus === "accepted" ? "Proposta aceita!" : "Proposta recusada.");
    setMyRequests((prev) =>
      prev.map((req) => ({
        ...req,
        proposals: req.proposals.map((p) =>
          p.id === proposalId ? { ...p, status: newStatus } : p
        ),
      }))
    );
  };

  const handleCloseRequest = async (requestId: string) => {
    setActionLoading(requestId);
    const { error } = await supabase
      .from("property_requests")
      .update({ status: "closed" })
      .eq("id", requestId);

    setActionLoading(null);

    if (error) {
      toast.error("Erro ao encerrar pedido.");
      return;
    }

    toast.success("Pedido encerrado com sucesso!");
    setMyRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "closed" } : req
      )
    );
  };

  const handleReopenRequest = async (requestId: string) => {
    setActionLoading(requestId);
    const { error } = await supabase
      .from("property_requests")
      .update({ status: "active" })
      .eq("id", requestId);

    setActionLoading(null);

    if (error) {
      toast.error("Erro ao reabrir pedido.");
      return;
    }

    toast.success("Pedido reaberto!");
    setMyRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "active" } : req
      )
    );
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
              Acompanhe seus pedidos, aceite ou recuse propostas e encerre quando encontrar o ideal.
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
              {myRequests.map((req) => {
                const isActive = req.status === "active";
                const acceptedCount = req.proposals.filter((p) => p.status === "accepted").length;

                return (
                  <motion.div
                    key={req.id}
                    className={`bg-card rounded-xl border shadow-card overflow-hidden ${
                      isActive ? "border-border/50" : "border-border/30 opacity-80"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {/* Request header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="secondary">{typeLabels[req.property_type] || req.property_type}</Badge>
                          <Badge variant={isActive ? "default" : "outline"}>
                            {statusLabels[req.status] || req.status}
                          </Badge>
                          {acceptedCount > 0 && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {acceptedCount} aceita{acceptedCount !== 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeAgo(req.created_at)}
                          </span>
                        </div>
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

                      {/* Actions row */}
                      <div className="flex items-center gap-3 mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 justify-between"
                          onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                        >
                          <span className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            {req.proposals.length} proposta{req.proposals.length !== 1 ? "s" : ""}
                          </span>
                          {expandedId === req.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>

                        {isActive ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="shrink-0">
                                <Archive className="h-4 w-4 mr-1.5" />
                                Encerrar pedido
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Encerrar este pedido?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  O pedido não ficará mais visível para corretores e nenhuma nova proposta será recebida. Você poderá reabrir depois se precisar.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCloseRequest(req.id)}
                                  disabled={actionLoading === req.id}
                                >
                                  {actionLoading === req.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                  ) : null}
                                  Encerrar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            onClick={() => handleReopenRequest(req.id)}
                            disabled={actionLoading === req.id}
                          >
                            {actionLoading === req.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                            ) : null}
                            Reabrir pedido
                          </Button>
                        )}
                      </div>
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
                            {req.proposals.map((proposal) => {
                              const pStatus = proposalStatusLabels[proposal.status] || proposalStatusLabels.pending;
                              const isPending = proposal.status === "pending";
                              const isAccepted = proposal.status === "accepted";

                              return (
                                <div
                                  key={proposal.id}
                                  className={`bg-card rounded-lg p-4 border shadow-sm ${
                                    isAccepted
                                      ? "border-emerald-200 ring-1 ring-emerald-100"
                                      : "border-border/50"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        isAccepted ? "bg-emerald-100" : "bg-primary/10"
                                      }`}>
                                        {isAccepted ? (
                                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                                        ) : (
                                          <User className="h-4 w-4 text-primary" />
                                        )}
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
                                    <div className="flex items-center gap-2">
                                      <Badge variant={pStatus.variant}>{pStatus.label}</Badge>
                                      <span className="text-xs text-muted-foreground">{timeAgo(proposal.created_at)}</span>
                                    </div>
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
                                        className="text-sm flex items-center gap-1 hover:underline text-emerald-600"
                                      >
                                        WhatsApp
                                      </a>
                                    )}
                                  </div>

                                  {/* Accept / Reject buttons */}
                                  {isPending && isActive && (
                                    <div className="flex gap-2 mt-4 pt-3 border-t border-border/50">
                                      <Button
                                        size="sm"
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                        onClick={() => handleProposalAction(proposal.id, "accepted")}
                                        disabled={actionLoading === proposal.id}
                                      >
                                        {actionLoading === proposal.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                        ) : (
                                          <CheckCircle className="h-4 w-4 mr-1" />
                                        )}
                                        Aceitar
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => handleProposalAction(proposal.id, "rejected")}
                                        disabled={actionLoading === proposal.id}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Recusar
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
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
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MeusPedidos;

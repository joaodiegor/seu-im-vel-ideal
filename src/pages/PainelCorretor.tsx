import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Home, MapPin, DollarSign, BedDouble, Clock, Search, Filter, Send, CheckCircle, MessageSquare, Pencil, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ProposalChat from "@/components/ProposalChat";
import ProposalFormModal from "@/components/ProposalFormModal";
import DirectChat from "@/components/DirectChat";

interface PropertyRequest {
  id: string;
  property_type: string;
  neighborhood: string;
  bedrooms: number | null;
  max_budget: number | null;
  details: string | null;
  requester_name: string;
  name_visible: boolean;
  created_at: string;
}

interface BrokerProposal {
  id: string;
  request_id: string;
  message: string;
  price: number | null;
  property_link: string | null;
  broker_phone: string | null;
  status: string;
  created_at: string;
  request: {
    property_type: string;
    neighborhood: string;
    requester_name: string;
  };
}

const typeLabels: Record<string, string> = {
  casa: "Casa",
  apartamento: "Apartamento",
  casa_condominio: "Casa de Condomínio",
  terreno: "Terreno / Lote",
  comercial: "Comercial",
};

const typeIcons: Record<string, string> = {
  casa: "🏠",
  apartamento: "🏢",
  casa_condominio: "🏘️",
  terreno: "🌳",
  comercial: "🏪",
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

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-amber-100 text-amber-700 border-amber-200" },
  accepted: { label: "Aceita", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  rejected: { label: "Recusada", className: "bg-red-100 text-red-700 border-red-200" },
};

const PainelCorretor = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [sentProposalIds, setSentProposalIds] = useState<Set<string>>(new Set());
  const [proposalCounts, setProposalCounts] = useState<Record<string, number>>({});
  const [brokerProposals, setBrokerProposals] = useState<BrokerProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Proposal form modal
  const [formOpen, setFormOpen] = useState(false);
  const [formRequest, setFormRequest] = useState<PropertyRequest | null>(null);
  const [editingProposal, setEditingProposal] = useState<BrokerProposal | null>(null);

  // Chat modal
  const [chatProposal, setChatProposal] = useState<BrokerProposal | null>(null);

  // Direct conversations
  const [directConversations, setDirectConversations] = useState<{ id: string; otherName: string; otherUserId: string }[]>([]);
  const [activeDirectChat, setActiveDirectChat] = useState<{ id: string; otherName: string } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    if (profile && profile.user_type !== "broker") {
      toast.error("Apenas corretores podem acessar este painel.");
      navigate("/");
      return;
    }
    fetchData();
  }, [user, profile, authLoading]);

  const fetchData = async () => {
    setLoading(true);

    const [requestsRes, proposalsRes] = await Promise.all([
      supabase
        .from("property_requests")
        .select("id, property_type, neighborhood, bedrooms, max_budget, details, requester_name, name_visible, created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false }),
      supabase
        .from("proposals")
        .select("id, request_id, message, price, property_link, broker_phone, status, created_at, property_requests(property_type, neighborhood, requester_name)")
        .eq("broker_id", user!.id)
        .order("created_at", { ascending: false }),
    ]);

    if (requestsRes.data) {
      setRequests(requestsRes.data);
      // Fetch active proposal counts for each request
      const counts: Record<string, number> = {};
      const countPromises = requestsRes.data.map(async (req) => {
        const { count } = await supabase
          .from("proposals")
          .select("id", { count: "exact", head: true })
          .eq("request_id", req.id)
          .in("status", ["pending", "accepted"]);
        counts[req.id] = count || 0;
      });
      await Promise.all(countPromises);
      setProposalCounts(counts);
    }
    if (proposalsRes.data) {
      const mapped = proposalsRes.data.map((p: any) => ({ ...p, request: p.property_requests }));
      setBrokerProposals(mapped);
      setSentProposalIds(new Set(mapped.map((p: any) => p.request_id)));
    }
    // Fetch direct conversations
    if (user) {
      const { data: convos } = await supabase
        .from("conversations")
        .select("id, participant_1, participant_2")
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`);

      if (convos && convos.length > 0) {
        const otherUserIds = convos.map((c: any) =>
          c.participant_1 === user.id ? c.participant_2 : c.participant_1
        );
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", otherUserIds);

        const profileMap: Record<string, string> = {};
        (profiles || []).forEach((p: any) => { profileMap[p.user_id] = p.full_name; });

        setDirectConversations(
          convos.map((c: any) => {
            const otherId = c.participant_1 === user.id ? c.participant_2 : c.participant_1;
            return { id: c.id, otherName: profileMap[otherId] || "Usuário", otherUserId: otherId };
          })
        );
      } else {
        setDirectConversations([]);
      }
    }

    setLoading(false);
  };

  const openNewProposal = (req: PropertyRequest) => {
    setFormRequest(req);
    setEditingProposal(null);
    setFormOpen(true);
  };

  const openEditProposal = (proposal: BrokerProposal) => {
    // We need the request info to show in the modal
    setFormRequest({
      id: proposal.request_id,
      property_type: proposal.request.property_type,
      neighborhood: proposal.request.neighborhood,
      requester_name: proposal.request.requester_name,
      name_visible: true,
      bedrooms: null,
      max_budget: null,
      details: null,
      created_at: proposal.created_at,
    });
    setEditingProposal(proposal);
    setFormOpen(true);
  };

  const filtered = requests.filter((r) => {
    const matchesSearch =
      !search ||
      r.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
      r.requester_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.details && r.details.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === "all" || r.property_type === filterType;
    return matchesSearch && matchesType;
  });

  const pendingProposals = brokerProposals.filter((p) => p.status === "pending");
  const acceptedProposals = brokerProposals.filter((p) => p.status === "accepted");

  if (authLoading || (profile && profile.user_type !== "broker")) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="mb-10">
            <Badge variant="secondary" className="mb-3">Painel do Corretor</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-display">
              Pedidos disponíveis
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Encontre compradores e envie propostas privadas diretamente.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por bairro, nome ou detalhe..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="apartamento">Apartamento</SelectItem>
                  <SelectItem value="casa_condominio">Casa de Condomínio</SelectItem>
                  <SelectItem value="terreno">Terreno / Lote</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Available Requests */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-xl p-6 border border-border/50">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground mt-1">Tente ajustar os filtros ou volte mais tarde.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((req, i) => {
                const alreadySent = sentProposalIds.has(req.id);
                const count = proposalCounts[req.id] || 0;
                const isFull = count >= 20;
                return (
                  <motion.div
                    key={req.id}
                    className="bg-card rounded-xl p-6 border border-border/50 shadow-card hover:shadow-elevated transition-shadow flex flex-col"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="text-sm">
                        {typeIcons[req.property_type] || "🏠"} {typeLabels[req.property_type] || req.property_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(req.created_at)}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4 flex-1">
                      <div className="flex items-center gap-2 text-foreground">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-medium capitalize">{req.neighborhood}</span>
                      </div>
                      {req.bedrooms && (
                        <div className="flex items-center gap-2 text-foreground">
                          <BedDouble className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm">{req.bedrooms}+ quartos</span>
                        </div>
                      )}
                      {req.max_budget && (
                        <div className="flex items-center gap-2 text-foreground">
                          <DollarSign className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm">Até {formatCurrency(req.max_budget)}</span>
                        </div>
                      )}
                      {req.details && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{req.details}</p>
                      )}
                    </div>
                    <div className="pt-3 border-t border-border/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Publicado por <span className="font-medium text-foreground">{req.name_visible ? req.requester_name : "Nome oculto"}</span>
                        </span>
                        <span className={`text-xs font-medium ${isFull ? "text-destructive" : "text-muted-foreground"}`}>
                          {count}/20 propostas
                        </span>
                      </div>
                      {alreadySent ? (
                        <Button variant="outline" size="sm" className="w-full" disabled>
                          <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                          Proposta enviada
                        </Button>
                      ) : isFull ? (
                        <Button variant="outline" size="sm" className="w-full" disabled>
                          Limite de propostas atingido
                        </Button>
                      ) : (
                        <Button variant="hero" size="sm" className="w-full" onClick={() => openNewProposal(req)}>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar proposta
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* My Pending Proposals - Editable */}
          {!loading && pendingProposals.length > 0 && (
            <div className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                  <Send className="h-6 w-6 text-primary" />
                  Minhas propostas enviadas
                </h2>
                <p className="text-muted-foreground mt-1">Propostas aguardando resposta do comprador. Você pode editá-las.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingProposals.map((proposal, i) => (
                  <motion.div
                    key={proposal.id}
                    className="bg-card rounded-xl p-6 border border-border/50 shadow-card flex flex-col"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={statusLabels[proposal.status]?.className || ""}>
                        {statusLabels[proposal.status]?.label || proposal.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(proposal.created_at)}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4 flex-1">
                      <div className="flex items-center gap-2 text-foreground">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-medium capitalize">{proposal.request?.neighborhood}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Home className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm">{typeLabels[proposal.request?.property_type] || proposal.request?.property_type}</span>
                      </div>
                      {proposal.price && (
                        <div className="flex items-center gap-2 text-foreground">
                          <span className="text-sm">{formatCurrency(proposal.price)}</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-2">{proposal.message}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => openEditProposal(proposal)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar proposta
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Accepted Proposals - Chat */}
          {!loading && acceptedProposals.length > 0 && (
            <div className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                  Propostas aceitas
                </h2>
                <p className="text-muted-foreground mt-1">Continue a conversa com os compradores.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {acceptedProposals.map((proposal, i) => (
                  <motion.div
                    key={proposal.id}
                    className="bg-card rounded-xl p-6 border border-emerald-200 shadow-card flex flex-col"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Aceita</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(proposal.created_at)}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4 flex-1">
                      <div className="flex items-center gap-2 text-foreground">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-medium capitalize">{proposal.request?.neighborhood}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Home className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm">{typeLabels[proposal.request?.property_type] || proposal.request?.property_type}</span>
                      </div>
                      {proposal.price && (
                        <div className="flex items-center gap-2 text-foreground">
                          <span className="text-sm">{formatCurrency(proposal.price)}</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Comprador: <span className="font-medium text-foreground">{proposal.request?.requester_name}</span>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Button variant="default" size="sm" className="w-full" onClick={() => setChatProposal(proposal)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Conversar
                      </Button>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => openEditProposal(proposal)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar proposta
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Proposal Form Modal (create / edit) */}
      {formRequest && (
        <ProposalFormModal
          open={formOpen}
          onClose={() => { setFormOpen(false); setFormRequest(null); setEditingProposal(null); }}
          requestId={formRequest.id}
          requesterName={formRequest.requester_name}
          propertyType={formRequest.property_type}
          neighborhood={formRequest.neighborhood}
          editProposal={editingProposal}
          onSuccess={fetchData}
        />
      )}

      {/* Chat Modal */}
      <Dialog open={!!chatProposal} onOpenChange={(open) => !open && setChatProposal(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Chat com {chatProposal?.request?.requester_name || "Comprador"}
            </DialogTitle>
            <DialogDescription>
              {chatProposal && (
                <>
                  {typeLabels[chatProposal.request?.property_type] || chatProposal.request?.property_type} em{" "}
                  <span className="capitalize">{chatProposal.request?.neighborhood}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {chatProposal && (
            <ProposalChat proposalId={chatProposal.id} brokerName={chatProposal.request?.requester_name || "Comprador"} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PainelCorretor;

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Home, MapPin, DollarSign, BedDouble, Clock, Search, Filter, Send, Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PropertyRequest {
  id: string;
  property_type: string;
  neighborhood: string;
  bedrooms: number | null;
  max_budget: number | null;
  details: string | null;
  requester_name: string;
  created_at: string;
}

const typeLabels: Record<string, string> = {
  casa: "Casa",
  apartamento: "Apartamento",
  terreno: "Terreno",
  comercial: "Comercial",
};

const typeIcons: Record<string, string> = {
  casa: "🏠",
  apartamento: "🏢",
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

const PainelCorretor = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [sentProposals, setSentProposals] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Proposal modal state
  const [selectedRequest, setSelectedRequest] = useState<PropertyRequest | null>(null);
  const [proposalMessage, setProposalMessage] = useState("");
  const [proposalPrice, setProposalPrice] = useState("");
  const [proposalLink, setProposalLink] = useState("");
  const [proposalPhone, setProposalPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
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
        .select("id, property_type, neighborhood, bedrooms, max_budget, details, requester_name, created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false }),
      supabase
        .from("proposals")
        .select("request_id")
        .eq("broker_id", user!.id),
    ]);

    if (requestsRes.data) setRequests(requestsRes.data);
    if (proposalsRes.data) {
      setSentProposals(new Set(proposalsRes.data.map((p: any) => p.request_id)));
    }
    setLoading(false);
  };

  const handleSendProposal = async () => {
    if (!selectedRequest || !proposalMessage.trim()) {
      toast.error("Escreva uma mensagem para o comprador.");
      return;
    }

    setSubmitting(true);

    const priceNum = proposalPrice
      ? parseFloat(proposalPrice.replace(/\./g, "").replace(",", "."))
      : null;

    const { error } = await supabase.from("proposals").insert({
      request_id: selectedRequest.id,
      broker_id: user!.id,
      message: proposalMessage.trim(),
      price: priceNum,
      property_link: proposalLink.trim() || null,
      broker_phone: proposalPhone.trim() || null,
    } as any);

    setSubmitting(false);

    if (error) {
      toast.error("Erro ao enviar proposta. Tente novamente.");
      console.error(error);
      return;
    }

    toast.success("Proposta enviada com sucesso!");
    setSentProposals((prev) => new Set(prev).add(selectedRequest.id));
    setSelectedRequest(null);
    setProposalMessage("");
    setProposalPrice("");
    setProposalLink("");
    setProposalPhone("");
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
              <Input
                placeholder="Buscar por bairro, nome ou detalhe..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
                  <SelectItem value="terreno">Terreno</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
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
                const alreadySent = sentProposals.has(req.id);
                return (
                  <motion.div
                    key={req.id}
                    className="bg-card rounded-xl p-6 border border-border/50 shadow-card hover:shadow-elevated transition-shadow flex flex-col"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
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
                      <span className="text-xs text-muted-foreground">
                        Publicado por <span className="font-medium text-foreground">{req.requester_name}</span>
                      </span>
                      {alreadySent ? (
                        <Button variant="outline" size="sm" className="w-full" disabled>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Proposta enviada
                        </Button>
                      ) : (
                        <Button
                          variant="hero"
                          size="sm"
                          className="w-full"
                          onClick={() => setSelectedRequest(req)}
                        >
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
        </div>
      </main>
      <Footer />

      {/* Proposal Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Enviar proposta</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  Para: <strong>{selectedRequest.requester_name}</strong> — {typeLabels[selectedRequest.property_type]} em{" "}
                  <span className="capitalize">{selectedRequest.neighborhood}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Sua mensagem *</label>
              <Textarea
                placeholder="Apresente-se e descreva o imóvel que você tem para oferecer..."
                rows={4}
                value={proposalMessage}
                onChange={(e) => setProposalMessage(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Valor sugerido (R$)</label>
              <Input
                placeholder="Ex: 450.000"
                value={proposalPrice}
                onChange={(e) => setProposalPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Link do imóvel <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="https://..."
                  className="pl-10"
                  value={proposalLink}
                  onChange={(e) => setProposalLink(e.target.value)}
                />
              </div>
            </div>

            <Button
              variant="hero"
              className="w-full"
              onClick={handleSendProposal}
              disabled={submitting || !proposalMessage.trim()}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {submitting ? "Enviando..." : "Enviar proposta"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PainelCorretor;

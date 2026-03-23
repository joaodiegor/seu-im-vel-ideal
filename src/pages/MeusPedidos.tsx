import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Home, MapPin, DollarSign, BedDouble, Clock, MessageSquare, User,
  ExternalLink, ChevronDown, ChevronUp, CheckCircle, XCircle, Archive, Loader2, Star,
  ChevronLeft, ChevronRight, Eye, EyeOff
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import ProposalChat from "@/components/ProposalChat";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProposalImage {
  id: string;
  image_url: string;
}

interface Proposal {
  id: string;
  broker_id: string;
  message: string;
  price: number | null;
  property_link: string | null;
  status: string;
  created_at: string;
  reviewed: boolean;
  images: ProposalImage[];
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
  name_visible: boolean;
  phone_visible: boolean;
  proposals: Proposal[];
}

const typeLabels: Record<string, string> = {
  casa: "Casa", apartamento: "Apartamento", terreno: "Terreno", comercial: "Comercial",
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

const StarRating = ({ rating, onRate, size = "md" }: { rating: number; onRate?: (r: number) => void; size?: "sm" | "md" }) => {
  const [hover, setHover] = useState(0);
  const s = size === "sm" ? "h-4 w-4" : "h-6 w-6";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate?.(star)}
          onMouseEnter={() => onRate && setHover(star)}
          onMouseLeave={() => onRate && setHover(0)}
          className={onRate ? "cursor-pointer" : "cursor-default"}
          disabled={!onRate}
        >
          <Star
            className={`${s} ${
              star <= (hover || rating)
                ? "fill-amber-400 text-amber-400"
                : "text-border"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
};

const ImageCarousel = ({ images }: { images: ProposalImage[] }) => {
  const [current, setCurrent] = useState(0);
  const total = images.length;

  const prev = () => setCurrent((c) => (c === 0 ? total - 1 : c - 1));
  const next = () => setCurrent((c) => (c === total - 1 ? 0 : c + 1));

  return (
    <div className="mt-3 relative rounded-lg overflow-hidden border border-border/50 bg-secondary/20">
      <div className="relative aspect-video">
        <img
          src={images[current].image_url}
          alt={`Foto ${current + 1} de ${total}`}
          className="w-full h-full object-contain"
          loading="lazy"
        />
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm hover:bg-background transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm hover:bg-background transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-xs font-medium text-foreground">
              {current + 1} / {total}
            </div>
          </>
        )}
      </div>
      {total > 1 && (
        <div className="flex gap-1.5 p-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setCurrent(i)}
              className={`shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-colors ${
                i === current ? "border-primary" : "border-transparent hover:border-border"
              }`}
            >
              <img src={img.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MeusPedidos = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [myRequests, setMyRequests] = useState<MyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Review modal
  const [reviewTarget, setReviewTarget] = useState<Proposal | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Chat modal
  const [chatProposal, setChatProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
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

    const [proposalsRes, reviewsRes] = await Promise.all([
      supabase.from("proposals").select("*").in("request_id", requestIds).order("created_at", { ascending: false }),
      supabase.from("broker_reviews").select("proposal_id").eq("reviewer_id", user!.id),
    ]);

    const proposalsData = proposalsRes.data || [];
    const reviewedProposalIds = new Set((reviewsRes.data || []).map((r: any) => r.proposal_id));

    // Fetch proposal images
    const proposalIds = proposalsData.map((p: any) => p.id);
    let proposalImagesMap: Record<string, ProposalImage[]> = {};
    if (proposalIds.length > 0) {
      const { data: imagesData } = await supabase
        .from("proposal_images")
        .select("id, proposal_id, image_url")
        .in("proposal_id", proposalIds);
      if (imagesData) {
        for (const img of imagesData) {
          if (!proposalImagesMap[img.proposal_id]) proposalImagesMap[img.proposal_id] = [];
          proposalImagesMap[img.proposal_id].push({ id: img.id, image_url: img.image_url });
        }
      }
    }

    const brokerIds = [...new Set(proposalsData.map((p: any) => p.broker_id))];
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
      proposals: proposalsData
        .filter((p: any) => p.request_id === req.id)
        .map((p: any) => ({
          ...p,
          reviewed: reviewedProposalIds.has(p.id),
          images: proposalImagesMap[p.id] || [],
          broker_profile: brokerProfiles[p.broker_id] || null,
        })),
    }));

    setMyRequests(enrichedRequests);
    setLoading(false);
  };

  const handleProposalAction = async (proposalId: string, newStatus: "accepted" | "rejected") => {
    setActionLoading(proposalId);
    const { error } = await supabase.from("proposals").update({ status: newStatus }).eq("id", proposalId);
    setActionLoading(null);
    if (error) { toast.error("Erro ao atualizar proposta."); return; }
    toast.success(newStatus === "accepted" ? "Proposta aceita!" : "Proposta recusada.");
    const updatedProposal = { ...myRequests.flatMap(r => r.proposals).find(p => p.id === proposalId)!, status: newStatus };
    setMyRequests((prev) => prev.map((req) => ({
      ...req,
      proposals: req.proposals.map((p) => p.id === proposalId ? { ...p, status: newStatus } : p),
    })));
    // Open chat when accepting
    if (newStatus === "accepted") {
      setChatProposal(updatedProposal);
    }
  };

  const handleCloseRequest = async (requestId: string) => {
    setActionLoading(requestId);
    const { error } = await supabase.from("property_requests").delete().eq("id", requestId);
    setActionLoading(null);
    if (error) { toast.error("Erro ao excluir pedido."); return; }
    toast.success("Pedido excluído com sucesso!");
    setMyRequests((prev) => prev.filter((req) => req.id !== requestId));
    if (expandedId === requestId) setExpandedId(null);
  };

  const handleReopenRequest = async (requestId: string) => {
    setActionLoading(requestId);
    const { error } = await supabase.from("property_requests").update({ status: "active" }).eq("id", requestId);
    setActionLoading(null);
    if (error) { toast.error("Erro ao reabrir pedido."); return; }
    toast.success("Pedido reaberto!");
    setMyRequests((prev) => prev.map((req) => req.id === requestId ? { ...req, status: "active" } : req));
  };

  const handleToggleVisibility = async (requestId: string, field: "name_visible" | "phone_visible", currentValue: boolean) => {
    const { error } = await supabase
      .from("property_requests")
      .update({ [field]: !currentValue })
      .eq("id", requestId);
    if (error) { toast.error("Erro ao atualizar visibilidade."); return; }
    setMyRequests((prev) => prev.map((req) => req.id === requestId ? { ...req, [field]: !currentValue } : req));
    toast.success(!currentValue ? "Dado agora visível para corretores." : "Dado oculto para corretores.");
  };

  const handleSubmitReview = async () => {
    if (!reviewTarget || reviewRating === 0) {
      toast.error("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }
    setReviewSubmitting(true);
    const { error } = await supabase.from("broker_reviews").insert({
      proposal_id: reviewTarget.id,
      broker_id: reviewTarget.broker_id,
      reviewer_id: user!.id,
      rating: reviewRating,
      comment: reviewComment.trim() || null,
    });
    setReviewSubmitting(false);
    if (error) { toast.error("Erro ao enviar avaliação."); return; }
    toast.success("Avaliação enviada! Obrigado.");
    // Mark as reviewed locally
    setMyRequests((prev) => prev.map((req) => ({
      ...req,
      proposals: req.proposals.map((p) => p.id === reviewTarget.id ? { ...p, reviewed: true } : p),
    })));
    setReviewTarget(null);
    setReviewRating(0);
    setReviewComment("");
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
              Acompanhe seus pedidos, aceite ou recuse propostas e avalie corretores.
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
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="secondary">{typeLabels[req.property_type] || req.property_type}</Badge>
                          <Badge variant={isActive ? "default" : "outline"}>
                            {isActive ? "Ativo" : "Encerrado"}
                          </Badge>
                          {acceptedCount > 0 && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {acceptedCount} aceita{acceptedCount !== 1 ? "s" : ""}
                            </Badge>
                          )}
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

                      {req.details && <p className="text-sm text-muted-foreground mt-3">{req.details}</p>}

                      {/* Visibility toggles */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() => handleToggleVisibility(req.id, "name_visible", req.name_visible)}
                        >
                          {req.name_visible ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                          Nome {req.name_visible ? "visível" : "oculto"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() => handleToggleVisibility(req.id, "phone_visible", req.phone_visible)}
                        >
                          {req.phone_visible ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                          WhatsApp {req.phone_visible ? "visível" : "oculto"}
                        </Button>
                      </div>

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
                              <Button variant="outline" size="sm" className="shrink-0 text-destructive hover:text-destructive">
                                <Archive className="h-4 w-4 mr-1.5" />
                                Excluir
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir este pedido?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação é permanente. O pedido e todas as propostas associadas serão removidos.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCloseRequest(req.id)}
                                  disabled={actionLoading === req.id}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {actionLoading === req.id && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button variant="outline" size="sm" className="shrink-0" onClick={() => handleReopenRequest(req.id)} disabled={actionLoading === req.id}>
                            {actionLoading === req.id && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                            Reabrir
                          </Button>
                        )}
                      </div>
                    </div>

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
                              const canReview = isAccepted && !proposal.reviewed;

                              return (
                                <div
                                  key={proposal.id}
                                  className={`bg-card rounded-lg p-4 border shadow-sm ${
                                    isAccepted ? "border-emerald-200 ring-1 ring-emerald-100" : "border-border/50"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        isAccepted ? "bg-emerald-100" : "bg-primary/10"
                                      }`}>
                                        {isAccepted ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <User className="h-4 w-4 text-primary" />}
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

                                  {/* Proposal Images Carousel */}
                                  {proposal.images.length > 0 && (
                                    <ImageCarousel images={proposal.images} />
                                  )}

                                  <div className="flex flex-wrap gap-3 mt-3">
                                    {proposal.price && (
                                      <Badge variant="outline" className="text-sm">
                                        <DollarSign className="h-3 w-3 mr-1" />{formatCurrency(proposal.price)}
                                      </Badge>
                                    )}
                                    {proposal.property_link && (
                                      <a href={proposal.property_link} target="_blank" rel="noopener noreferrer"
                                        className="text-sm text-primary flex items-center gap-1 hover:underline">
                                        <ExternalLink className="h-3 w-3" />Ver imóvel
                                      </a>
                                    )}
                                    {proposal.broker_profile?.phone && (
                                      <a href={`https://wa.me/55${proposal.broker_profile.phone.replace(/\D/g, "")}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="text-sm flex items-center gap-1 hover:underline text-emerald-600">
                                        WhatsApp
                                      </a>
                                    )}
                                  </div>

                                  {/* Accept / Reject */}
                                  {isPending && isActive && (
                                    <div className="flex gap-2 mt-4 pt-3 border-t border-border/50">
                                      <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                        onClick={() => handleProposalAction(proposal.id, "accepted")}
                                        disabled={actionLoading === proposal.id}>
                                        {actionLoading === proposal.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                        Aceitar
                                      </Button>
                                      <Button size="sm" variant="outline" className="flex-1"
                                        onClick={() => handleProposalAction(proposal.id, "rejected")}
                                        disabled={actionLoading === proposal.id}>
                                        <XCircle className="h-4 w-4 mr-1" />Recusar
                                      </Button>
                                    </div>
                                  )}

                                  {/* Chat button for accepted proposals */}
                                  {isAccepted && (
                                    <div className="mt-4 pt-3 border-t border-border/50">
                                      <Button
                                        size="sm"
                                        variant="default"
                                        className="w-full"
                                        onClick={() => setChatProposal(proposal)}
                                      >
                                        <MessageSquare className="h-4 w-4 mr-1.5" />
                                        Conversar com {proposal.broker_profile?.full_name || "o corretor"}
                                      </Button>
                                    </div>
                                  )}

                                  {/* Review button */}
                                  {canReview && (
                                    <div className="mt-4 pt-3 border-t border-border/50">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                                        onClick={() => { setReviewTarget(proposal); setReviewRating(0); setReviewComment(""); }}
                                      >
                                        <Star className="h-4 w-4 mr-1.5 fill-amber-400 text-amber-400" />
                                        Avaliar este corretor
                                      </Button>
                                    </div>
                                  )}

                                  {isAccepted && proposal.reviewed && (
                                    <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-sm text-muted-foreground">
                                      <CheckCircle className="h-4 w-4 text-amber-500" />
                                      Avaliação enviada
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

      {/* Review Modal */}
      <Dialog open={!!reviewTarget} onOpenChange={(open) => !open && setReviewTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Avaliar corretor</DialogTitle>
            <DialogDescription>
              Como foi sua experiência com{" "}
              <strong>{reviewTarget?.broker_profile?.full_name || "o corretor"}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div className="flex flex-col items-center gap-2">
              <StarRating rating={reviewRating} onRate={setReviewRating} />
              <span className="text-sm text-muted-foreground">
                {reviewRating === 0 && "Selecione uma nota"}
                {reviewRating === 1 && "Ruim"}
                {reviewRating === 2 && "Regular"}
                {reviewRating === 3 && "Bom"}
                {reviewRating === 4 && "Muito bom"}
                {reviewRating === 5 && "Excelente"}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Comentário <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <Textarea
                placeholder="Conte como foi sua experiência..."
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>
            <Button
              variant="hero"
              className="w-full"
              onClick={handleSubmitReview}
              disabled={reviewSubmitting || reviewRating === 0}
            >
              {reviewSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Star className="h-4 w-4 mr-2" />}
              {reviewSubmitting ? "Enviando..." : "Enviar avaliação"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      <Dialog open={!!chatProposal} onOpenChange={(open) => !open && setChatProposal(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Chat com {chatProposal?.broker_profile?.full_name || "Corretor"}
            </DialogTitle>
            <DialogDescription>
              Converse diretamente sobre o imóvel proposto.
            </DialogDescription>
          </DialogHeader>
          {chatProposal && (
            <ProposalChat
              proposalId={chatProposal.id}
              brokerName={chatProposal.broker_profile?.full_name || "Corretor"}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeusPedidos;

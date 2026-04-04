import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, FileText, MessageSquare, BarChart3, Trash2, Eye, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  user_type: "buyer" | "broker";
  creci: string | null;
  city: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface PropertyRequest {
  id: string;
  requester_name: string;
  property_type: string;
  neighborhood: string;
  status: string;
  created_at: string;
  user_id: string;
  max_budget: number | null;
  bedrooms: number | null;
}

interface Proposal {
  id: string;
  broker_id: string;
  request_id: string;
  message: string;
  price: number | null;
  status: string;
  created_at: string;
}

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBuyers: 0,
    totalBrokers: 0,
    totalRequests: 0,
    activeRequests: 0,
    totalProposals: 0,
    pendingProposals: 0,
    acceptedProposals: 0,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    checkAdminRole();
  }, [user, authLoading]);

  const checkAdminRole = async () => {
    if (!user) return;
    const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!data) {
      toast.error("Acesso negado. Você não é administrador.");
      navigate("/");
      return;
    }
    setIsAdmin(true);
    setCheckingRole(false);
    loadAllData();
  };

  const loadAllData = async () => {
    setLoadingData(true);
    await Promise.all([loadProfiles(), loadRequests(), loadProposals()]);
    setLoadingData(false);
  };

  const loadProfiles = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data) {
      setProfiles(data as Profile[]);
      setStats((prev) => ({
        ...prev,
        totalUsers: data.length,
        totalBuyers: data.filter((p) => p.user_type === "buyer").length,
        totalBrokers: data.filter((p) => p.user_type === "broker").length,
      }));
    }
  };

  const loadRequests = async () => {
    const { data } = await supabase.from("property_requests").select("*").order("created_at", { ascending: false });
    if (data) {
      setRequests(data as PropertyRequest[]);
      setStats((prev) => ({
        ...prev,
        totalRequests: data.length,
        activeRequests: data.filter((r) => r.status === "active").length,
      }));
    }
  };

  const loadProposals = async () => {
    const { data } = await supabase.from("proposals").select("*").order("created_at", { ascending: false });
    if (data) {
      setProposals(data as Proposal[]);
      setStats((prev) => ({
        ...prev,
        totalProposals: data.length,
        pendingProposals: data.filter((p) => p.status === "pending").length,
        acceptedProposals: data.filter((p) => p.status === "accepted").length,
      }));
    }
  };

  const deleteRequest = async (id: string) => {
    const { error } = await supabase.from("property_requests").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir pedido");
    } else {
      toast.success("Pedido excluído");
      loadRequests();
      loadProposals();
    }
  };

  const deleteProposal = async (id: string) => {
    const { error } = await supabase.from("proposals").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir proposta");
    } else {
      toast.success("Proposta excluída");
      loadProposals();
    }
  };

  if (authLoading || checkingRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const formatCurrency = (v: number | null) =>
    v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Usuários</p>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <Badge variant="secondary">{stats.totalBuyers} compradores</Badge>
                <Badge variant="outline">{stats.totalBrokers} corretores</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalRequests}</p>
                  <p className="text-xs text-muted-foreground">Pedidos</p>
                </div>
              </div>
              <Badge variant="secondary" className="mt-2">{stats.activeRequests} ativos</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalProposals}</p>
                  <p className="text-xs text-muted-foreground">Propostas</p>
                </div>
              </div>
              <Badge variant="secondary" className="mt-2">{stats.acceptedProposals} aceitas</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.pendingProposals}</p>
                  <p className="text-xs text-muted-foreground">Propostas pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-1.5" />Usuários</TabsTrigger>
            <TabsTrigger value="requests"><FileText className="h-4 w-4 mr-1.5" />Pedidos</TabsTrigger>
            <TabsTrigger value="proposals"><MessageSquare className="h-4 w-4 mr-1.5" />Propostas</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle>Usuários ({profiles.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Cidade</TableHead>
                        <TableHead>CRECI</TableHead>
                        <TableHead>Cadastro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {p.avatar_url ? (
                                <img src={p.avatar_url} className="h-8 w-8 rounded-full object-cover" alt="" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              {p.full_name || "Sem nome"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={p.user_type === "broker" ? "default" : "secondary"}>
                              {p.user_type === "broker" ? "Corretor" : "Comprador"}
                            </Badge>
                          </TableCell>
                          <TableCell>{p.phone || "—"}</TableCell>
                          <TableCell>{p.city || "—"}</TableCell>
                          <TableCell>{p.creci || "—"}</TableCell>
                          <TableCell>{formatDate(p.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader><CardTitle>Pedidos ({requests.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Solicitante</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Bairro</TableHead>
                        <TableHead>Orçamento</TableHead>
                        <TableHead>Quartos</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.requester_name}</TableCell>
                          <TableCell>{r.property_type}</TableCell>
                          <TableCell>{r.neighborhood}</TableCell>
                          <TableCell>{formatCurrency(r.max_budget)}</TableCell>
                          <TableCell>{r.bedrooms ?? "—"}</TableCell>
                          <TableCell>
                            <Badge variant={r.status === "active" ? "default" : "secondary"}>
                              {r.status === "active" ? "Ativo" : r.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(r.created_at)}</TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir pedido?</AlertDialogTitle>
                                  <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteRequest(r.id)}>Excluir</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals">
            <Card>
              <CardHeader><CardTitle>Propostas ({proposals.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mensagem</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proposals.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="max-w-[300px] truncate">{p.message}</TableCell>
                          <TableCell>{formatCurrency(p.price)}</TableCell>
                          <TableCell>
                            <Badge variant={p.status === "accepted" ? "default" : p.status === "rejected" ? "destructive" : "secondary"}>
                              {p.status === "pending" ? "Pendente" : p.status === "accepted" ? "Aceita" : "Rejeitada"}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(p.created_at)}</TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir proposta?</AlertDialogTitle>
                                  <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteProposal(p.id)}>Excluir</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPanel;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Mail, Lock, User, Phone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

type AuthMode = "login" | "signup";
type UserType = "buyer" | "broker";

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [userType, setUserType] = useState<UserType>("buyer");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    creci: "",
  });

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: form.fullName,
            },
          },
        });
        if (error) throw error;

        // Update profile with user_type and extra fields after signup
        const { data: { user: newUser } } = await supabase.auth.getUser();
        if (newUser) {
          await supabase.from("profiles").update({
            user_type: userType,
            phone: form.phone || null,
            creci: userType === "broker" ? form.creci || null : null,
            full_name: form.fullName,
          }).eq("user_id", newUser.id);
        }

        toast.success("Conta criada! Verifique seu e-mail para confirmar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6">
            <Home className="h-6 w-6 text-accent" />
            <span className="text-xl font-bold text-foreground font-display">ImovelJá</span>
          </a>
          <h1 className="text-2xl font-bold text-foreground font-display">
            {mode === "login" ? "Entrar na sua conta" : "Criar nova conta"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {mode === "login"
              ? "Acesse sua conta para gerenciar pedidos e propostas"
              : "Cadastre-se para começar a usar a plataforma"}
          </p>
        </div>

        {/* User type selector (signup only) */}
        {mode === "signup" && (
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setUserType("buyer")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${
                userType === "buyer"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <span className="text-sm font-semibold text-foreground block">Comprador</span>
              <span className="text-xs text-muted-foreground">Quero encontrar imóveis</span>
            </button>
            <button
              type="button"
              onClick={() => setUserType("broker")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${
                userType === "broker"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <span className="text-sm font-semibold text-foreground block">Corretor</span>
              <span className="text-xs text-muted-foreground">Quero enviar propostas</span>
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-elevated border border-border/50 space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Seu nome completo"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="(98) 99999-9999"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              {userType === "broker" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">CRECI</label>
                  <Input
                    placeholder="Número do CRECI"
                    value={form.creci}
                    onChange={(e) => setForm({ ...form, creci: e.target.value })}
                    required
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
            {loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <p>
                Não tem conta?{" "}
                <button type="button" onClick={() => setMode("signup")} className="text-primary font-semibold hover:underline">
                  Cadastre-se
                </button>
              </p>
            ) : (
              <p>
                Já tem conta?{" "}
                <button type="button" onClick={() => setMode("login")} className="text-primary font-semibold hover:underline">
                  Entrar
                </button>
              </p>
            )}
          </div>
        </form>

        <div className="text-center mt-4">
          <a href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Voltar para a página inicial
          </a>
        </div>
      </div>
    </div>
  );
};

export default Auth;

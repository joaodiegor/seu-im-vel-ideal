import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BRAZIL_STATES } from "@/lib/locations";
import { Home, Mail, Lock, User, Phone, ArrowLeft, MapPin } from "lucide-react";
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
  const [showTypeForGoogle, setShowTypeForGoogle] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    creci: "",
    state: "",
  });

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const translateAuthError = (msg: string): string => {
    const m = msg.toLowerCase();
    if (m.includes("password should be at least")) return "A senha deve ter no mínimo 6 caracteres.";
    if (m.includes("password") && m.includes("short")) return "A senha deve ter no mínimo 6 caracteres.";
    if (m.includes("weak") || m.includes("pwned") || m.includes("compromised") || m.includes("leaked"))
      return "Essa senha é muito comum ou já foi vazada. Escolha uma senha mais segura.";
    if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
    if (m.includes("user already registered") || m.includes("already been registered"))
      return "Este e-mail já está cadastrado.";
    if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
    if (m.includes("invalid email")) return "E-mail inválido.";
    if (m.includes("rate limit") || m.includes("too many"))
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    return msg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "signup" && form.password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        if (userType === "broker" && !form.state) {
          toast.error("Selecione seu estado de atuação.");
          setLoading(false);
          return;
        }
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
            state: userType === "broker" ? form.state || null : null,
            full_name: form.fullName,
          } as any).eq("user_id", newUser.id);
        }

        toast.success("Conta criada! Verifique seu e-mail para confirmar.");
      } else {
        const { error, data: loginData } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");

        // Check if broker without avatar → redirect to profile
        if (loginData.user) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("user_type, avatar_url")
            .eq("user_id", loginData.user.id)
            .maybeSingle();

          if (prof?.user_type === "broker" && !prof.avatar_url) {
            toast.info("Complete seu perfil adicionando sua foto!");
            navigate("/perfil");
            return;
          }
        }
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
          <a href="/" className="inline-flex items-baseline gap-1.5 mb-6">
            <span className="font-display text-4xl font-bold text-primary tracking-tight leading-none">Brazuka</span>
            <span className="font-display text-lg font-light text-accent leading-none">Imóveis</span>
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

        {/* User type selector (signup and Google login) */}
        {(mode === "signup" || showTypeForGoogle) && (
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
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => {
                      const nums = e.target.value.replace(/\D/g, "").slice(0, 11);
                      let masked = nums;
                      if (nums.length > 2 && nums.length <= 7) {
                        masked = `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
                      } else if (nums.length > 7) {
                        masked = `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
                      } else if (nums.length > 0) {
                        masked = `(${nums}`;
                      }
                      setForm({ ...form, phone: masked });
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              {userType === "broker" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">CRECI</label>
                    <Input
                      placeholder="Número do CRECI"
                      value={form.creci}
                      onChange={(e) => setForm({ ...form, creci: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      <MapPin className="inline h-4 w-4 mr-1.5 text-primary" />
                      Estado de atuação
                    </label>
                    <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRAZIL_STATES.map((s) => (
                          <SelectItem key={s.uf} value={s.uf}>
                            {s.name} ({s.uf})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
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

          {mode === "login" && (
            <div className="text-right">
              <button
                type="button"
                onClick={async () => {
                  if (!form.email) {
                    toast.error("Digite seu e-mail primeiro.");
                    return;
                  }
                  setLoading(true);
                  try {
                    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
                      redirectTo: `${window.location.origin}/reset-password`,
                    });
                    if (error) throw error;
                    toast.success("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
                  } catch (error: any) {
                    toast.error(error.message || "Erro ao enviar e-mail de recuperação.");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="text-sm text-primary font-semibold hover:underline"
              >
                Esqueceu sua senha?
              </button>
            </div>
          )}

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full gap-2"
            disabled={loading}
            onClick={async () => {
              if (mode === "login" && !showTypeForGoogle) {
                setShowTypeForGoogle(true);
                toast.info("Escolha seu tipo de conta antes de continuar com Google.");
                return;
              }
              localStorage.setItem("google_signup_user_type", userType);
              const { error } = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin,
              });
              if (error) {
                toast.error("Erro ao entrar com Google. Tente novamente.");
              }
            }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar com Google
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

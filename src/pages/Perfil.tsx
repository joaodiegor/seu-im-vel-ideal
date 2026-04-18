import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BRAZIL_STATES } from "@/lib/locations";
import { Camera, Save, Loader2, User, Phone, MapPin, Award, FileText, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isPushSupported, subscribeToPush, unsubscribeFromPush, isSubscribed } from "@/lib/pushNotifications";
import { toast } from "sonner";
import { motion } from "framer-motion";

const phoneMask = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const creciMask = (value: string) => {
  return value.replace(/[^a-zA-Z0-9\-\/]/g, "").slice(0, 20);
};

const Perfil = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userType, setUserType] = useState<"buyer" | "broker">("buyer");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    bio: "",
    area: "",
    specialty: "",
    creci: "",
    state: "",
  });

  useEffect(() => {
    isSubscribed().then(setPushEnabled);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (profile) {
      setUserType(profile.user_type);
      setForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        area: profile.area || "",
        specialty: profile.specialty || "",
        creci: profile.creci || "",
        state: (profile as any).state || "",
      });
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("Nenhum arquivo selecionado.");
      return;
    }
    if (!user) {
      toast.error("Você precisa estar logado.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB.");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;

      // Remove old file first to avoid conflicts
      await supabase.storage.from("avatars").remove([filePath]);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Erro ao enviar foto: " + uploadError.message);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const urlWithCache = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlWithCache })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        toast.error("Erro ao atualizar foto no perfil.");
        return;
      }

      setAvatarUrl(urlWithCache);
      toast.success("Foto atualizada!");
    } catch (err) {
      console.error("Avatar upload exception:", err);
      toast.error("Erro inesperado ao enviar foto.");
    } finally {
      setUploading(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!user || !form.full_name.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }

    if (userType === "broker" && !form.creci.trim()) {
      toast.error("O CRECI é obrigatório para corretores.");
      return;
    }

    if (userType === "broker" && !form.state) {
      toast.error("Selecione seu estado de atuação.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
        bio: form.bio.trim() || null,
        area: form.area.trim() || null,
        specialty: form.specialty.trim() || null,
        creci: form.creci.trim() || null,
        state: userType === "broker" ? (form.state || null) : null,
        user_type: userType,
      })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast.error("Erro ao salvar perfil.");
      return;
    }

    toast.success("Perfil atualizado com sucesso!");
  };

  if (authLoading) return null;

  const isBroker = userType === "broker";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground font-display">Meu Perfil</h1>
              <p className="text-muted-foreground mt-1">Atualize suas informações pessoais e preferências.</p>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 shadow-elevated overflow-hidden">
              {/* Avatar section */}
              <div className="bg-primary/5 p-8 flex flex-col items-center">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-muted border-4 border-card shadow-card">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <User className="h-12 w-12 text-primary" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <h2 className="mt-4 text-xl font-bold text-foreground font-display">
                  {form.full_name || "Seu nome"}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">
                    {isBroker ? "Corretor" : "Comprador"}
                  </Badge>
                  {user?.email && (
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                  )}
                </div>
              </div>

              {/* User type selector */}
              <div className="p-6 border-b border-border/50">
                <label className="block text-sm font-medium text-foreground mb-3">Tipo de conta</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType("buyer")}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all text-left ${
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
                    className={`flex-1 p-3 rounded-xl border-2 transition-all text-left ${
                      userType === "broker"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <span className="text-sm font-semibold text-foreground block">Corretor</span>
                    <span className="text-xs text-muted-foreground">Quero enviar propostas</span>
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-8 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <User className="inline h-4 w-4 mr-1.5 text-primary" />
                    Nome completo *
                  </label>
                  <Input
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <Phone className="inline h-4 w-4 mr-1.5 text-primary" />
                    WhatsApp
                  </label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: phoneMask(e.target.value) })}
                    placeholder="(98) 99999-9999"
                    maxLength={15}
                  />
                </div>

                {isBroker && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        <Award className="inline h-4 w-4 mr-1.5 text-primary" />
                        CRECI *
                      </label>
                      <Input
                        value={form.creci}
                        onChange={(e) => setForm({ ...form, creci: creciMask(e.target.value) })}
                        placeholder="Ex: 12345-F ou CRECI/MA 12345"
                        maxLength={20}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        <MapPin className="inline h-4 w-4 mr-1.5 text-primary" />
                        Área de atuação
                      </label>
                      <Input
                        value={form.area}
                        onChange={(e) => setForm({ ...form, area: e.target.value })}
                        placeholder="Ex: São Paulo - Pinheiros, Vila Madalena, Moema"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Especialidade
                      </label>
                      <Input
                        value={form.specialty}
                        onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                        placeholder="Ex: Imóveis de luxo, Apartamentos, Terrenos"
                      />
                    </div>
                  </>
                )}

                {/* Push Notification Toggle */}
                {isPushSupported() && (
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Notificações push</p>
                        <p className="text-xs text-muted-foreground">
                          {isBroker
                            ? "Receba alertas quando novos pedidos forem publicados"
                            : "Receba alertas sobre suas propostas"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={pushEnabled}
                      disabled={pushLoading}
                      onCheckedChange={async (checked) => {
                        if (!user) return;
                        setPushLoading(true);
                        if (checked) {
                          const ok = await subscribeToPush(user.id);
                          setPushEnabled(ok);
                          if (ok) toast.success("Notificações ativadas!");
                          else toast.error("Não foi possível ativar as notificações. Verifique as permissões do navegador.");
                        } else {
                          await unsubscribeFromPush(user.id);
                          setPushEnabled(false);
                          toast.success("Notificações desativadas.");
                        }
                        setPushLoading(false);
                      }}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <FileText className="inline h-4 w-4 mr-1.5 text-primary" />
                    {isBroker ? "Bio / Apresentação" : "Sobre você"}
                  </label>
                  <Textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder={isBroker
                      ? "Conte sobre sua experiência e diferenciais..."
                      : "Conte sobre o que você procura, preferências..."
                    }
                    rows={4}
                  />
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5 mr-2" />
                  )}
                  {saving ? "Salvando..." : "Salvar perfil"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Perfil;

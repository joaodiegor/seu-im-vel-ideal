import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Camera, Save, Loader2, User, Phone, MapPin, Award, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Perfil = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userType, setUserType] = useState<"buyer" | "broker">("buyer");
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    bio: "",
    area: "",
    specialty: "",
    creci: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        area: profile.area || "",
        specialty: profile.specialty || "",
        creci: profile.creci || "",
      });
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB.");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Erro ao enviar foto.");
      setUploading(false);
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

    setUploading(false);

    if (updateError) {
      toast.error("Erro ao atualizar foto.");
      return;
    }

    setAvatarUrl(urlWithCache);
    toast.success("Foto atualizada!");
  };

  const handleSave = async () => {
    if (!user || !form.full_name.trim()) {
      toast.error("O nome é obrigatório.");
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

  const isBroker = profile?.user_type === "broker";

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
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="(98) 99999-9999"
                  />
                </div>

                {isBroker && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        <Award className="inline h-4 w-4 mr-1.5 text-primary" />
                        CRECI
                      </label>
                      <Input
                        value={form.creci}
                        onChange={(e) => setForm({ ...form, creci: e.target.value })}
                        placeholder="Número do CRECI"
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
                        placeholder="Ex: São Luís - Calhau, Renascença, Cohama"
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

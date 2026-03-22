import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, MapPin, DollarSign, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const bairros = [
  "Altos do Calhau",
  "Angelim",
  "Araçagy",
  "Aracagy",
  "Bequimão",
  "Calhau",
  "Cidade Operária",
  "Cohab",
  "Cohama",
  "Cohatrac",
  "Forquilha",
  "Ipase",
  "Jardim Eldorado",
  "Jardim São Cristóvão",
  "Maiobão",
  "Monte Castelo",
  "Olho D'Água",
  "Ponta D'Areia",
  "Recanto dos Vinhais",
  "Renascença",
  "Sacavém",
  "Santa Cruz",
  "São Francisco",
  "Turu",
  "Vinhais",
  "Outro",
];

const tiposComQuartos = ["casa", "apartamento", "casa_condominio"];

const RequestForm = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: "",
    bairro: "",
    quartos: "",
    banheiros: "",
    metragem_minima: "",
    orcamento: "",
    detalhes: "",
    nome: "",
    telefone: "",
    nome_visivel: true,
    telefone_visivel: true,
  });

  const showQuartosBanheiros = tiposComQuartos.includes(formData.tipo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Você precisa estar logado para publicar um pedido.");
      navigate("/auth");
      return;
    }

    if (!formData.tipo || !formData.bairro || !formData.nome || !formData.telefone) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);

    const budgetNum = formData.orcamento
      ? parseFloat(formData.orcamento.replace(/[R$\s.]/g, "").replace(",", "."))
      : null;

    const minAreaNum = formData.metragem_minima
      ? parseFloat(formData.metragem_minima.replace(/\./g, "").replace(",", "."))
      : null;

    const { error } = await supabase.from("property_requests").insert({
      user_id: user.id,
      property_type: formData.tipo,
      neighborhood: formData.bairro,
      bedrooms: showQuartosBanheiros && formData.quartos ? parseInt(formData.quartos) : null,
      bathrooms: showQuartosBanheiros && formData.banheiros ? parseInt(formData.banheiros) : null,
      min_area: minAreaNum,
      max_budget: budgetNum,
      details: formData.detalhes || null,
      requester_name: formData.nome,
      requester_phone: formData.telefone,
      name_visible: formData.nome_visivel,
      phone_visible: formData.telefone_visivel,
    });

    setLoading(false);

    if (error) {
      toast.error("Erro ao publicar pedido. Tente novamente.");
      console.error(error);
      return;
    }

    toast.success("Pedido publicado com sucesso! Corretores começarão a enviar propostas em breve.");
    setFormData({ tipo: "", bairro: "", quartos: "", banheiros: "", metragem_minima: "", orcamento: "", detalhes: "", nome: "", telefone: "", nome_visivel: true, telefone_visivel: true });
  };

  return (
    <section className="py-24 bg-secondary/50" id="publicar">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-accent font-semibold text-sm uppercase tracking-widest">Publique seu pedido</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-3 font-display leading-tight">
              Descreva o imóvel que você{" "}
              <span className="text-gradient-primary">procura</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              Quanto mais detalhes, melhores as propostas. Informe bairro preferido, número de quartos, orçamento e qualquer preferência especial.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { icon: Home, text: "Casa, apartamento, terreno ou comercial" },
                { icon: MapPin, text: "Escolha o bairro ou aceite sugestões" },
                { icon: DollarSign, text: "Defina seu orçamento máximo" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-foreground">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-base">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="bg-card rounded-2xl p-8 shadow-elevated border border-border/50"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Tipo de imóvel *</label>
                <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v, quartos: tiposComQuartos.includes(v) ? formData.quartos : "", banheiros: tiposComQuartos.includes(v) ? formData.banheiros : "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartamento">Apartamento</SelectItem>
                    <SelectItem value="casa">Casa</SelectItem>
                    <SelectItem value="casa_condominio">Casa de Condomínio</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="terreno">Terreno / Lote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showQuartosBanheiros && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Quartos</label>
                    <Select value={formData.quartos} onValueChange={(v) => setFormData({ ...formData, quartos: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Qtd" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map(n => (
                          <SelectItem key={n} value={String(n)}>{n}+</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Banheiros</label>
                    <Select value={formData.banheiros} onValueChange={(v) => setFormData({ ...formData, banheiros: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Qtd" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map(n => (
                          <SelectItem key={n} value={String(n)}>{n}+</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Área mínima do imóvel (m²)</label>
                <Input
                  placeholder="Ex: 120"
                  value={formData.metragem_minima}
                  onChange={(e) => setFormData({ ...formData, metragem_minima: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Bairro preferido *</label>
                <Select value={formData.bairro} onValueChange={(v) => setFormData({ ...formData, bairro: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha o bairro" />
                  </SelectTrigger>
                  <SelectContent>
                    {bairros.map(b => (
                      <SelectItem key={b} value={b.toLowerCase()}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Orçamento máximo</label>
                <Input
                  placeholder="R$ 0,00"
                  value={formData.orcamento}
                  onChange={(e) => {
                    let raw = e.target.value.replace(/[^\d]/g, "");
                    if (!raw) { setFormData({ ...formData, orcamento: "" }); return; }
                    const cents = parseInt(raw);
                    const formatted = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
                    setFormData({ ...formData, orcamento: formatted });
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Detalhes e preferências</label>
                <Textarea
                  placeholder="Ex: Aceito bairros próximos, precisa ser em condomínio fechado, com 2 vagas..."
                  rows={4}
                  value={formData.detalhes}
                  onChange={(e) => setFormData({ ...formData, detalhes: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Seu nome *</label>
                  <Input
                    placeholder="Nome completo"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <Checkbox
                      checked={formData.nome_visivel}
                      onCheckedChange={(checked) => setFormData({ ...formData, nome_visivel: !!checked })}
                    />
                    <span className="text-xs text-muted-foreground">Visível para corretores</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">WhatsApp *</label>
                  <Input
                    placeholder="(98) 99999-9999"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    required
                  />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <Checkbox
                      checked={formData.telefone_visivel}
                      onCheckedChange={(checked) => setFormData({ ...formData, telefone_visivel: !!checked })}
                    />
                    <span className="text-xs text-muted-foreground">Visível para corretores</span>
                  </label>
                </div>
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full text-base py-6" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Send className="mr-2 h-5 w-5" />
                )}
                {loading ? "Publicando..." : "Publicar pedido gratuitamente"}
              </Button>

              {!user && (
                <p className="text-center text-sm text-muted-foreground">
                  Você precisa <a href="/auth" className="text-primary underline">entrar ou cadastrar</a> para publicar.
                </p>
              )}
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default RequestForm;

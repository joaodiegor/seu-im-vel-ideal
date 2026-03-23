import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2, ExternalLink, ImagePlus, X, Pencil } from "lucide-react";
import { toast } from "sonner";

interface ProposalFormModalProps {
  open: boolean;
  onClose: () => void;
  requestId: string;
  requesterName: string;
  propertyType: string;
  neighborhood: string;
  /** If provided, we're editing an existing proposal */
  editProposal?: {
    id: string;
    message: string;
    price: number | null;
    property_link: string | null;
    broker_phone: string | null;
  } | null;
  onSuccess: () => void;
}

interface ProposalImage {
  id?: string;
  url: string;
  file?: File;
  isNew?: boolean;
}

const typeLabels: Record<string, string> = {
  casa: "Casa",
  apartamento: "Apartamento",
  terreno: "Terreno",
  comercial: "Comercial",
};

const ProposalFormModal = ({
  open,
  onClose,
  requestId,
  requesterName,
  propertyType,
  neighborhood,
  editProposal,
  onSuccess,
}: ProposalFormModalProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState("");
  const [price, setPrice] = useState("");
  const [link, setLink] = useState("");
  const [phone, setPhone] = useState("");

  const formatCurrency = (value: string) => {
    const nums = value.replace(/\D/g, "");
    if (!nums) return "";
    const amount = parseInt(nums, 10) / 100;
    return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatPhone = (value: string) => {
    const nums = value.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 2) return nums.length ? `(${nums}` : "";
    if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  };
  const [images, setImages] = useState<ProposalImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);

  const isEditing = !!editProposal;

  useEffect(() => {
    if (open && editProposal) {
      setMessage(editProposal.message || "");
      setPrice(editProposal.price ? String(editProposal.price) : "");
      setLink(editProposal.property_link || "");
      setPhone(editProposal.broker_phone || "");
      setRemovedImageIds([]);
      loadExistingImages(editProposal.id);
    } else if (open && !editProposal) {
      setMessage("");
      setPrice("");
      setLink("");
      setPhone("");
      setImages([]);
      setRemovedImageIds([]);
    }
  }, [open, editProposal]);

  const loadExistingImages = async (proposalId: string) => {
    setLoadingImages(true);
    const { data } = await supabase
      .from("proposal_images")
      .select("id, image_url")
      .eq("proposal_id", proposalId);

    if (data) {
      setImages(data.map((img: any) => ({ id: img.id, url: img.image_url })));
    }
    setLoadingImages(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentCount = images.length;
    const remaining = 10 - currentCount;

    if (remaining <= 0) {
      toast.error("Máximo de 10 imagens por proposta.");
      return;
    }

    const newFiles = Array.from(files).slice(0, remaining);
    const newImages: ProposalImage[] = newFiles.map((file) => ({
      url: URL.createObjectURL(file),
      file,
      isNew: true,
    }));

    setImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const img = images[index];
    if (img.id) {
      setRemovedImageIds((prev) => [...prev, img.id!]);
    }
    if (img.isNew && img.url.startsWith("blob:")) {
      URL.revokeObjectURL(img.url);
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (proposalId: string): Promise<string[]> => {
    const newImages = images.filter((img) => img.isNew && img.file);
    const urls: string[] = [];

    for (const img of newImages) {
      const ext = img.file!.name.split(".").pop() || "jpg";
      const path = `${user!.id}/${proposalId}/${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from("proposal-images")
        .upload(path, img.file!);

      if (error) {
        console.error("Upload error:", error);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("proposal-images")
        .getPublicUrl(path);

      urls.push(urlData.publicUrl);
    }

    return urls;
  };

  const handleSubmit = async () => {
    if (!message.trim() || !price.trim() || !phone.trim()) {
      toast.error("Preencha todos os campos obrigatórios antes de enviar.");
      return;
    }

    setSubmitting(true);

    const priceNum = parseFloat(price.replace(/\./g, "").replace(",", "."));

    try {
      if (isEditing && editProposal) {
        // Update proposal
        const { error } = await supabase
          .from("proposals")
          .update({
            message: message.trim(),
            price: priceNum,
            property_link: link.trim(),
            broker_phone: phone.trim(),
          })
          .eq("id", editProposal.id);

        if (error) throw error;

        // Remove deleted images from DB
        if (removedImageIds.length > 0) {
          await supabase
            .from("proposal_images")
            .delete()
            .in("id", removedImageIds);
        }

        // Upload new images
        const newUrls = await uploadImages(editProposal.id);
        if (newUrls.length > 0) {
          await supabase.from("proposal_images").insert(
            newUrls.map((url) => ({
              proposal_id: editProposal.id,
              image_url: url,
            }))
          );
        }

        toast.success("Proposta atualizada com sucesso!");
      } else {
        // Insert new proposal
        const { data: newProposal, error } = await supabase
          .from("proposals")
          .insert({
            request_id: requestId,
            broker_id: user!.id,
            message: message.trim(),
            price: priceNum,
            property_link: link.trim(),
            broker_phone: phone.trim(),
          } as any)
          .select("id")
          .single();

        if (error) throw error;

        // Upload images
        if (newProposal) {
          const urls = await uploadImages(newProposal.id);
          if (urls.length > 0) {
            await supabase.from("proposal_images").insert(
              urls.map((url) => ({
                proposal_id: newProposal.id,
                image_url: url,
              }))
            );
          }
        }

        toast.success("Proposta enviada com sucesso!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(isEditing ? "Erro ao atualizar proposta." : "Erro ao enviar proposta.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? "Editar proposta" : "Enviar proposta"}
          </DialogTitle>
          <DialogDescription>
            Para: <strong>{requesterName}</strong> — {typeLabels[propertyType] || propertyType} em{" "}
            <span className="capitalize">{neighborhood}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Sua mensagem *</label>
            <Textarea
              placeholder="Apresente-se e descreva o imóvel que você tem para oferecer..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Valor sugerido (R$) *</label>
            <Input
              placeholder="Ex: 450.000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Link do imóvel</label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="https://..."
                className="pl-10"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Telefone para contato *</label>
            <Input
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Fotos do imóvel (até 10)
            </label>
            {loadingImages ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando imagens...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border/50">
                      <img
                        src={img.url}
                        alt={`Imagem ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {images.length < 10 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-[10px]">Adicionar</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{images.length}/10 imagens</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </>
            )}
          </div>

          <Button
            variant="hero"
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting || !message.trim() || !price.trim() || !phone.trim()}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : isEditing ? (
              <Pencil className="h-4 w-4 mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {submitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Enviar proposta"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalFormModal;

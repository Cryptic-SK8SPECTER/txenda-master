import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon, Play, Loader2 } from "lucide-react";
import { contentService } from "@/services/contentService";

const publishSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória").max(500),
  type: z.enum(["photo", "video"]),
  price: z.number().min(0).optional(),
  visibility: z.enum(["Público", "Exclusivo assinantes", "Pago individualmente"]),
});

type PublishFormValues = z.infer<typeof publishSchema>;

interface PublishContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: (newContent: any) => void; // Ajustado para receber o retorno da API
}

const PublishContentModal = ({ open, onOpenChange, onPublish }: PublishContentModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PublishFormValues>({
    resolver: zodResolver(publishSchema),
    defaultValues: {
      description: "",
      type: "photo",
      price: 0,
      visibility: "Público",
    },
  });

  const visibility = form.watch("visibility");

  const handleFile = useCallback((f: File) => {
    setFile(f);
    const isVideo = f.type.startsWith("video/");
    form.setValue("type", isVideo ? "video" : "photo");
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, [form]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  // FUNÇÃO DE SUBMISSÃO REAL CONECTADA AO SERVICE
  const onSubmit = async (values: PublishFormValues) => {

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file); 
      formData.append("description", values.description);
      formData.append("price", String(values.price ?? 0));
      formData.append("type", values.type);
      formData.append("visibility", values.visibility);

      const response = await contentService.createContent(formData);

      if (response.status === "success") {
        toast({ title: "Sucesso!", description: "Conteúdo publicado com sucesso." });

        // Limpeza de estado
        if (preview) URL.revokeObjectURL(preview);
        setFile(null);
        setPreview(null);
        form.reset();

        // Notifica o componente pai (Profile.tsx) para atualizar a lista
        onPublish(response.data.data);
        onOpenChange(false);
      }
    } catch (error: any) {
      console.log('Erro na publicação: ', error)
      toast({
        variant: "destructive",
        title: "Erro na publicação",
        description: error.response?.data?.message || "Erro ao fazer upload para o servidor.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-display">
            Publicar Novo Conteúdo
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Área de Upload */}
            {!file ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Arraste ou clique para enviar
                </p>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFile(e.target.files[0])
                  }
                />
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden bg-secondary/50 aspect-video">
                {file.type.startsWith("video/") ? (
                  <video
                    src={preview!}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={preview!}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o seu conteúdo..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quem pode ver este conteúdo?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecione a visibilidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Público">
                        🔓 Público (Grátis para todos)
                      </SelectItem>
                      <SelectItem value="Exclusivo assinantes">
                        ⭐ Exclusivo assinantes
                      </SelectItem>
                      <SelectItem value="Pago individualmente">
                        💰 Pago individualmente (PPV)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {visibility === "Pago individualmente" && (
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <FormLabel>Preço de Venda (MZN)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-[10px] text-muted-foreground">
                      Este valor será cobrado por cada compra avulsa
                      (Pay-per-view).
                    </p>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : null}
                {isSubmitting ? "A publicar..." : "Publicar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PublishContentModal;
import { useState } from "react";
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
import { Loader2, Upload, X } from "lucide-react";
import { basicUrl } from "@/utils/index";
import { contentService } from "@/services/contentService";

const editSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória").max(500),
  type: z.enum(["photo", "video"]),
  price: z.number().min(0).optional(),
  visibility: z.enum(['Público', 'Exclusivo assinantes', 'Pago individualmente']),
});

type EditFormValues = z.infer<typeof editSchema>;

const EditContentModal = ({
  open,
  onOpenChange,
  content,
  onSave,
}: EditContentModalProps) => {
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newPreview, setNewPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    values: content
      ? {
          description: content.description,
          type: content.type as "photo" | "video",
          price: content.price,
          // Mapeamento direto do valor que vem do backend
          visibility: content.visibility as
            | "Público"
            | "Exclusivo assinantes"
            | "Pago individualmente",
        }
      : undefined,
  });

  // 1. Monitorizar a visibilidade
  const visibility = form.watch("visibility");

  const handleSubmit = async (values: EditFormValues) => {
    if (!content) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Se houver ficheiro novo, anexamos
      if (newFile) {
        formData.append("file", newFile);
      }
      // 2. Garantir que o preço é 0 se não for PPV
      const finalPrice =
        values.visibility === "Pago individualmente" ? values.price : 0;
      formData.append("description", values.description);
      formData.append("type", values.type);
      formData.append("visibility", values.visibility); // Envia o texto exato: 'Público', etc.
      formData.append("price", (values.price || 0).toString());

      const response = await contentService.updateContent(
        content._id,
        formData,
      );

      if (response.status === "success") {
        toast({ title: "Conteúdo atualizado!" });
        onSave(response.data.data || response.data.content);
        onOpenChange(false);
        setNewFile(null);
        setNewPreview(null);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.response?.data?.message || "Erro de conexão",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (f: File) => {
    setNewFile(f);
    setNewPreview(URL.createObjectURL(f));
    form.setValue("type", f.type.startsWith("video/") ? "video" : "photo");
  };

  if (!content) return null;

  const displayPreview = newPreview
    ? newPreview
    : `${basicUrl}img/contents/${content.url}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-display">Editar Conteúdo</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Media Preview com opção de Substituir */}
            <div className="relative rounded-lg overflow-hidden bg-secondary/50 aspect-video">
              {form.watch("type") === "video" ? (
                <video
                  src={displayPreview}
                  className="h-full w-full object-cover"
                  controls
                />
              ) : (
                <img
                  src={displayPreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              )}

              <label className="absolute bottom-2 right-2 h-8 px-3 rounded-md bg-black/60 flex items-center gap-1.5 text-xs text-white cursor-pointer hover:bg-black/80 transition-colors">
                <Upload className="h-3.5 w-3.5" /> Substituir
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFileChange(e.target.files[0])
                  }
                />
              </label>

              {newFile && (
                <button
                  type="button"
                  onClick={() => {
                    setNewFile(null);
                    setNewPreview(null);
                  }}
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/60 flex items-center justify-center text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 3. Lógica de Grid e Visibilidade Condicional */}
            <div
              className={`grid gap-4 ${visibility === "Pago individualmente" ? "grid-cols-2" : "grid-cols-1"}`}
            >
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibilidade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Público">Público</SelectItem>
                        <SelectItem value="Exclusivo assinantes">
                          Exclusivo assinantes
                        </SelectItem>
                        <SelectItem value="Pago individualmente">
                          Pago individualmente
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Só exibe o preço se for Pago individualmente */}
              {visibility === "Pago individualmente" && (
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="animate-in fade-in slide-in-from-left-2 duration-300">
                      <FormLabel>Preço (MZN)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Guardar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};;

export default EditContentModal;
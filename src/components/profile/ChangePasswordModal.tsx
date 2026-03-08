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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
// IMPORTAR O SERVIÇO
import { userService } from "@/services/userService";

const passwordSchema = z.object({
  passwordCurrent: z.string().min(1, "Senha atual é obrigatória"), // Backend espera 'passwordCurrent'
  password: z.string().min(8, "A nova senha deve ter no mínimo 8 caracteres"), // Backend espera 'password'
  passwordConfirm: z.string().min(1, "Confirme a nova senha"), // Backend espera 'passwordConfirm'
}).refine((data) => data.password === data.passwordConfirm, {
  message: "As senhas não coincidem",
  path: ["passwordConfirm"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChangePasswordModal = ({ open, onOpenChange }: ChangePasswordModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { passwordCurrent: "", password: "", passwordConfirm: "" },
  });

  const handleSubmit = async (values: PasswordFormValues) => {
    setIsSubmitting(true);
    try {
      // CHAMADA REAL PARA O BACKEND
      await userService.updatePassword(values);
      
      toast({ title: "Sucesso!", description: "Senha alterada corretamente." });
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({ 
        title: "Erro ao alterar senha", 
        description: error.response?.data?.message || "Verifique se a senha atual está correta.",
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Alterar Senha</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="passwordCurrent" render={({ field }) => (
              <FormItem>
                <FormLabel>Senha Atual</FormLabel>
                <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Nova Senha</FormLabel>
                <FormControl><Input type="password" placeholder="Mín. 8 caracteres" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="passwordConfirm" render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Nova Senha</FormLabel>
                <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Alterar Senha
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import BrandingSection from "@/components/brand/BrandingSection";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom"
import { registerUser } from "@/services/authService";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemasignup } from "@/utils/index";
import * as z from "zod";

type RegisterFormValues = z.infer<typeof schemasignup>;

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();


  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schemasignup),
    mode: "onTouched", // Só valida após o campo ser tocado — evita falsos negativos
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      passwordConfirm: "",
      role: "user",
      terms: false,
    },
  });


  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.displayName);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("passwordConfirm", data.passwordConfirm);
      formData.append("role", data.role);


      const response = await registerUser(formData);

      if (response.status === "success") {
        toast({ title: "Sucesso!", description: "Conta criada com sucesso." });
        navigate("/login");
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.response?.data?.message || "Erro ao criar conta.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ErrorMessage = ({ name }: { name: keyof RegisterFormValues }) => {
    const error = errors[name];
    if (!error) return null;
    return (
      <span className="text-destructive text-[10px] font-medium mt-1 animate-in fade-in slide-in-from-top-1">
        {error.message as string}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background flex font-body">
      {/* Left - Branding (hidden on mobile) */}
      <BrandingSection />

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold mb-2">Criar Conta</h2>
            <p className="text-muted-foreground">Preencha os dados para entrar na plataforma.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="displayName">Nome de exibição</Label>
              <Input
                {...register("displayName")}
                placeholder="Como quer ser chamado(a)"
                className={`mt-1.5 bg-secondary border-border ${
                  errors.displayName ? "border-destructive" : ""
                }`}
              />
              <ErrorMessage name="displayName" />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                {...register("email")}
                placeholder="seu@email.com"
                autoComplete="email"
                inputMode="email"
                className={`mt-1.5 bg-secondary border-border ${
                  errors.email ? "border-destructive" : ""
                }`}
              />
              <ErrorMessage name="email" />
            </div>

            <div>
              <Label htmlFor="password">Palavra-passe</Label>
              <Input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className={`mt-1.5 bg-secondary border-border ${
                  errors.password ? "border-destructive" : ""
                }`}
              />
              <ErrorMessage name="password" />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar</Label>
              <Input
                {...register("passwordConfirm")}
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className={`mt-1.5 bg-secondary border-border ${
                  errors.passwordConfirm ? "border-destructive" : ""
                }`}
              />
              <ErrorMessage name="passwordConfirm" />
            </div>



            <div className="flex items-start gap-3 pt-2">
              <Controller
                name="terms"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="terms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="age" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                Confirmo que tenho mais de 18 anos e aceito os{" "}
                <span className="text-primary underline">Termos e Condições</span> e a{" "}
                <span className="text-primary underline">Política de Privacidade</span>.
              </Label>
            </div>
            {errors.terms && (
              <span className="text-destructive text-[10px]">{errors.terms.message}</span>
            )}

            <Button
              variant="hero"
              size="lg"
              type="submit"
              className="w-full rounded-full text-base py-6 mt-2"
              disabled={isLoading || !watch("terms")}
            >
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-muted-foreground text-sm">
              Já tem conta?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Entrar
              </Link>
            </p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
              <Shield className="w-3.5 h-3.5" />
              <span>Seus dados são protegidos e nunca serão exibidos publicamente sem sua permissão.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;

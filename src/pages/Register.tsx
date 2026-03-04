import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Shield, Plus, Trash2, Camera, ChevronRight, ChevronLeft } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { registerUser } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

import registerBg from "@/assets/register-bg.jpg";

// --- ESQUEMA DE VALIDAÇÃO ZOD ---
const schema = z.object({
  // Auth & Profile
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  passwordConfirm: z.string().min(8, "Mínimo 8 caracteres"),
  displayName: z.string().min(2, "Nome muito curto"),
  bio: z.string().max(500).optional(),
  birthDate: z.string().refine((date) => {
    const birth = new Date(date);
    const now = new Date();
    const age = now.getFullYear() - birth.getFullYear();
    return age >= 18;
  }, "Você deve ter pelo menos 18 anos"),
  gender: z.enum(['masculino', 'feminino', 'outro', 'prefiro_nao_dizer']),
  lookingFor: z.enum(['conteudos', 'encontros', 'ambos']),
  contentInterest: z.enum(['Quero comprar conteudo',
    'Quero vender conteudo',
    'comprar e vender',
    'Nao tenho interesse',]),
  location: z.string().optional(),
  phone: z.string().optional(),
  socialLinks: z.array(z.object({
    platform: z.string().min(1, "Obrigatório"),
    url: z.string().url("URL inválida"),
    username: z.string().optional()
  })).max(5),
  terms: z.literal(true, {
    errorMap: () => ({ message: "Você deve aceitar os termos" }),
  }),
});

type RegisterFormValues = z.infer<typeof schema>;

const Register = () => {

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [api, setApi] = useState<CarouselApi>();
  const [currentStep, setCurrentStep] = useState(0);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isDirty }, // Adicionamos isDirty
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange", // Valida em tempo real
  });

  // --- DEBUG DE ERROS (Adiciona isto aqui) ---
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Campos com erro:", errors);
    }
  }, [errors]);

  // Função para renderizar o erro de forma padronizada
  const ErrorMessage = ({ name }: { name: keyof RegisterFormValues }) => {
    const error = errors[name];
    if (!error) return null;
    return (
      <span className="text-destructive text-[10px] font-medium mt-1 animate-in fade-in slide-in-from-top-1">
        {error.message as string}
      </span>
    );
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialLinks",
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // O objeto 'data' já contém: email, password, displayName, socialLinks, etc.
      const response = await registerUser(data);

      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao Txenda. Redirecionando...",
      });

      // Salva o token se necessário (embora o controller já envie via Cookie)
      if (response.token) localStorage.setItem('token', response.token);

      // Redireciona para o dashboard
      setTimeout(() => navigate("/dashboard"), 2000);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: error.response?.data?.message || "Ocorreu um erro ao criar sua conta.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("Arquivo muito grande (Máx 5MB)");
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => api?.scrollNext();
  const prevStep = () => api?.scrollPrev();

  // Monitorar o progresso do carrossel
  useState(() => {
    if (!api) return;
    api.on("select", () => setCurrentStep(api.selectedScrollSnap()));
  }, [api]);




  return (
    <div className="min-h-screen bg-background flex font-body">
      {/* Left - Branding (Mantido conforme instrução) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${registerBg})` }}
        />
        <div className="absolute inset-0 bg-background/60" />
        <div className="relative z-10 p-12 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-4xl font-bold mb-6 leading-tight">
              Faça parte da maior comunidade de criadores.
            </h1>
            <div className="space-y-4">
              {[
                "Conecte-se com pessoas próximas",
                "Monetize seu conteúdo exclusivo",
                "Segurança e privacidade garantida",
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="bg-primary/20 p-1 rounded-full">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-lg opacity-90">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right - Form Carousel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-bold">Criar Conta</h2>
            <p className="text-muted-foreground mt-2">Passo {currentStep + 1} de 4</p>
            {/* Progress Bar */}
            <div className="w-full bg-secondary h-1.5 mt-4 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${(currentStep + 1) * 25}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Carousel setApi={setApi} opts={{ watchDrag: false }}>
              <CarouselContent>

                {/* SEÇÃO 1: DADOS BÁSICOS */}
                <CarouselItem>
                  <div className="space-y-4 p-1">
                    <div className="flex flex-col items-center mb-4">
                      <div
                        className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-dashed border-primary cursor-pointer relative"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <input type="file" hidden ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" />
                      <Label className="mt-2 text-xs text-muted-foreground">Foto de Perfil (Opcional)</Label>
                    </div>

                    <div className="grid gap-2">
                      <Label>Nome de Exibição</Label>
                      <Input {...register("displayName")} placeholder="Como quer ser chamado(a)" />
                      <ErrorMessage name="displayName" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Biografia / Sobre mim</Label>
                      <Textarea
                        {...register("bio")}
                        placeholder="Conte um pouco sobre você..."
                        className="h-32"
                      />
                      <span className="text-[10px] text-right text-muted-foreground">
                        {watch("bio")?.length || 0}/500
                      </span>
                    </div>

                    <div className="grid gap-2">
                      <Label>Telefone </Label>
                      <Input {...register("phone")} placeholder="+258 ..." />
                    </div>

                    <div className="grid gap-2">
                      <Label>Data de Nascimento</Label>
                      <Input {...register("birthDate")} type="date" />
                      <ErrorMessage name="birthDate" />
                    </div>

                    <Button type="button" className="w-full mt-4" onClick={nextStep}>
                      Continuar <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CarouselItem>

                {/* SEÇÃO 2: PREFERÊNCIAS */}
                <CarouselItem>
                  <div className="space-y-4 p-1">
                    <div className="grid gap-2">
                      <Label>Gênero</Label>
                      <Select onValueChange={(v) => setValue("gender", v as any)}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          {['masculino', 'feminino', 'outro', 'prefiro_nao_dizer'].map(g => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>O que procura?</Label>
                      <Select onValueChange={(v) => setValue("lookingFor", v as any)}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          {['conteudos', 'encontros', 'ambos'].map(o => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>Interesse em Conteúdo</Label>
                      <Select onValueChange={(v) => setValue("contentInterest", v as any)}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Quero comprar conteudo'>Quero comprar conteúdo</SelectItem>
                          <SelectItem value='Quero vender conteudo'>Quero vender conteúdo</SelectItem>
                          <SelectItem value='comprar e vender'>Comprar e vender</SelectItem>
                          <SelectItem value='Nao tenho interesse'>Não tenho interesse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>Localização (Opcional)</Label>
                      <Input {...register("location")} placeholder="Cidade, Estado - País" />
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button type="button" variant="outline" onClick={prevStep}><ChevronLeft /></Button>
                      <Button type="button" className="flex-1" onClick={nextStep}>Continuar</Button>
                    </div>
                  </div>
                </CarouselItem>

                {/* SEÇÃO 3: REDES SOCIAIS */}
                <CarouselItem>
                  <div className="space-y-4 p-1">
                    <div className="flex justify-between items-center">
                      <Label>Redes Sociais (Máx 5)</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={fields.length >= 5}
                        onClick={() => append({ platform: "", url: "", username: "" })}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Adicionar
                      </Button>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
                      {fields.map((field, index) => (
                        <div key={field.id} className="p-3 border rounded-lg relative space-y-2">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                          <Select
                            defaultValue="instagram" // ← Valor por defecto
                            onValueChange={(v) => setValue(`socialLinks.${index}.platform`, v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Plataforma" />
                            </SelectTrigger>
                            <SelectContent>
                              {['instagram', 'twitter', 'facebook', 'tiktok', 'youtube'].map(p => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input {...register(`socialLinks.${index}.url`)} placeholder="https://..." />
                          <Input {...register(`socialLinks.${index}.username`)} placeholder="@usuario (opcional)" />
                        </div>
                      ))}
                      {fields.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-8">Nenhuma rede social adicionada.</p>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button type="button" variant="outline" onClick={prevStep}><ChevronLeft /></Button>
                      <Button type="button" className="flex-1" onClick={nextStep}>Continuar</Button>
                    </div>
                  </div>
                </CarouselItem>

                {/* SEÇÃO 4: BIO E FINALIZAÇÃO */}
                <CarouselItem>
                  <div className="space-y-4 p-1">
                    <div className="grid gap-2">
                      <Label>E-mail</Label>
                      <Input {...register("email")} placeholder="exemplo@email.com" />
                      {errors.email && <span className="text-destructive text-xs">{errors.email.message}</span>}
                    </div>
                    <div className="grid gap-2">
                      <Label>Senha</Label>
                      <Input {...register("password")} type="password" placeholder="••••••••" />
                      {errors.password && <span className="text-destructive text-xs">{errors.password.message}</span>}
                    </div>
                    <div className="grid gap-2">
                      <Label>Confirmar Senha</Label>
                      <Input {...register("passwordConfirm")} type="password" placeholder="••••••••" />
                      {errors.password && <span className="text-destructive text-xs">{errors.password.message}</span>}
                    </div>


                    <div className="flex items-start gap-2 pt-4">
                      <Checkbox
                        id="terms"
                        onCheckedChange={(checked) => setValue("terms", checked === true)}
                      />
                      <Label htmlFor="terms" className="text-xs text-muted-foreground leading-snug cursor-pointer">
                        Confirmo que tenho mais de 18 anos e aceito os{" "}
                        <span className="text-primary underline">Termos</span> e a{" "}
                        <span className="text-primary underline">Política de Privacidade</span>.
                      </Label>
                    </div>

                    <div className="flex gap-2 mt-6">
                      <Button type="button" variant="outline" onClick={prevStep}><ChevronLeft /></Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isLoading || !watch("terms")}
                        onClick={() => {
                          if (!isValid) {
                            toast({
                              variant: "destructive",
                              title: "Formulário incompleto",
                              description: "Existem campos inválidos nos passos anteriores. Verifica as mensagens a vermelho.",
                            });
                          }
                        }}
                      >
                        {isLoading ? "Criando conta..." : "Finalizar Cadastro"}
                      </Button>
                    </div>
                  </div>
                </CarouselItem>

              </CarouselContent>
            </Carousel>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Já tem conta? <Link to="/login" className="text-primary font-medium hover:underline">Entrar</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Plus, Trash2, Camera, ChevronRight, ChevronLeft } from "lucide-react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
import BrandingSection from "@/components/brand/BrandingSection";
import { schema } from "@/utils/index";


type RegisterFormValues = z.infer<typeof schema>;

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [api, setApi] = useState<CarouselApi>();
  const [currentStep, setCurrentStep] = useState(0);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched", // Só valida após o campo ser tocado — evita falsos negativos
    defaultValues: {
      bio: "",
      phone: "",
      location: "",
      role: "creator",
      terms: false,
    },
  });

  const genderValue = watch("gender");
  const lookingForValue = watch("lookingFor");

  const maxBirthDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split("T")[0];
  })();

  // Monitorar progresso do carrossel — CORRIGIDO: useEffect em vez de useState
  useEffect(() => {
    if (!api) return;
    api.on("select", () => setCurrentStep(api.selectedScrollSnap()));
  }, [api]);

  const ErrorMessage = ({ name }: { name: keyof RegisterFormValues }) => {
    const error = errors[name];
    if (!error) return null;
    return (
      <span className="text-destructive text-[10px] font-medium mt-1 animate-in fade-in slide-in-from-top-1">
        {error.message as string}
      </span>
    );
  };


  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("Arquivo muito grande (Máx 5MB)");
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Avança para o próximo passo validando apenas os campos da etapa atual
  const handleNextStep = async (fieldsToValidate: (keyof RegisterFormValues)[]) => {
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      api?.scrollNext();
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.displayName);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("passwordConfirm", data.passwordConfirm);
      formData.append("lookingFor", data.lookingFor);
      formData.append("birthDate", data.birthDate);
      formData.append("bio", data.bio ?? "");
      formData.append("gender", data.gender);
      formData.append("phone", data.phone ?? "");
      formData.append("location", data.location ?? "");
      formData.append("role", data.role);

      if (photo) {
        formData.append("photo", photo);
      }

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

  return (
    <div className="min-h-screen bg-background flex font-body">
        
        <BrandingSection /> 

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
                      <Label className ="mt-2 text-xs text-muted-foreground">Foto de Perfil</Label>
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
                      <Label>Telefone</Label>
                      <Input {...register("phone")} placeholder="+258 ..." />
                      <ErrorMessage name="phone" />
                    </div>

                    <div className="grid gap-2">
                      <Label>Data de Nascimento</Label>
                      <Input {...register("birthDate")} type="date" max={maxBirthDate} />
                      <ErrorMessage name="birthDate" />
                    </div>

                    <Button
                      type="button"
                      className="w-full mt-4"
                      onClick={() => handleNextStep(["displayName", "birthDate"])}
                    >
                      Continuar <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CarouselItem>

                {/* SEÇÃO 2: PREFERÊNCIAS */}
                <CarouselItem>
                  <div className="space-y-4 p-1">
                    <div className="grid gap-2">
                      <Label>Gênero</Label>
                      <Select
                        value={genderValue ?? undefined}
                        onValueChange={(v) =>
                          setValue("gender", v as any, { shouldValidate: true })
                        }
                      >
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          {["masculino", "feminino", "outro"].map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <ErrorMessage name="gender" />
                    </div>

                    <div className="grid gap-2">
                      <Label>O que procura?</Label>
                      <Select
                        value={lookingForValue ?? undefined}
                        onValueChange={(v) =>
                          setValue("lookingFor", v as any, { shouldValidate: true })
                        }
                      >
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          {["conteudos", "encontros", "ambos"].map((o) => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <ErrorMessage name="lookingFor" />
                    </div>


                    <div className="grid gap-2">
                      <Label>Localização (Opcional)</Label>
                      <Input {...register("location")} placeholder="Cidade, Estado - País" />
                      <ErrorMessage name="location" />
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button type="button" variant="outline" onClick={() => api?.scrollPrev()}><ChevronLeft /></Button>
                      <Button
                        type="button"
                        className="flex-1"
                        onClick={() => handleNextStep(["gender", "lookingFor"])}
                      >
                        Continuar
                      </Button>
                    </div>
                  </div>
                </CarouselItem>

                {/* SEÇÃO 4: CREDENCIAIS E FINALIZAÇÃO */}
                <CarouselItem>
                  <div className="space-y-4 p-1">
                    <div className="grid gap-2">
                      <Label>E-mail</Label>
                      <Input {...register("email")} placeholder="exemplo@email.com" />
                      <ErrorMessage name="email" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Senha</Label>
                      <Input {...register("password")} type="password" placeholder="••••••••" />
                      <ErrorMessage name="password" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Confirmar Senha</Label>
                      <Input {...register("passwordConfirm")} type="password" placeholder="••••••••" />
                      <ErrorMessage name="passwordConfirm" />
                    </div>

                    <div className="flex items-start gap-2 pt-4">
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
                      <Label htmlFor="terms" className="text-xs text-muted-foreground leading-snug cursor-pointer">
                        Confirmo que tenho mais de 18 anos e aceito os{" "}
                        <span className="text-primary underline">Termos</span> e a{" "}
                        <span className="text-primary underline">Política de Privacidade</span>.
                      </Label>
                    </div>
                    {errors.terms && (
                      <span className="text-destructive text-[10px]">{errors.terms.message}</span>
                    )}

                    <div className="flex gap-2 mt-6">
                      <Button type="button" variant="outline" onClick={() => api?.scrollPrev()}>
                        <ChevronLeft />
                      </Button>
                   
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isLoading || !watch("terms")}
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
            Já tem conta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
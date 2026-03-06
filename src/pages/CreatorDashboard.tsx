import {
  Shield,
  Crown,
  Lock,
  MessageCircle,
  BarChart3,
  Camera,
  Video,
  UploadCloud,
  Eye,
  EyeOff,
  DollarSign,
  Users,
  Settings2,
  LogOut,
  Smartphone,
  MonitorSmartphone,
  AlertTriangle,
  KeyRound,
  Mail,
  Trash2,
} from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { contentService } from "@/services/contentService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { basicUrl } from "@/utils/index";
import { Controller } from "react-hook-form";

const currentPlan: string = "Standard";

type Content = {
  id: string;
  title: string;
  badge?: string;
  publishedAt: string;
  sales?: number | null;
  revenue: string;
  active: boolean;
};

const CreatorDashboard = () => {
  const showUpgrade = currentPlan !== "VIP";
  const [publicPhotos, setPublicPhotos] = useState<string[]>([]);
  const [privatePhotos, setPrivatePhotos] = useState<string[]>([]);
  const publicInputRef = useRef<HTMLInputElement | null>(null);
  const privateInputRef = useRef<HTMLInputElement | null>(null);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [visibilidade, setVisibilidade] = useState("Exclusivo assinantes");
  const [isAtivo, setIsAtivo] = useState(true);

  const { toast } = useToast();
  const [myContents, setMyContents] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const { user, profile } = useAuth();

  // 2. Função para carregar conteúdos
  const loadContents = async () => {
    try {
      const res = await contentService.getMyContents();
      setMyContents(res.data.data);
    } catch (err) {
      console.error("Erro ao carregar conteúdos", err);
    }
  };

  useEffect(() => {
    loadContents();
  }, []);

  // 3. Função para Upload de novo ficheiro
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', 'Novo Conteúdo'); // Pode adicionar um prompt para o título
    formData.append('type', file.type.startsWith('video') ? 'video' : 'image');

    setIsUploading(true);
    try {
      await contentService.createContent(formData);
      toast({ title: "Sucesso!", description: "Conteúdo carregado com sucesso." });
      loadContents(); // Atualiza a lista
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: err.response?.data?.message || "Erro desconhecido"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 4. Função para Apagar
  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja apagar este conteúdo?")) return;

    try {
      await contentService.deleteContent(id);
      toast({ title: "Apagado", description: "O ficheiro foi removido do servidor." });
      loadContents();
    } catch (err) {
      toast({ variant: "destructive", title: "Erro ao apagar" });
    }
  };

  const handlePublicFiles = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setPublicPhotos((p) => [...p, ...urls]);
  };

  const handlePrivateFiles = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setPrivatePhotos((p) => [...p, ...urls]);
  };

  const [contents, setContents] = useState<Content[]>([
    {
      id: "c1",
      title: "Ensaio noturno · suite de hotel",
      badge: "Exclusivo assinantes",
      publishedAt: "Publicado há 3 dias",
      sales: 184,
      revenue: "MZN 1 759,20",
      active: true,
    },
    {
      id: "c2",
      title: "Vídeo · bastidores sessão fotográfica",
      badge: "Pago individualmente",
      publishedAt: "MZN 19,90 · 18 min",
      sales: 96,
      revenue: "MZN 1 910,40",
      active: true,
    },
    {
      id: "c3",
      title: "Álbum · backstage privado (oculto)",
      badge: "Oculto",
      publishedAt: "—",
      sales: null,
      revenue: "MZN 0,00",
      active: false,
    },
  ]);

  const editContent = (id: string) => {
    const item = contents.find((c) => c.id === id);
    if (!item) return;
    const title = window.prompt("Editar título", item.title);
    if (title != null) {
      setContents((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title } : c)),
      );
    }
  };

  const deleteContent = (id: string) => {
    if (!window.confirm("Tem a certeza que pretende eliminar este conteúdo?"))
      return;
    setContents((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleActive = (id: string) => {
    setContents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
    );
  };

  // Change-password / change-email modal state
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [openChangeEmail, setOpenChangeEmail] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");

  const submitChangePassword = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newPassword) return alert("Insira a nova palavra-passe.");
    if (newPassword !== confirmPassword)
      return alert("As palavras-passe não coincidem.");
    alert("Palavra-passe atualizada com sucesso.");
    setOpenChangePassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const submitChangeEmail = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newEmail) return alert("Insira o novo e-mail.");
    if (newEmail !== confirmEmail) return alert("Os e-mails não coincidem.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newEmail))
      return alert("E-mail inválido.");
    alert("E-mail atualizado. Verifique a caixa de entrada para confirmar.");
    setOpenChangeEmail(false);
    setNewEmail("");
    setConfirmEmail("");
  };

  // Dentro da função handleManualPublish
  const handleManualPublish = async () => {
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('description', descricao);
    formData.append('price', preco);

    // Enviamos o valor que o usuário escolheu no Select
    formData.append('visibility', visibilidade);

    setIsUploading(true);
    try {
      await contentService.createContent(formData);
      toast({ title: "Sucesso!", description: "Conteúdo publicado." });
      loadContents();
    } catch (err) {
      toast({ variant: "destructive", title: "Erro no upload" });
    } finally {
      setIsUploading(false);
    }
  };



  // Filter and pagination for published contents
  const [filterType, setFilterType] = useState<
    "all" | "Publico" | "Exclusivo assinantes" | "Pago individualmente"
  >("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredContents = contents.filter((c) => {
    if (filterType === "all") return true;
    if (filterType === "Exclusivo assinantes")
      return (
        c.badge?.toLowerCase().includes("assinantes") ||
        c.badge?.toLowerCase().includes("assinante")
      );
    if (filterType === "Pago individualmente")
      return (
        c.badge?.toLowerCase().includes("pago") ||
        c.badge?.toLowerCase().includes("Pago individualmente")
      );
    if (filterType === "Publico")
      return (
        !c.badge ||
        (c.badge && !["Oculto", "Pago individualmente"].includes(c.badge))
      );
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredContents.length / pageSize));
  const paginated = filteredContents.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />

          <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
            {/* Top banner + creator summary */}
            <div className="px-4 lg:px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Avatar className="h-11 w-11 border border-primary/40 shadow-[0_0_18px_rgba(251,113,133,0.35)]">
                    {profile && profile.photo ? (
                      <AvatarImage src={`${basicUrl}img/users/${profile.photo}`} alt={user?.name} />
                    ) : (
                      <AvatarFallback className="bg-secondary text-xs text-foreground/80">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    )}

                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-display text-lg font-semibold sm:text-2xl">
                        {user?.name}
                      </h1>
                      <Badge
                        variant="outline"
                        className="border-primary/60 bg-primary/10 px-2 text-[11px] font-semibold uppercase tracking-wide"
                      >
                        <Crown className="mr-1 h-3 w-3 text-[hsl(var(--gold))]" />
                        {currentPlan}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      Dashboard de criador premium · Conteúdos discretos,
                      exclusivos e protegidos
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden text-right text-xs sm:block">
                    <p className="text-muted-foreground">Receita deste mês</p>
                    <p className="font-mono text-sm font-semibold text-emerald-300 sm:text-base">
                      MZN 3 420,90
                    </p>
                  </div>
                  {showUpgrade && (
                    <Button className="btn-gradient px-3 text-xs font-semibold shadow-md sm:px-4 sm:text-sm">
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade para{" "}
                      {currentPlan === "Standard" ? "Premium" : "VIP"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="px-4 lg:px-6 py-4 md:py-6 grid gap-3 sm:grid-cols-3">
              <Card className="border-border bg-card shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Receita acumulada
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-lg font-semibold sm:text-xl">
                    MZN 18 920,40
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-400/80">
                    +12% vs. mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Seguidores
                  </CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-lg font-semibold sm:text-xl">
                    12 438
                  </p>
                  <p className="mt-1 text-[11px] text-primary/80">
                    +320 este mês
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Taxa de conversão
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-rose-300" />
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-lg font-semibold sm:text-xl">
                    4,8%
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Visitantes que se tornam assinantes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs + content */}
            <div className="px-4 pb-24 pt-2 md:pb-6 lg:px-6">
              <Tabs
                defaultValue="conteudos"
                className="flex-1 space-y-4 overflow-hidden"
              >
                <ScrollArea className="w-full overflow-x-auto">
                  <TabsList className="inline-flex whitespace-nowrap rounded-full bg-secondary p-1 text-[11px] sm:text-xs">
                    <TabsTrigger
                      value="perfil"
                      className="flex-1 rounded-full px-2 py-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    >
                      <span className="flex items-center justify-center gap-1">
                        <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        Meu Perfil
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="conteudos"
                      className="flex-1 rounded-full px-2 py-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    >
                      <span className="flex items-center justify-center gap-1">
                        <Camera className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        Meus Conteúdos
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="estatisticas"
                      className="flex-1 rounded-full px-2 py-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    >
                      <span className="flex items-center justify-center gap-1">
                        <BarChart3 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        Estatísticas
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="mensagens"
                      className="flex-1 rounded-full px-2 py-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    >
                      <span className="flex items-center justify-center gap-1">
                        <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        Mensagens
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="configuracoes"
                      className="hidden flex-1 rounded-full px-2 py-1 md:inline-flex data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    >
                      <span className="flex items-center justify-center gap-1">
                        <Settings2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        Configurações
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="seguranca"
                      className="hidden flex-1 rounded-full px-2 py-1 md:inline-flex data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    >
                      <span className="flex items-center justify-center gap-1">
                        <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        Segurança
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </ScrollArea>

                {/* Meus Conteúdos */}
                <TabsContent
                  value="conteudos"
                  className="mt-3 flex-1 space-y-4"
                >
                  <div>
                    <Tabs defaultValue="novo" className="space-y-4">
                      <ScrollArea className="w-full overflow-x-auto">
                        <TabsList className="inline-flex whitespace-nowrap rounded-full bg-secondary p-1 text-[11px] sm:text-xs">
                          <TabsTrigger
                            value="novo"
                            className="flex-1 rounded-full px-3 py-1 data-[state=active]:bg-background data-[state=active]:text-foreground"
                          >
                            Novo Conteúdo
                          </TabsTrigger>
                          <TabsTrigger
                            value="publicados"
                            className="flex-1 rounded-full px-3 py-1 data-[state=active]:bg-background data-[state=active]:text-foreground"
                          >
                            Conteúdos publicados
                          </TabsTrigger>
                        </TabsList>
                      </ScrollArea>

                      <TabsContent value="novo" className="mt-3">
                        {/* New content form */}
                        <Card className="border-border bg-card/40">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <CardTitle className="text-sm font-semibold text-slate-50">
                                  Meus Conteúdos
                                </CardTitle>
                                <p className="mt-1 text-xs text-slate-400">
                                  Publique novos conteúdos exclusivos com
                                  controlo total de privacidade e preço.
                                </p>
                              </div>
                              <Button className="shrink-0 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-rose-500 text-xs font-semibold shadow-[0_0_18px_rgba(168,85,247,0.6)] hover:from-purple-400 hover:via-fuchsia-400 hover:to-rose-400">
                                <UploadCloud className="mr-1.5 h-4 w-4" />
                                Adicionar novo conteúdo
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Upload de Ficheiro */}
                            <div className="space-y-2">
                              <Label className="text-xs text-slate-300">Upload de foto ou vídeo</Label>
                              <div className="flex flex-col gap-3 sm:flex-row">
                                <div className={`flex-1 rounded-xl border border-dashed ${uploadFile ? 'border-emerald-500 bg-emerald-500/10' : 'border-border/60 bg-secondary/60'} px-4 py-6 text-center text-xs text-muted-foreground transition-colors`}>
                                  <div className="mb-2 flex justify-center gap-3">
                                    <Camera className={`h-5 w-5 ${uploadFile?.type.startsWith('image') ? 'text-emerald-400' : 'text-fuchsia-300'}`} />
                                    <Video className={`h-5 w-5 ${uploadFile?.type.startsWith('video') ? 'text-emerald-400' : 'text-purple-300'}`} />
                                  </div>
                                  <p className="font-medium text-foreground">
                                    {uploadFile ? `Selecionado: ${uploadFile.name}` : "Arraste aqui ou clique para fazer upload"}
                                  </p>
                                  <Input
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                    className="mt-3 cursor-pointer border-input bg-background text-[11px] file:mr-3 file:rounded-md file:border-0 file:bg-primary/80 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-primary-foreground hover:file:bg-primary"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Description & Price */}
                            <div className="grid gap-3 grid-cols-1">
                              <div className="space-y-2 w-full">
                                <Label htmlFor="descricao" className="text-xs text-muted-foreground">Descrição</Label>
                                <Textarea
                                  id="descricao"
                                  value={descricao}
                                  onChange={(e) => setDescricao(e.target.value)}
                                  placeholder="Escreva uma descrição discreta e atrativa para o seu conteúdo..."
                                  className="w-full min-h-[90px] resize-none border-input bg-background text-xs placeholder:text-muted-foreground"
                                />
                              </div>

                              <div className="space-y-3 rounded-xl border border-border bg-card/60 p-3 w-full">
                                <div className="space-y-1.5">
                                  <Label htmlFor="preco" className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Preço individual</span>
                                    <span className="text-[11px]">Opcional para conteúdos pagos</span>
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <span className="rounded-md border border-border bg-secondary px-2 py-1 text-[11px]">MZN</span>
                                    <Input
                                      id="preco"
                                      type="number"
                                      value={preco}
                                      onChange={(e) => setPreco(e.target.value)}
                                      placeholder="0.00"
                                      className="w-full border-input bg-background text-xs"
                                    />
                                  </div>
                                </div>

                                <Separator className="border-border/80" />

                                <div className="space-y-1.5">
                                  <Label className="text-xs text-muted-foreground">Visibilidade</Label>
                                  <Select value={visibilidade} onValueChange={setVisibilidade}>
                                    <SelectTrigger className="w-full h-8 border-input bg-background text-xs">
                                      <SelectValue placeholder="Selecione a visibilidade" />
                                    </SelectTrigger>
                                    <SelectContent className="border-border bg-card text-xs">
                                      <SelectItem value="Público">Público</SelectItem>
                                      <SelectItem value="Exclusivo assinantes">Exclusivo assinantes</SelectItem>
                                      <SelectItem value="Pago individualmente">Pago individualmente</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      id="ativo"
                                      checked={isAtivo}
                                      onCheckedChange={setIsAtivo}
                                      className="data-[state=checked]:bg-emerald-500"
                                    />
                                    <Label htmlFor="ativo" className="text-xs text-muted-foreground">Conteúdo ativo</Label>
                                  </div>
                                  <Button
                                    onClick={handleManualPublish} // Função que vamos criar abaixo
                                    disabled={isUploading || !uploadFile}
                                    size="sm"
                                    className="h-8 rounded-full bg-emerald-600 px-3 text-[11px] font-semibold text-emerald-50 hover:bg-emerald-500"
                                  >
                                    {isUploading ? "Publicando..." : "Publicar agora"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="publicados" className="mt-3">
                        {/* Published content grid */}
                        <Card className="border-border bg-card/40">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <CardTitle className="text-sm font-semibold text-slate-50">
                                  Conteúdos publicados
                                </CardTitle>
                                <p className="mt-1 text-xs text-slate-400">
                                  Acompanhe o desempenho dos seus conteúdos e
                                  faça ajustes em tempo real.
                                </p>
                              </div>
                              <Badge className="rounded-full border-emerald-500/60 bg-emerald-500/10 px-2 text-[11px] text-emerald-200">
                                32 ativos
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <Label className="text-xs text-muted-foreground">
                                  Filtrar
                                </Label>
                                <Select
                                  value={filterType}
                                  onValueChange={(v) => {
                                    setFilterType(
                                      v as
                                      | "all"
                                      | "Publico"
                                      | "Exclusivo assinantes"
                                      | "Pago individualmente"
                                      | "hidden",
                                    );
                                    setPage(1);
                                  }}
                                >
                                  <SelectTrigger className="w-44 h-8 border-input bg-background text-xs text-foreground">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="border-border bg-card text-xs text-foreground">
                                    <SelectItem value="all" className="text-xs">
                                      Todos
                                    </SelectItem>
                                    <SelectItem
                                      value="Publico"
                                      className="text-xs"
                                    >
                                      Público
                                    </SelectItem>
                                    <SelectItem
                                      value="Exclusivo assinantes"
                                      className="text-xs"
                                    >
                                      Assinantes
                                    </SelectItem>
                                    <SelectItem value="Pago individualmente" className="text-xs">
                                      Pago individualmente
                                    </SelectItem>
                                    <SelectItem
                                      value="hidden"
                                      className="text-xs"
                                    >
                                      Oculto
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="text-[11px] text-muted-foreground">
                                  Página
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      setPage((p) => Math.max(1, p - 1))
                                    }
                                    className="h-7 w-7"
                                  >
                                    ‹
                                  </Button>
                                  <div className="text-[11px] text-foreground">
                                    {page} / {totalPages}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      setPage((p) =>
                                        Math.min(totalPages, p + 1),
                                      )
                                    }
                                    className="h-7 w-7"
                                  >
                                    ›
                                  </Button>
                                </div>
                                <Select
                                  value={String(pageSize)}
                                  onValueChange={(v) => {
                                    setPageSize(Number(v));
                                    setPage(1);
                                  }}
                                >
                                  <SelectTrigger className="w-20 h-8 border-input bg-background text-xs text-foreground">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="border-border bg-card text-xs text-foreground">
                                    <SelectItem value="5" className="text-xs">
                                      5
                                    </SelectItem>
                                    <SelectItem value="10" className="text-xs">
                                      10
                                    </SelectItem>
                                    <SelectItem value="20" className="text-xs">
                                      20
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <ScrollArea className="h-[260px] rounded-lg border border-border bg-card/30">
                              <Table>
                                <TableHeader className="bg-card/60">
                                  <TableRow className="border-border">
                                    <TableHead className="w-[42%] text-[11px] text-muted-foreground">
                                      Conteúdo
                                    </TableHead>
                                    <TableHead className="w-[12%] text-[11px] text-muted-foreground">
                                      Vendas
                                    </TableHead>
                                    <TableHead className="w-[18%] text-[11px] text-muted-foreground">
                                      Receita
                                    </TableHead>
                                    <TableHead className="w-[16%] text-[11px] text-muted-foreground">
                                      Status
                                    </TableHead>
                                    <TableHead className="w-[24%] text-[11px] text-right text-muted-foreground">
                                      Ações
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {/* Substituímos 'paginated' pelo seu estado real, ex: myContents */}
                                  {myContents.map((c: any) => (
                                    <TableRow
                                      key={c._id}
                                      className="border-border/60 bg-card/30 hover:bg-card/60"
                                    >
                                      <TableCell className="align-top">
                                        <div className="flex items-center gap-3">
                                          {/* Renderização da Miniatura Real */}
                                          <div className="h-11 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                                            {c.type === 'video' ? (
                                              <video
                                                src={`http://localhost:9000/img/contents/${c.url}`}
                                                className="h-full w-full object-cover"
                                              />
                                            ) : (
                                              <img
                                                src={`http://localhost:9000/img/contents/${c.url}`}
                                                className="h-full w-full object-cover"
                                                alt={c.type}
                                              />
                                            )}
                                          </div>
                                          <div className="space-y-0.5">
                                            <p className="line-clamp-1 text-xs font-medium text-foreground">
                                              {c.description || "Sem título"}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                              <Badge className="border-fuchsia-500/60 bg-fuchsia-500/10 px-1.5 text-[10px]">
                                                {c.type}
                                              </Badge>
                                              <span className="text-[10px] text-muted-foreground">
                                                {new Date(c.createdAt).toLocaleDateString('pt-PT')}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </TableCell>

                                      {/* Vendas e Receita (Vindo do Model se tiver esses campos, senão 0) */}
                                      <TableCell className="align-top text-xs text-foreground/90">
                                        {c.salesCount || 0}
                                      </TableCell>
                                      <TableCell className="align-top text-xs font-mono text-emerald-300">
                                        {c.price ? `${c.price} MT` : "Grátis"}
                                      </TableCell>

                                      <TableCell className="align-top">
                                        <div className="flex items-center gap-1.5">
                                          <span
                                            className={`h-2 w-2 rounded-full ${c.active !== false
                                              ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                                              : "bg-muted-foreground/60"
                                              }`}
                                          />
                                          <span className={`text-[11px] ${c.active !== false ? "text-emerald-200" : "text-muted-foreground"}`}>
                                            {c.active !== false ? "Ativo" : "Inativo"}
                                          </span>
                                        </div>
                                      </TableCell>

                                      <TableCell className="align-top">
                                        <div className="flex justify-end gap-1.5">
                                          {/* Editar (A implementar) */}
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded-full border border-border bg-card/60 text-muted-foreground hover:bg-card"
                                          >
                                            <Settings2 className="h-3.5 w-3.5" />
                                          </Button>

                                          {/* Toggle Visibilidade (Exemplo) */}
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded-full border border-border bg-card/60 text-emerald-200"
                                          >
                                            <Eye className="h-3.5 w-3.5" />
                                          </Button>

                                          {/* Botão APAGAR Real conectado à sua função handleDelete */}
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(c._id)}
                                            className="h-7 w-7 rounded-full border border-border bg-card/60 text-rose-300 hover:bg-rose-500/10 hover:text-rose-100"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </ScrollArea>
                            <p className="text-[11px] text-muted-foreground">
                              Os detalhes de vendas são apresentados apenas a
                              si. Nenhuma informação explícita é exibida em
                              notificações ou e-mails.
                            </p>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>

                {/* Meu Perfil */}
                <TabsContent value="perfil" className="mt-3 space-y-4">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)]">
                    <Card className="border-border bg-card/40">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-foreground">
                          Meu Perfil
                        </CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Ajuste a forma como é apresentado. Mantemos tudo
                          discreto, profissional e sob o seu controlo.
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="bio"
                            className="text-xs text-muted-foreground"
                          >
                            Bio
                          </Label>
                          <Textarea
                            id="bio"
                            placeholder="Escreva uma bio elegante, sugerindo o tipo de conteúdo que cria sem detalhes explícitos..."
                            className="min-h-[110px] resize-none border-input bg-background text-xs placeholder:text-muted-foreground"
                          />
                          <p className="text-[11px] text-muted-foreground">
                            Evite termos explícitos. A plataforma sugere
                            descrições discretas e sofisticadas.
                          </p>
                        </div>

                        <Separator className="border-border/80" />

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">
                              Preferências
                            </Label>
                            <div className="flex flex-wrap gap-1.5">
                              <Badge className="cursor-pointer rounded-full border-fuchsia-500/70 bg-fuchsia-500/10 px-2 text-[11px] text-fuchsia-100 hover:bg-fuchsia-500/20">
                                Lifestyle premium
                              </Badge>
                              <Badge className="cursor-pointer rounded-full border-purple-500/70 bg-purple-500/10 px-2 text-[11px] text-purple-100 hover:bg-purple-500/20">
                                Conteúdo discreto
                              </Badge>
                              <Badge className="cursor-pointer rounded-full border-rose-500/70 bg-rose-500/10 px-2 text-[11px] text-rose-100 hover:bg-rose-500/20">
                                Conteúdos exclusivos
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Estes interesses ajudam o algoritmo a sugerir o
                              público ideal.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">
                              Disponibilidade
                            </Label>
                            <div className="space-y-2 rounded-xl border border-border bg-card/60 p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-muted-foreground">
                                  Mostrar como disponível
                                </span>
                                <Switch
                                  defaultChecked
                                  className="data-[state=checked]:bg-emerald-500"
                                />
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                Controla se o seu perfil aparece como ativo para
                                novos seguidores.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border bg-card/40">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-foreground">
                          Fotos públicas e privadas
                        </CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Separe conteúdos de apresentação (públicos) de
                          conteúdos reservados para assinantes.
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-foreground">
                              Fotos públicas
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => publicInputRef.current?.click()}
                              className="h-7 rounded-full border-border bg-card/60 px-2 text-[11px] text-foreground hover:bg-card"
                            >
                              <UploadCloud className="mr-1.5 h-3.5 w-3.5" />
                              Atualizar
                            </Button>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="h-16 rounded-lg border border-border bg-gradient-to-br from-background via-background to-black" />
                            <div className="h-16 rounded-lg border border-border bg-gradient-to-br from-fuchsia-900 via-background to-black" />
                            <div className="h-16 rounded-lg border border-border bg-gradient-to-br from-purple-900 via-background to-black" />
                            {publicPhotos.map((src, i) => (
                              <div
                                key={src + i}
                                className="h-16 overflow-hidden rounded-lg border border-border bg-black"
                              >
                                <img
                                  src={src}
                                  alt={`public-${i}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => publicInputRef.current?.click()}
                              className="flex h-16 items-center justify-center rounded-lg border border-dashed border-border/70 text-[11px] text-muted-foreground"
                            >
                              + adicionar
                            </button>
                          </div>
                          <input
                            ref={publicInputRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              handlePublicFiles(e.target.files);
                              e.currentTarget.value = "";
                            }}
                          />
                        </div>

                        <Separator className="border-border/80" />

                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-foreground">
                              Fotos privadas
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 rounded-full border-rose-500/60 bg-rose-500/5 px-2 text-[11px] text-rose-100 hover:bg-rose-500/15"
                            >
                              <Lock className="mr-1.5 h-3.5 w-3.5" />
                              Gerir privadas
                            </Button>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="relative h-16 overflow-hidden rounded-lg border border-rose-500/60 bg-gradient-to-br from-rose-900 via-background to-black">
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <Lock className="absolute bottom-1 right-1 h-3.5 w-3.5 text-rose-200" />
                            </div>
                            <div className="relative h-16 overflow-hidden rounded-lg border border-rose-500/40 bg-gradient-to-br from-purple-900 via-background to-black">
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <Lock className="absolute bottom-1 right-1 h-3.5 w-3.5 text-rose-200" />
                            </div>
                            {privatePhotos.map((src, i) => (
                              <div
                                key={src + i}
                                className="h-16 overflow-hidden rounded-lg border border-rose-500/40 bg-black"
                              >
                                <img
                                  src={src}
                                  alt={`private-${i}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => privateInputRef.current?.click()}
                              className="flex h-16 items-center justify-center rounded-lg border border-dashed border-border/70 text-[11px] text-muted-foreground"
                            >
                              + adicionar
                            </button>
                          </div>
                          <input
                            ref={privateInputRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              handlePrivateFiles(e.target.files);
                              e.currentTarget.value = "";
                            }}
                          />
                          <p className="text-[11px] text-muted-foreground">
                            As fotos privadas nunca são exibidas fora desta área
                            e só podem ser vistas por quem autorizar.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Estatísticas */}
                <TabsContent value="estatisticas" className="mt-3 space-y-4">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.4fr)]">
                    <Card className="border-border bg-card/40">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-foreground">
                          Visão geral
                        </CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Acompanhe o desempenho do seu perfil de forma clara,
                          sem elementos explícitos.
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-4">
                          <div className="space-y-1 rounded-xl border border-border bg-card/60 p-3">
                            <p className="text-[11px] text-muted-foreground">
                              Visualizações totais
                            </p>
                            <p className="font-mono text-base font-semibold text-foreground sm:text-lg">
                              284 932
                            </p>
                          </div>
                          <div className="space-y-1 rounded-xl border border-border bg-card/60 p-3">
                            <p className="text-[11px] text-muted-foreground">
                              Total de vendas
                            </p>
                            <p className="font-mono text-base font-semibold text-foreground sm:text-lg">
                              7 842
                            </p>
                          </div>
                          <div className="space-y-1 rounded-xl border border-border bg-card/60 p-3">
                            <p className="text-[11px] text-muted-foreground">
                              Receita mensal
                            </p>
                            <p className="font-mono text-base font-semibold text-emerald-300 sm:text-lg">
                              MZN 3 420,90
                            </p>
                          </div>
                          <div className="space-y-1 rounded-xl border border-border bg-card/60 p-3">
                            <p className="text-[11px] text-muted-foreground">
                              Receita acumulada
                            </p>
                            <p className="font-mono text-base font-semibold text-emerald-200 sm:text-lg">
                              MZN 18 920,40
                            </p>
                          </div>
                        </div>

                        <Separator className="border-border/80" />

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-foreground">
                              Últimos 30 dias
                            </p>
                            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-200">
                              +18% crescimento
                            </span>
                          </div>
                          {/* Simple bar-like visualization */}
                          <div className="flex gap-1.5 rounded-xl border border-border bg-card/60 p-3">
                            {Array.from({ length: 16 }).map((_, i) => (
                              <div
                                key={i}
                                className="flex-1 rounded-full bg-gradient-to-t from-fuchsia-700 via-purple-500 to-emerald-300"
                                style={{
                                  height: `${20 + (i % 7) * 6}px`,
                                  opacity: 0.45 + (i % 5) * 0.08,
                                }}
                              />
                            ))}
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                            <span>
                              Distribuição combinada de visualizações, vendas e
                              novos seguidores.
                            </span>
                            <span>
                              As informações são anónimas e consolidadas.
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border bg-card/40">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-foreground">
                          Seguidores e favoritos
                        </CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Compreenda a sua base de fãs sem expor dados
                          sensíveis.
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 rounded-xl border border-border bg-card/60 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Seguidores
                            </span>
                            <span className="font-mono text-sm text-foreground">
                              12 438
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Favoritos
                            </span>
                            <span className="font-mono text-sm text-foreground">
                              4 291
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Novos este mês
                            </span>
                            <span className="font-mono text-sm text-emerald-300">
                              +320
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3 rounded-xl border border-border bg-card/60 p-3">
                          <p className="text-xs font-medium text-foreground">
                            Canais mais fortes
                          </p>
                          <div className="space-y-1.5 text-[11px] text-muted-foreground">
                            <div className="flex items-center justify-between">
                              <span>Conteúdos exclusivos para assinantes</span>
                              <span className="font-mono text-emerald-300">
                                56%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Conteúdos pagos individualmente</span>
                              <span className="font-mono text-fuchsia-300">
                                29%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Conteúdos públicos</span>
                              <span className="font-mono text-slate-300">
                                15%
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Mensagens */}
                <TabsContent value="mensagens" className="mt-3 space-y-4">
                  <Card className="border-border bg-card/40">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm text-foreground">
                        <MessageCircle className="h-4 w-4 text-fuchsia-300" />
                        Mensagens e pedidos
                      </CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Central discreta para gerir conversas com assinantes e
                        fãs.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Caixas
                          </Label>
                          <div className="flex flex-wrap gap-1.5 text-[11px]">
                            <Badge className="cursor-pointer rounded-full border-fuchsia-500/60 bg-fuchsia-500/10 px-2 text-fuchsia-100">
                              Assinantes (12)
                            </Badge>
                            <Badge className="cursor-pointer rounded-full border-purple-500/60 bg-purple-500/10 px-2 text-purple-100">
                              Novas conexões (4)
                            </Badge>
                            <Badge className="cursor-pointer rounded-full border-border bg-secondary px-2 text-foreground">
                              Arquivadas
                            </Badge>
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Status
                          </Label>
                          <div className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-3 py-2">
                            <span className="text-[11px] text-muted-foreground">
                              Responder automaticamente fora de horas
                            </span>
                            <Switch
                              defaultChecked
                              className="data-[state=checked]:bg-purple-600"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator className="border-border/80" />

                      <div className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)]">
                        <ScrollArea className="h-[260px] rounded-xl border border-border bg-card/60">
                          <div className="divide-y divide-border/60">
                            {[
                              {
                                name: "Miguel",
                                badge: "Assinante VIP",
                                preview:
                                  "Adorei o último conteúdo, pensa em fazer algo semelhante em breve?",
                                time: "há 12 min",
                              },
                              {
                                name: "Clara",
                                badge: "Nova assinatura",
                                preview:
                                  "Obrigada por manter tudo tão discreto, é exatamente o que procurava.",
                                time: "há 1 h",
                              },
                              {
                                name: "João",
                                badge: "Pago individualmente recente",
                                preview:
                                  "O vídeo de bastidores ficou incrível. Valeu cada euro.",
                                time: "há 3 h",
                              },
                            ].map((m) => (
                              <button
                                key={m.name}
                                className="flex w-full items-start gap-3 px-3 py-3 text-left hover:bg-secondary/70"
                              >
                                <Avatar className="mt-0.5 h-7 w-7 border border-border">
                                  <AvatarFallback className="bg-background text-[10px] text-foreground">
                                    {m.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-medium text-foreground">
                                        {m.name}
                                      </p>
                                      <Badge className="rounded-full border-emerald-500/50 bg-emerald-500/10 px-1.5 text-[10px] text-emerald-200">
                                        {m.badge}
                                      </Badge>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">
                                      {m.time}
                                    </span>
                                  </div>
                                  <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                                    {m.preview}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </ScrollArea>

                        <div className="space-y-3 rounded-xl border border-border bg-card/60 p-3">
                          <p className="text-xs font-medium text-foreground">
                            Resposta rápida
                          </p>
                          <Textarea
                            placeholder="Escreva uma resposta breve e cordial. Pode salvar como modelo para reutilizar com outros assinantes."
                            className="min-h-[120px] resize-none border-input bg-background text-xs placeholder:text-muted-foreground"
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                              <span className="h-2 w-2 rounded-full bg-emerald-400" />
                              <span>
                                Mensagens sempre enviadas de forma anónima e
                                segura.
                              </span>
                            </div>
                            <Button className="h-8 rounded-full bg-fuchsia-600 px-3 text-[11px] font-semibold text-slate-50 hover:bg-fuchsia-500">
                              Enviar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Configurações */}
                <TabsContent value="configuracoes" className="mt-3 space-y-4">
                  <Card className="border-border bg-card/40">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-foreground">
                        Configurações
                      </CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Organize a forma como a sua conta funciona, sem alterar
                        as definições de segurança.
                      </p>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2 rounded-xl border border-border bg-card/60 p-3">
                        <p className="text-xs font-medium text-foreground">
                          Notificações
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Defina como e quando pretende receber alertas sobre
                          vendas, mensagens e novos seguidores.
                        </p>
                        <div className="mt-1 space-y-1.5 text-[11px] text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span>Resumo diário por e-mail (discreto)</span>
                            <Switch
                              defaultChecked
                              className="data-[state=checked]:bg-purple-600"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Notificações push na app</span>
                            <Switch
                              defaultChecked
                              className="data-[state=checked]:bg-purple-600"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 rounded-xl border border-border bg-card/60 p-3">
                        <p className="text-xs font-medium text-foreground">
                          Experiência
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Ajuste o visual da interface. Todas as opções mantêm o
                          tema escuro sofisticado.
                        </p>
                        <div className="mt-1 space-y-1.5 text-[11px] text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span>Modo compacto (mobile)</span>
                            <Switch className="data-[state=checked]:bg-purple-600" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Exibir detalhes financeiros completos</span>
                            <Switch
                              defaultChecked
                              className="data-[state=checked]:bg-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Segurança */}
                <TabsContent value="seguranca" className="mt-3 space-y-4">
                  <Card className="border-border bg-card/40">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm text-foreground">
                        <Shield className="h-4 w-4 text-emerald-300" />
                        Segurança da conta
                      </CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Controle total sobre o acesso à sua conta. Pensado para
                        máxima privacidade em ambientes sensíveis.
                      </p>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="space-y-2 rounded-xl border border-border bg-card/60 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="flex items-center gap-1 text-xs font-medium text-foreground">
                                <KeyRound className="h-3.5 w-3.5 text-foreground" />
                                Alterar palavra-passe
                              </p>
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                Recomendamos alterar a palavra-passe a cada 90
                                dias.
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setOpenChangePassword(true)}
                              className="h-7 rounded-full border-border bg-card/60 px-2 text-[11px] text-foreground hover:bg-card"
                            >
                              Gerir
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 rounded-xl border border-border bg-card/60 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="flex items-center gap-1 text-xs font-medium text-foreground">
                                <Mail className="h-3.5 w-3.5 text-foreground" />
                                Alterar e-mail
                              </p>
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                Use um e-mail discreto, sem referências diretas
                                a conteúdos adultos.
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setOpenChangeEmail(true)}
                              className="h-7 rounded-full border-border bg-card/60 px-2 text-[11px] text-foreground hover:bg-card"
                            >
                              Atualizar
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 rounded-xl border border-border bg-card/60 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="flex items-center gap-1 text-xs font-medium text-foreground">
                                <Lock className="h-3.5 w-3.5 text-emerald-300" />
                                Verificação em dois fatores
                              </p>
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                Adicione uma camada extra de proteção, ideal se
                                usa dispositivos partilhados.
                              </p>
                            </div>
                            <Switch
                              defaultChecked
                              className="data-[state=checked]:bg-emerald-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-2 rounded-xl border border-border bg-card/60 p-3">
                          <p className="text-xs font-medium text-foreground">
                            Dispositivos conectados
                          </p>
                          <div className="space-y-1.5 text-[11px] text-muted-foreground">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Smartphone className="h-3.5 w-3.5 text-foreground" />
                                <span>iPhone · Lisboa</span>
                              </div>
                              <span className="text-muted-foreground">
                                Ativo
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MonitorSmartphone className="h-3.5 w-3.5 text-foreground" />
                                <span>Desktop · Porto</span>
                              </div>
                              <Button
                                variant="link"
                                className="h-auto px-0 text-[11px] text-rose-300"
                              >
                                Terminar sessão
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 rounded-xl border border-rose-900/80 bg-gradient-to-br from-rose-950 via-background to-black p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="flex items-center gap-1 text-xs font-semibold text-rose-100">
                                <AlertTriangle className="h-3.5 w-3.5 text-rose-300" />
                                Encerrar conta
                              </p>
                              <p className="mt-1 text-[11px] text-rose-100/80">
                                Esta ação é sensível. Os seus dados serão
                                removidos de forma gradual e irreversível.
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 rounded-full border-rose-600 bg-rose-600/10 px-2 text-[11px] text-rose-100 hover:bg-rose-600/20"
                            >
                              Iniciar processo
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>

          {/* Change-password modal */}
          <Dialog
            open={openChangePassword}
            onOpenChange={setOpenChangePassword}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Alterar palavra-passe</DialogTitle>
                <DialogDescription>
                  Atualize a sua palavra-passe de forma segura.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitChangePassword();
                }}
                className="grid gap-3"
              >
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Palavra-passe atual
                  </Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Nova palavra-passe
                  </Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Confirmar nova palavra-passe
                  </Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setOpenChangePassword(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Guardar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Change-email modal */}
          <Dialog open={openChangeEmail} onOpenChange={setOpenChangeEmail}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Alterar e-mail</DialogTitle>
                <DialogDescription>
                  Atualize o e-mail associado à sua conta.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitChangeEmail();
                }}
                className="grid gap-3"
              >
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Novo e-mail
                  </Label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Confirmar e-mail
                  </Label>
                  <Input
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setOpenChangeEmail(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Atualizar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CreatorDashboard;

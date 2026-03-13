import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import PublishContentModal from "@/components/profile/PublishContentModal";
import EditContentModal, { type ContentItem } from "@/components/profile/EditContentModal";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
    Camera,
    Edit3,
    Trash2,
    Settings,
    ShieldCheck,
    MapPin,
    Calendar,
    Phone,
    User,
    Heart,
    Eye,
    EyeOff,
    Plus,
    ExternalLink,
    BarChart3,
    DollarSign,
    TrendingUp,
    MousePointerClick,
    Lock,
    Mail,
    AlertTriangle,
    X,
    Save,
    Loader2,
    Play,
    Image as ImageIcon,
    Crown,
    Globe,
    Users,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { basicUrl } from "@/utils/index";
import { profileService } from "@/services/profileService";
import { userService } from "@/services/userService";
import { contentService } from "@/services/contentService";
import { analyticsService } from "@/services/analyticsService";

const mockAnalytics = {
    totalViews: 22130,
    totalClicks: 4520,
    conversions: 500,
    revenue: 3245.5,
    dailyData: [
        { day: "Seg", views: 320, revenue: 45 },
        { day: "Ter", views: 450, revenue: 78 },
        { day: "Qua", views: 380, revenue: 56 },
        { day: "Qui", views: 520, revenue: 92 },
        { day: "Sex", views: 680, revenue: 134 },
        { day: "Sáb", views: 890, revenue: 189 },
        { day: "Dom", views: 760, revenue: 156 },
    ],
};


// Move this OUTSIDE and ABOVE your component function, at the top of the file
export const visibilityLabels: Record<string, { label: string; color: string; icon: JSX.Element }> = {
    "Público": { label: "Público", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: <Globe className="h-3 w-3" /> },
    "Exclusivo assinantes": { label: "Exclusivo", color: "bg-primary/20 text-primary border-primary/30", icon: <Crown className="h-3 w-3" /> },
    "Pago individualmente": { label: "Pago", color: "bg-gold/20 text-gold border-gold/30", icon: <DollarSign className="h-3 w-3" /> },
};
const ProfilePage = () => {

    const { user, profile, setProfile, setUser, calculateAge } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [editData, setEditData] = useState({ ...profile, name: user?.name || "" });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
    const [showEditContentModal, setShowEditContentModal] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [contents, setContents] = useState<any[]>([]);
    const [showDeleteContentModal, setShowDeleteContentModal] = useState(false);
    const [contentToDelete, setContentToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Estados de Paginação
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingContents, setLoadingContents] = useState(false);
    
    const [creatorStats, setCreatorStats] = useState({
        totalSubscribers: 0,
        dailyData: mockAnalytics.dailyData
    });

    //  Carregar conteúdos e estatísticas ao iniciar
    useEffect(() => {
        const fetchMyData = async () => {
            setLoadingContents(true);
            try {
                const res = await contentService.getMyContents(page, 6); // Limite de 6 por carregamento
                const fetchedContents = res.data.data;
                
                setContents(prev => page === 1 ? fetchedContents : [...prev, ...fetchedContents]);
                setHasMore(fetchedContents.length === 6);
            } catch (err) {
                console.error("Erro ao carregar conteúdos", err);
            } finally {
                setLoadingContents(false);
            }

            // Apenas puxar as stats na montagem inicial (página 1) para não recarregar no Load More
            if (user?.role === 'creator' && page === 1) {
                try {
                    const statsRes = await analyticsService.getCreatorStats();
                    setCreatorStats({
                        totalSubscribers: statsRes.data.totalSubscribers,
                        dailyData: statsRes.data.dailyData
                    });
                } catch (err) {
                    console.error("Erro ao carregar estatísticas do criador", err);
                }
            }
        };
        if (user) fetchMyData();
    }, [user, page]);

    useEffect(() => {
        // 1. Verificamos se o perfil e o user já foram carregados pelo AuthContext
        if (profile || user) {
            // 2. Sincronizamos o estado local de edição com os dados reais do banco
            setEditData({
                name: user?.name || "",
                bio: profile?.bio || "",
                location: profile?.location || "",
                phone: profile?.phone || "",
                gender: profile?.gender || "",
                birthDate: profile?.birthDate || "",
                lookingFor: profile?.lookingFor || "",
                contentInterest: profile?.contentInterest || "",

            });
        }
    }, [profile, user]); // O efeito corre sempre que o profile ou user mudarem

    // --- Estatísticas Dinâmicas do Criador ---
    const totalContentViews = contents.reduce((acc, content) => acc + (content.views || 0), 0);
    const totalContentSales = contents.reduce((acc, content) => acc + (content.sales || 0), 0);
    const totalContentRevenue = contents.reduce((acc, content) => acc + ((content.sales || 0) * (content.price || 0)), 0);


    // No Profile.tsx, logo abaixo do useAuth
    const isCreator = user?.role === 'creator';

    // Se não for criador e não houver perfil, não mostramos o loading infinito
    if (isLoading || (isCreator && !profile && user)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    // Profile.tsx

    // Adicione a verificação se o user existe explicitamente aqui
    if (isLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }



    const age = profile?.birthDate ? calculateAge(profile.birthDate) : null;

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const { name, ...profileData } = editData;

            // 1. Atualiza Nome/Email no User (Backend: updateMe)
            const userRes = await userService.updateMe({ name });
            setUser(userRes.data.user);
            localStorage.setItem('user', JSON.stringify(userRes.data.user));

            // 2. Atualiza Bio/Localização no Profile (Backend: editProfile)
            const profileRes = await profileService.updateProfile(user._id, profileData);
            setProfile(profileRes.data.profile || profileRes.data);

            setIsEditing(false);
            toast({ title: "Perfil atualizado com sucesso!" });
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Erro ao salvar",
                description: err.response?.data?.message || "Erro de conexão"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDelete = (content: any) => {
        setContentToDelete(content);
        setShowDeleteContentModal(true);
    };

    const handleCancelEdit = () => {
        setEditData({ ...profile, name: user?.name ?? "" });
        setIsEditing(false);
    };


    const handleDeleteContent = async () => {
        if (!contentToDelete) return;

        setIsDeleting(true);
        try {
            // Chamada real à API
            await contentService.deleteContent(contentToDelete._id);

            // Remove do estado local para atualizar a lista sem refresh
            setContents(contents.filter((c) => c._id !== contentToDelete._id));

            toast({ title: "Conteúdo excluído com sucesso" });
            setShowDeleteContentModal(false);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao excluir",
                description: error.response?.data?.message || "Não foi possível remover o conteúdo."
            });
        } finally {
            setIsDeleting(false);
            setContentToDelete(null);
        }
    };

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 px-4 py-6">
            {/* 1. Profile Header */}
            <motion.div {...fadeIn}>
                <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
                    {/* Cover */}
                    <div className="h-32 sm:h-44 bg-gradient-to-r from-primary/30 via-primary/10 to-card relative">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&h=400&fit=crop')] bg-cover bg-center opacity-20" />
                    </div>
                    <CardContent className="relative px-4 sm:px-6 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-14">
                            {/* Avatar */}
                            <div className="relative group">
                                <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-card shadow-2xl">
                                    {profile && profile.photo ? (
                                        <AvatarImage src={`${basicUrl}img/users/${profile.photo}`} alt={user?.name} />
                                    ) : (
                                        <AvatarFallback className="text-3xl bg-primary/20 text-primary">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                    )}
                                </Avatar>
                                <button className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="font-display text-2xl sm:text-3xl font-bold truncate">{user.name}</h1>
                                    {user.isVerified && (
                                        <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                                    )}
                                </div>
                                {user.role === "creator" && (
                                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {age} anos</span>
                                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.location}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge className={user.role === "creator" ? "bg-primary/20 text-primary border-primary/30" : "bg-secondary text-secondary-foreground"}>
                                        {user.role === "creator" ? "Criador" : user.role === "admin" ? "Admin" : "Usuário"}
                                    </Badge>
                                    {user.isVerified && (
                                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Verificado</Badge>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            {user.role === "creator" && (
                                <div className="flex flex-wrap gap-2 sm:self-center">
                                    <Button size="sm" onClick={() => { setIsEditing(true); setEditData({ ...profile, name: user?.name ?? "" }); }} className="gap-1.5">
                                        <Edit3 className="h-3.5 w-3.5" /> Editar
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* 2. Profile Info */}
            {user.role === "creator" && (
                <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
                    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle className="text-lg font-display">Informações do Perfil</CardTitle>
                            {!isEditing && (
                                <Button size="sm" variant="ghost" onClick={() => {
                                    setIsEditing(true);
                                    setEditData({ ...profile, name: user?.name ?? "" });
                                }}>
                                    <Edit3 className="h-4 w-4" />
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <AnimatePresence mode="wait">
                                {isEditing ? (
                                    <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-muted-foreground font-medium">Nome</label>
                                                <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-muted-foreground font-medium">Data de Nascimento</label>
                                                <Input type="date" value={editData.birthDate} onChange={(e) => setEditData({ ...editData, birthDate: e.target.value })} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-muted-foreground font-medium">Gênero</label>
                                                <Input value={editData.gender} onChange={(e) => setEditData({ ...editData, gender: e.target.value })} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-muted-foreground font-medium">Localização</label>
                                                <Input value={editData.location} onChange={(e) => setEditData({ ...editData, location: e.target.value })} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-muted-foreground font-medium">Telefone</label>
                                                <Input value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-muted-foreground font-medium">O que procura</label>
                                                <Input value={editData.lookingFor} onChange={(e) => setEditData({ ...editData, lookingFor: e.target.value })} />
                                            </div>
                                            <div className="space-y-1.5 sm:col-span-2">
                                                <label className="text-xs text-muted-foreground font-medium">Interesse em Conteúdo</label>
                                                <Input value={editData.contentInterest} onChange={(e) => setEditData({ ...editData, contentInterest: e.target.value })} />
                                            </div>
                                            <div className="space-y-1.5 sm:col-span-2">
                                                <label className="text-xs text-muted-foreground font-medium">Bio</label>
                                                <Textarea value={editData.bio} onChange={(e) => setEditData({ ...editData, bio: e.target.value })} rows={3} />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end pt-2">
                                            <Button variant="outline" size="sm" onClick={handleCancelEdit}><X className="h-4 w-4 mr-1" /> Cancelar</Button>
                                            <Button size="sm" onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Salvar</Button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                            {[
                                                { icon: <Calendar className="h-4 w-4 text-primary" />, label: "Nascimento", value: new Date(profile.birthDate).toLocaleDateString("pt-PT") },
                                                { icon: <User className="h-4 w-4 text-primary" />, label: "Idade", value: `${age} anos` },
                                                { icon: <User className="h-4 w-4 text-primary" />, label: "Gênero", value: profile.gender },
                                                { icon: <MapPin className="h-4 w-4 text-primary" />, label: "Localização", value: profile.location },
                                                { icon: <Heart className="h-4 w-4 text-primary" />, label: "Procura", value: profile.lookingFor },
                                                { icon: <Eye className="h-4 w-4 text-primary" />, label: "Interesses", value: profile.contentInterest },
                                                { icon: <Phone className="h-4 w-4 text-primary" />, label: "Telefone", value: profile.phone },
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <div className="mt-0.5 shrink-0">{item.icon}</div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">{item.label}</p>
                                                        <p className="text-sm font-medium">{item.value}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Separator className="my-4" />
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Bio</p>
                                            <p className="text-sm leading-relaxed">{profile.bio}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* 4. Content Grid (Creator only) */}
            {user.role === "creator" && (
                <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
                    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle className="text-lg font-display">Conteúdos Publicados</CardTitle>
                            <Button size="sm" className="gap-1.5" onClick={() => setShowPublishModal(true)}>
                                <Plus className="h-3.5 w-3.5" /> Publicar
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {contents.map((content) => {
                                    const vis = visibilityLabels[content.visibility as keyof typeof visibilityLabels] ?? visibilityLabels["Público"];
                                    console.log("visibility value:", JSON.stringify(content.visibility));
                                    return (
                                        <div key={content._id} className="group relative rounded-lg overflow-hidden bg-secondary/50 aspect-square">
                                            {content.type === "video" ? (
                                                <video
                                                    src={`${basicUrl}img/contents/${content.url}`}
                                                    className="h-full w-full object-cover"
                                                    preload="metadata"
                                                    muted
                                                    loop
                                                    autoPlay
                                                    playsInline
                                                />
                                            ) : (
                                                <img
                                                    src={`${basicUrl}img/contents/${content.url}`}
                                                    alt={content.description}
                                                    className="h-full w-full object-cover"
                                                />
                                            )}
                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                                <p className="text-xs font-medium text-white truncate">{content.description}</p>
                                                <div className="flex items-center gap-2 mt-1 text-[10px] text-white/70">
                                                    <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" /> {content.views}</span>
                                                    <span className="flex items-center gap-0.5"><DollarSign className="h-3 w-3" /> {content.sales}</span>
                                                </div>
                                                <div className="flex gap-1 mt-2">
                                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-white hover:bg-white/20" onClick={() => { setEditingContent(content); setShowEditContentModal(true); }}>
                                                        <Edit3 className="h-3 w-3" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-white hover:bg-white/20">
                                                        <EyeOff className="h-3 w-3" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive hover:bg-white/20" onClick={() => confirmDelete(content)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {/* Type badge */}
                                            <div className="absolute top-2 left-2">
                                                {content.type === "video" ? (
                                                    <div className="h-6 w-6 rounded-full bg-black/60 flex items-center justify-center">
                                                        <Play className="h-3 w-3 text-white fill-white" />
                                                    </div>
                                                ) : (
                                                    <div className="h-6 w-6 rounded-full bg-black/60 flex items-center justify-center">
                                                        <ImageIcon className="h-3 w-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            {/* Visibility badge */}
                                            <div className="absolute top-2 right-2">
                                                <Badge className={`${vis.color} text-[10px] px-1.5 py-0 h-5 gap-0.5`}>
                                                    {vis.icon} {vis.label}
                                                </Badge>
                                            </div>
                                            {/* Price */}
                                            {content.price > 0 && (
                                                <div className="absolute bottom-2 right-2 bg-black/70 rounded-md px-2 py-0.5 text-xs font-semibold text-gold group-hover:opacity-0 transition-opacity">
                                                    {content.price} MZN
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Paginação Estilo Load More */}
                            {contents.length > 0 && (
                                <div className="mt-8 flex justify-center">
                                    {hasMore ? (
                                        <Button
                                            variant="outline"
                                            onClick={() => setPage(prev => prev + 1)}
                                            disabled={loadingContents}
                                            className="min-w-[200px]"
                                        >
                                            {loadingContents ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : null}
                                            {loadingContents ? "A carregar..." : "Carregar mais conteúdos"}
                                        </Button>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">
                                            Não existem mais conteúdos a apresentar.
                                        </p>
                                    )}
                                </div>
                            )}

                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* 5. Creator Stats */}
            {user.role === "creator" && (
                <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
                    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-display">Estatísticas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { icon: <Eye className="h-5 w-5" />, label: "Visualizações", value: totalContentViews.toLocaleString(), color: "text-blue-400" },
                                    { icon: <MousePointerClick className="h-5 w-5" />, label: "Vendas", value: totalContentSales.toLocaleString(), color: "text-green-400" },
                                    { icon: <TrendingUp className="h-5 w-5" />, label: "Subscritores", value: creatorStats.totalSubscribers.toLocaleString(), color: "text-primary" }, 
                                    { icon: <DollarSign className="h-5 w-5" />, label: "Receita(MZN)", value: `${totalContentRevenue.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "text-gold" },
                                ].map((stat, i) => (
                                    <div key={i} className="p-4 rounded-lg bg-secondary/50 text-center">
                                        <div className={`${stat.color} mx-auto mb-2`}>{stat.icon}</div>
                                        <p className="text-xl sm:text-2xl font-bold font-display">{stat.value}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="h-64">
                                <p className="text-sm text-muted-foreground mb-3">Crescimento Semanal</p>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={creatorStats.dailyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" />
                                        <XAxis dataKey="day" stroke="hsl(0 0% 60%)" fontSize={12} />
                                        <YAxis stroke="hsl(0 0% 60%)" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 18%)", borderRadius: "8px", color: "hsl(0 0% 95%)" }}
                                        />
                                        <Line type="monotone" dataKey="views" stroke="hsl(340 82% 55%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(340 82% 55%)" }} />
                                        <Line type="monotone" dataKey="revenue" stroke="hsl(45 80% 60%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(45 80% 60%)" }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}


            {/* 6. Account Security */}
            <motion.div {...fadeIn} transition={{ delay: 0.5 }}>
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-display">Segurança da Conta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors cursor-pointer" onClick={() => setShowChangePassword(true)}>
                            <div className="flex items-center gap-3">
                                <Lock className="h-4 w-4 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">Alterar Senha</p>
                                    <p className="text-xs text-muted-foreground">Atualize a sua senha de acesso</p>
                                </div>
                            </div>
                            <Edit3 className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">
                                        {user.role === "creator" ? "Solicitar Verificação" : "Verificação de Identidade"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {user.role === "creator" ? "Obtenha o badge de perfil verificado" : "Confirme a sua identidade"}
                                    </p>
                                </div>
                            </div>
                            {user.isVerified ? (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Verificado</Badge>
                            ) : (
                                <Button size="sm" variant="outline" className="text-xs h-7">Solicitar</Button>
                            )}
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">Estado da Conta</p>
                                    <p className="text-xs text-muted-foreground">
                                        A sua conta está {profile?.isActive ? "ativa" : "inativa"}
                                    </p>
                                </div>
                            </div>
                            <Switch checked={profile?.isActive} onCheckedChange={(v) => setProfile({ ...profile, isActive: v })} />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* 7. Danger Zone */}
            <motion.div {...fadeIn} transition={{ delay: 0.6 }}>
                <Card className="border-destructive/30 bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-display text-destructive flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" /> Zona de Perigo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                            <div>
                                <p className="text-sm font-medium">Desativar Conta</p>
                                <p className="text-xs text-muted-foreground">A sua conta ficará invisível temporariamente</p>
                            </div>
                            <Button variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => setShowDeactivateModal(true)}>
                                Desativar
                            </Button>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                            <div>
                                <p className="text-sm font-medium">Excluir Conta Permanentemente</p>
                                <p className="text-xs text-muted-foreground">Esta ação é irreversível. Todos os seus dados serão apagados.</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => setShowDeleteModal(true)}>
                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Modals */}
            <Dialog open={showDeleteContentModal} onOpenChange={setShowDeleteContentModal}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" /> Excluir Conteúdo
                        </DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir permanentemente o conteúdo:
                            <span className="font-bold text-foreground ml-1">
                                "{contentToDelete?.description?.substring(0, 30)}..."
                            </span>? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteContentModal(false)}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteContent}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Excluindo...
                                </>
                            ) : (
                                "Confirmar Exclusão"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <Dialog open={showDeactivateModal} onOpenChange={setShowDeactivateModal}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>Desativar Conta</DialogTitle>
                        <DialogDescription>
                            A sua conta ficará inativa e invisível para outros usuários. Pode reativar a qualquer momento.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowDeactivateModal(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={() => { setProfile({ ...profile, isActive: false }); setShowDeactivateModal(false); toast({ title: "Conta desativada" }); }}>
                            Desativar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            {/* New Modals */}
            <PublishContentModal
                open={showPublishModal}
                onOpenChange={setShowPublishModal}
                onPublish={(data) => {
                    setContents([data, ...contents]);
                }}
            />

            <EditContentModal
                open={showEditContentModal}
                onOpenChange={setShowEditContentModal}
                content={editingContent}
                onSave={(updated) => {
                    // Atualiza o item específico na lista com os dados que vieram do servidor
                    setContents(contents.map((c) => (c._id === updated._id ? updated : c)));
                }}
            />

            <ChangePasswordModal open={showChangePassword} onOpenChange={setShowChangePassword} />
        </div>
    );
};

export default ProfilePage;

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
    Instagram,
    Twitter,
    Facebook,
    Youtube,
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


const mockSocialLinks = [
    { id: "1", platform: "Instagram", username: "@sofiamendes", url: "https://instagram.com/sofiamendes" },
    { id: "2", platform: "Twitter", username: "@sofia_m", url: "https://twitter.com/sofia_m" },
    { id: "3", platform: "TikTok", username: "@sofiamendes", url: "https://tiktok.com/@sofiamendes" },
];

const mockContents = [
    { id: "1", thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop", type: "photo", description: "Sunset in Santorini", price: 9.99, visibility: "exclusive", views: 1240, sales: 89 },
    { id: "2", thumbnail: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=400&fit=crop", type: "video", description: "Behind the scenes", price: 0, visibility: "public", views: 5600, sales: 0 },
    { id: "3", thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", type: "photo", description: "Exclusive collection #3", price: 14.99, visibility: "paid", views: 890, sales: 156 },
    { id: "4", thumbnail: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop", type: "photo", description: "Premium lifestyle set", price: 19.99, visibility: "exclusive", views: 2100, sales: 210 },
    { id: "5", thumbnail: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop", type: "video", description: "Vlog diário - Lisboa", price: 4.99, visibility: "paid", views: 3400, sales: 45 },
    { id: "6", thumbnail: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop", type: "photo", description: "Nature photography pack", price: 0, visibility: "public", views: 8900, sales: 0 },
];

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

function calculateAge(dob: string) {
    if (!dob) return null;
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return null;
    return Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

const platformIcons: Record<string, React.ReactNode> = {
    Instagram: <Instagram className="h-5 w-5" />,
    Twitter: <Twitter className="h-5 w-5" />,
    Facebook: <Facebook className="h-5 w-5" />,
    TikTok: <Play className="h-5 w-5" />,
    YouTube: <Youtube className="h-5 w-5" />,
};

const visibilityLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    public: { label: "Público", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: <Globe className="h-3 w-3" /> },
    exclusive: { label: "Exclusivo", color: "bg-primary/20 text-primary border-primary/30", icon: <Crown className="h-3 w-3" /> },
    paid: { label: "Pago", color: "bg-gold/20 text-gold border-gold/30", icon: <DollarSign className="h-3 w-3" /> },
};

const ProfilePage = () => {

    const { user, profile, setProfile, setUser, logout } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [editData, setEditData] = useState({ ...profile, name: user?.name || "" });
    const [socialLinks, setSocialLinks] = useState(mockSocialLinks);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [showAddSocial, setShowAddSocial] = useState(false);
    const [newSocial, setNewSocial] = useState({ platform: "Instagram", username: "", url: "" });
    const [isEditing, setIsEditing] = useState(false);

    console.log('DATA USER ', user)
    console.log('DATA PROFILE ', profile)

    // Dentro do componente ProfilePage
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



    // Mostra loading enquanto os dados não chegam
    if (isLoading || !profile || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }



    const age = calculateAge(profile.birthDate);

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

    const handleCancelEdit = () => {
        setEditData({ ...profile, name: user?.name ?? "" });
        setIsEditing(false);
    };

    const handleAddSocial = async () => {
        if (!newSocial.username || !newSocial.url) return;

        setIsLoading(true);
        try {
            const res = await profileService.addSocialLink(user._id, newSocial);

            // Atualizamos o perfil no contexto com o novo link vindo do DB
            setProfile({
                ...profile,
                socialLinks: [...(profile.socialLinks || []), res.data]
            });

            setNewSocial({ platform: "Instagram", username: "", url: "" });
            setShowAddSocial(false);
            toast({ title: "Rede social vinculada" });
        } catch (err) {
            toast({ variant: "destructive", title: "Erro ao adicionar" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveSocial = async (id: string) => {
        try {
            await profileService.deleteSocialLink(id);

            // Filtramos no estado local para remover visualmente
            setProfile({
                ...profile,
                socialLinks: profile.socialLinks.filter((s: any) => s._id !== id)
            });

            toast({ title: "Link removido" });
        } catch (err) {
            toast({ variant: "destructive", title: "Erro ao remover link" });
        }
    };

    const handleDeleteAccount = async () => {
        try {
            setIsLoading(true);
            await userService.deleteMe();

            toast({
                title: "Conta desativada",
                description: "Esperamos ver-te de volta em breve.",
                variant: "destructive"
            });

            logout(); // Limpa estado e redireciona para /login
        } catch (err) {
            toast({ variant: "destructive", title: "Erro ao processar pedido" });
        } finally {
            setShowDeleteModal(false);
            setIsLoading(false);
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
                                    {profile.isVerified && (
                                        <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {age} anos</span>
                                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.location}</span>
                                </div>
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
                            <div className="flex flex-wrap gap-2 sm:self-center">
                                <Button size="sm" onClick={() => { setIsEditing(true); setEditData({ ...profile, name: user?.name ?? "" }); }} className="gap-1.5">
                                    <Edit3 className="h-3.5 w-3.5" /> Editar
                                </Button>
                                <Button size="sm" variant="outline" className="gap-1.5">
                                    <Settings className="h-3.5 w-3.5" /> Configurações
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* 2. Profile Info */}
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

            {/* 3. Social Links */}
            <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-lg font-display">Redes Sociais</CardTitle>
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowAddSocial(true)}>
                            <Plus className="h-3.5 w-3.5" /> Adicionar
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {socialLinks.map((link) => (
                            <div key={link.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 group hover:bg-secondary/80 transition-colors">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    {platformIcons[link.platform] || <Globe className="h-5 w-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{link.platform}</p>
                                    <p className="text-xs text-muted-foreground truncate">{link.username}</p>
                                </div>
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                                <button onClick={() => handleRemoveSocial(link.id)} className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        {socialLinks.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma rede social adicionada.</p>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* 4. Content Grid (Creator only) */}
            {user.role === "creator" && (
                <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
                    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle className="text-lg font-display">Conteúdos Publicados</CardTitle>
                            <Button size="sm" className="gap-1.5">
                                <Plus className="h-3.5 w-3.5" /> Publicar
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {mockContents.map((content) => {
                                    const vis = visibilityLabels[content.visibility];
                                    return (
                                        <div key={content.id} className="group relative rounded-lg overflow-hidden bg-secondary/50 aspect-square">
                                            <img src={content.thumbnail} alt={content.description} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                                <p className="text-xs font-medium text-white truncate">{content.description}</p>
                                                <div className="flex items-center gap-2 mt-1 text-[10px] text-white/70">
                                                    <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" /> {content.views}</span>
                                                    <span className="flex items-center gap-0.5"><DollarSign className="h-3 w-3" /> {content.sales}</span>
                                                </div>
                                                <div className="flex gap-1 mt-2">
                                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-white hover:bg-white/20">
                                                        <Edit3 className="h-3 w-3" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-white hover:bg-white/20">
                                                        <EyeOff className="h-3 w-3" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive hover:bg-white/20">
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
                                                    €{content.price.toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* 5. Creator Stats */}
            {profile.role === "creator" && (
                <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
                    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-display">Estatísticas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { icon: <Eye className="h-5 w-5" />, label: "Visualizações", value: mockAnalytics.totalViews.toLocaleString(), color: "text-blue-400" },
                                    { icon: <MousePointerClick className="h-5 w-5" />, label: "Cliques", value: mockAnalytics.totalClicks.toLocaleString(), color: "text-green-400" },
                                    { icon: <TrendingUp className="h-5 w-5" />, label: "Conversões", value: mockAnalytics.conversions.toLocaleString(), color: "text-primary" },
                                    { icon: <DollarSign className="h-5 w-5" />, label: "Receita", value: `€${mockAnalytics.revenue.toFixed(2)}`, color: "text-gold" },
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
                                    <LineChart data={mockAnalytics.dailyData}>
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
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <Lock className="h-4 w-4 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">Alterar Senha</p>
                                    <p className="text-xs text-muted-foreground">Atualize a sua senha de acesso</p>
                                </div>
                            </div>
                            <Edit3 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">Alterar Email</p>
                                    <p className="text-xs text-muted-foreground">Altere o email associado à sua conta</p>
                                </div>
                            </div>
                            <Edit3 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">Solicitar Verificação</p>
                                    <p className="text-xs text-muted-foreground">Obtenha o badge de perfil verificado</p>
                                </div>
                            </div>
                            {profile.isVerified ? (
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
                                    <p className="text-xs text-muted-foreground">A sua conta está {profile.isActive ? "ativa" : "inativa"}</p>
                                </div>
                            </div>
                            <Switch checked={profile.isActive} onCheckedChange={(v) => setProfile({ ...profile, isActive: v })} />
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
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" /> Excluir Conta
                        </DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir a sua conta permanentemente? Esta ação não pode ser desfeita e todos os seus dados, conteúdos e assinaturas serão removidos.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleDeleteAccount}>Confirmar Exclusão</Button>
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

            <Dialog open={showAddSocial} onOpenChange={setShowAddSocial}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>Adicionar Rede Social</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground font-medium">Plataforma</label>
                            <select
                                value={newSocial.platform}
                                onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                {["Instagram", "Twitter", "Facebook", "TikTok", "YouTube"].map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground font-medium">Username</label>
                            <Input value={newSocial.username} onChange={(e) => setNewSocial({ ...newSocial, username: e.target.value })} placeholder="@username" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground font-medium">URL</label>
                            <Input value={newSocial.url} onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })} placeholder="https://..." />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowAddSocial(false)}>Cancelar</Button>
                        <Button onClick={handleAddSocial}>Adicionar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProfilePage;

import {
  Search,
  Bell,
  ChevronDown,
  User,
  CreditCard,
  LogOut,
  Settings,
  DollarSign,
  CircleHelp,
  Mail,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { logoutUser } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { basicUrl } from "@/utils/index";
import { useState, useEffect } from "react";
import {
  getMyNotifications,
  markNotificationAsRead,
  type Notification,
} from "@/services/notificationService";
const DashboardHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const { user, profile } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const notifs = await getMyNotifications();
        setNotifications(notifs.slice(0, 5)); // show max 5 in header
        setUnreadCount(notifs.filter(n => !n.read).length);
      } catch (e) {
        console.error("Erro ao procurar notificações Header", e);
      }
    };
    if (user) {
      fetchNotifs();
    }
  }, [user]);

  const handleLogout = async () => {
    await logoutUser();

    toast({
      title: "Sessão encerrada",
      description: "Você saiu com sucesso."
    });

    // Redireciona para o login
    navigate("/login");
  };
  const showSearch = location.pathname === "/dashboard";

  // Mantém o input sincronizado quando a URL muda por navegação/limpar filtros
  useEffect(() => {
    setSearchInput(searchParams.get("search") || "");
  }, [searchParams]);

  // Debounce da pesquisa para reduzir chamadas e evitar "falhas" ao digitar rápido
  useEffect(() => {
    const timeout = setTimeout(() => {
      const normalizedValue = searchInput.trim().toLowerCase();
      const nextParams = new URLSearchParams(searchParams);

      if (normalizedValue) {
        nextParams.set("search", normalizedValue);
      } else {
        nextParams.delete("search");
      }

      setSearchParams(nextParams);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput, searchParams, setSearchParams]);

  const formatTimeAgo = (isoDate?: string) => {
    if (!isoDate) return "";
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleOpenNotification = async (n: Notification) => {
    if (!n.read) {
      setNotifications((prev) =>
        prev.map((item) => (item._id === n._id ? { ...item, read: true } : item)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await markNotificationAsRead(n._id);
      } catch (e) {
        // Mantemos UX fluida; eventual refresh sincroniza estado real.
        console.error("Falha ao marcar notificação como lida", e);
      }
    }
    navigate(n.link || "/dashboard/notifications");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-4 lg:px-6">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      {/* Search */}
      <div
        className={`${showSearch ? "" : "invisible"} relative ml-auto flex-1 max-w-md hidden sm:block`}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar conteúdos..."
          className="pl-9 bg-secondary border-border/50 focus:border-primary"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 ml-auto sm:ml-0">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground animate-in zoom-in">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[360px] max-w-[92vw] bg-card border-border/70 p-0 shadow-2xl rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/70">
              <span className="text-[28px] leading-none font-display text-foreground">Notificação</span>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/15 text-primary border-primary/30 rounded-md px-2 py-0.5 text-sm">
                  {unreadCount} Novas
                </Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                Sem notificações recentes
              </div>
            ) : (
              notifications.map((n) => (
                <DropdownMenuItem
                  key={n._id}
                  className="flex items-start gap-3 p-3 cursor-pointer border-b border-border/60 rounded-none focus:bg-secondary/40"
                  onClick={() => handleOpenNotification(n)}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {(n.title || "N").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{n.message}</p>
                    <p className="text-xs text-muted-foreground/90 mt-1">{formatTimeAgo(n.createdAt)}</p>
                  </div>

                  <span
                    className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${!n.read ? "bg-primary" : "bg-muted-foreground/20"}`}
                  />
                </DropdownMenuItem>
              ))
            )}

            <div className="p-3 bg-card">
              <DropdownMenuItem
                className="h-10 justify-center text-sm font-semibold cursor-pointer rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 focus:text-primary-foreground"
              onClick={() => navigate("/dashboard/notifications")}
            >
                Ver todas notificações
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>


        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-full p-0 hover:bg-secondary/70 border border-transparent hover:border-border/70 transition-all"
            >
              <div className="relative">
                <Avatar className="h-8 w-8 ring-2 ring-[#7B74FF] ring-offset-2 ring-offset-background">
                  {profile && profile.photo ? (
                    <AvatarImage src={`${basicUrl}img/users/${profile.photo}`} alt={user?.name} />
                  ) : (
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-72 bg-card border-border/70 p-2 shadow-2xl rounded-xl"
          >
            <div className="px-2.5 py-2.5 mb-1 rounded-lg bg-secondary/20 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-11 w-11 ring-2 ring-primary/60">
                    {profile && profile.photo ? (
                      <AvatarImage src={`${basicUrl}img/users/${profile.photo}`} alt={user?.name} />
                    ) : (
                      <AvatarFallback className="bg-primary/20 text-primary text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-card" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg leading-none font-semibold text-foreground truncate">{user?.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{user?.role || "Membro"}</p>
                </div>
              </div>
            </div>

            <DropdownMenuItem
              onClick={() => navigate("/dashboard/profile")}
              className="gap-3 rounded-md cursor-pointer py-2.5"
            >
              <User className="h-4 w-4 text-primary/90" />
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/dashboard/profile")}
              className="gap-3 rounded-md cursor-pointer py-2.5"
            >
              <Settings className="h-4 w-4 text-primary/90" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/dashboard/subscription")}
              className="gap-3 rounded-md cursor-pointer py-2.5"
            >
              <CreditCard className="h-4 w-4 text-primary/90" />
              Faturação
              <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-red-500 px-1.5 text-[10px] font-bold text-white">
                4
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/dashboard/subscription")}
              className="gap-3 rounded-md cursor-pointer py-2.5"
            >
              <DollarSign className="h-4 w-4 text-primary/90" />
              Preços
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/dashboard/notifications")}
              className="gap-3 rounded-md cursor-pointer py-2.5"
            >
              <CircleHelp className="h-4 w-4 text-primary/90" />
              FAQ
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="mt-1 h-9 justify-center gap-2.5 rounded-md cursor-pointer bg-red-500 text-white focus:bg-red-500/90 focus:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;

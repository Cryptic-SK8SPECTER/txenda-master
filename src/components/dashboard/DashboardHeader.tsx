import { Search, Bell, ChevronDown, User, CreditCard, LogOut } from "lucide-react";
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
import { getMyNotifications, type Notification } from "@/services/notificationService";
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
            className="w-80 bg-card border-border p-1"
          >
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-semibold">Notificações</span>
            </div>
            <DropdownMenuSeparator />
            
            {notifications.length === 0 ? (
               <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                 Sem notificações recentes
               </div>
            ) : (
               notifications.map(n => (
                 <DropdownMenuItem 
                   key={n._id}
                   className={`flex flex-col items-start gap-1 p-3 cursor-pointer group ${!n.read ? 'bg-primary/5' : ''}`}
                   onClick={() => navigate(n.link || '/dashboard/notifications')}
                 >
                   <div className="flex items-center gap-2 w-full">
                     <span className={`h-2 w-2 rounded-full shrink-0 ${!n.read ? 'bg-primary' : 'bg-transparent'}`} />
                     <span className={`text-xs truncate ${!n.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{n.title}</span>
                   </div>
                   <span className="text-[10px] text-muted-foreground line-clamp-2 pl-4">
                     {n.message}
                   </span>
                 </DropdownMenuItem>
               ))
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="justify-center text-xs text-primary font-medium cursor-pointer"
              onClick={() => navigate("/dashboard/notifications")}
            >
              Ver todas as notificações
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>


        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 rounded-full hover:bg-secondary/70 border border-transparent hover:border-border/70 transition-all"
            >
              <Avatar className="h-8 w-8">
                {profile && profile.photo ? (
                  <AvatarImage src={`${basicUrl}img/users/${profile.photo}`} alt={user?.name} />
                ) : (
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <span className="hidden md:block text-xs font-medium text-foreground max-w-[100px] truncate">
                {user?.name}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 bg-card border-border/70 p-1.5 shadow-2xl"
          >
            <div className="px-2.5 py-2.5 mb-1 rounded-md bg-secondary/30 border border-border/50">
              <p className="text-[11px] text-muted-foreground">Sessão ativa</p>
              <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
            </div>

            <DropdownMenuItem
              onClick={() => navigate("/dashboard/profile")}
              className="gap-2.5 rounded-md cursor-pointer"
            >
              <User className="h-4 w-4 text-primary" />
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/dashboard/subscription")}
              className="gap-2.5 rounded-md cursor-pointer"
            >
              <CreditCard className="h-4 w-4 text-primary" />
              Subscrição
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-2.5 rounded-md cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;

import { Search, Bell, MessageCircle, ChevronDown } from "lucide-react";
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
import { useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const showSearch = location.pathname === "/dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-4 lg:px-6">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      {/* Logo mobile */}
      <span className="font-display text-lg font-bold text-gradient lg:hidden">
        Conexus
      </span>

      {/* Search */}
      <div
        className={`${showSearch ? "" : "invisible"} relative ml-auto flex-1 max-w-md hidden sm:block`}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar nome, cidade, interesses..."
          className="pl-9 bg-secondary border-border/50 focus:border-primary"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto sm:ml-0">
        {/* Search mobile */}
        <Button
          variant="ghost"
          size="icon"
          className={`sm:hidden text-muted-foreground ${showSearch ? "" : "invisible"}`}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 bg-card border-border"
          >
            <DropdownMenuItem>🔔 Nova mensagem de João</DropdownMenuItem>
            <DropdownMenuItem>🔔 Venda concluída</DropdownMenuItem>
            <DropdownMenuItem>🔔 Comentário em conteúdo</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-xs text-muted-foreground">
              Ver todas as notificações
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Messages */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                5
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 bg-card border-border"
          >
            <DropdownMenuItem onClick={() => navigate("/dashboard/messages")}>
              📩 Nova mensagem de Ana
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/messages")}>
              📩 Mensagem de pedido
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/messages")}>
              📩 Mensagem de suporte
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/dashboard/messages")}
              className="text-center text-xs text-muted-foreground"
            >
              Ver todas as conversas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop" />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  U
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-card border-border"
          >
            <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
              👤 Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/dashboard/subscription")}
            >
              💳 Subscrição
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/login")}
              className="text-destructive"
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;

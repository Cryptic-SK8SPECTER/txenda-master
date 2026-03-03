import { Home, Search, MessageCircle, Diamond, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { icon: Home, label: "Início", to: "/dashboard" },
  { icon: Search, label: "Buscar", to: "/dashboard/nearby" },
  { icon: MessageCircle, label: "Mensagens", to: "/dashboard/messages" },
  { icon: Diamond, label: "Conteúdo", to: "/dashboard/premium" },
  { icon: User, label: "Perfil", to: "/dashboard/profile" },
];

const MobileBottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-background/90 backdrop-blur-xl py-2 md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          end={item.to === "/dashboard"}
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <item.icon className="h-5 w-5" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileBottomNav;

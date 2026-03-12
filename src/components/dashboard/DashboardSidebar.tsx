import {
  Home,
  MapPin,
  MessageCircle,
  Diamond,
  Star,
  User,
  CreditCard,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/txenda.png";

const menuItems = [
  { title: "Início", url: "/dashboard", icon: Home },
  { title: "Pessoas Próximas", url: "/dashboard/nearby", icon: MapPin },
  { title: "Conteúdo Premium", url: "/dashboard/premium", icon: Diamond },
  { title: "Favoritos", url: "/dashboard/favorites", icon: Star },
  { title: "Subscrição", url: "/dashboard/subscription", icon: CreditCard },
];

const DashboardSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="pt-4">
        {/* Logo */}
        {!collapsed && (
          <div className="px-4 pb-4 border-b border-border mb-2">
            <Link to="/dashboard">
              <img src={logo} alt="txenda" className="h-10 w-auto " />
            </Link>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Conexões Premium
            </p>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium border-l-2 border-primary"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && (
                        <span className="text-sm">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;

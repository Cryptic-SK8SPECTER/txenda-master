import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Info,
  MessageCircle,
  CreditCard,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  getMyNotifications,
  markNotificationAsRead,
  type Notification,
} from "@/services/notificationService";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

const typeConfig: Record<
  Notification["type"],
  { icon: React.ElementType; color: string; label: string }
> = {
  info: {
    icon: Info,
    color: "text-blue-400 bg-blue-500/15",
    label: "Informação",
  },
  subscription: {
    icon: CreditCard,
    color: "text-primary bg-primary/15",
    label: "Subscrição",
  },
  message: {
    icon: MessageCircle,
    color: "text-green-400 bg-green-500/15",
    label: "Mensagem",
  },
  alert: {
    icon: AlertTriangle,
    color: "text-yellow-400 bg-yellow-500/15",
    label: "Alerta",
  },
};

const NotificationPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (err: any) {
      toast({
        title: "Erro ao carregar notificações",
        description: err.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const updated = await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Não foi possível marcar como lida.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    try {
      await Promise.all(unread.map((n) => markNotificationAsRead(n._id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast({ title: "Todas as notificações marcadas como lidas." });
    } catch {
      toast({
        title: "Erro ao marcar todas como lidas.",
        variant: "destructive",
      });
    }
  };

  const filtered =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="px-4 lg:px-6 py-6 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Notificações</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {unreadCount} não lida{unreadCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck className="h-3.5 w-3.5" /> Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          className="text-xs h-8"
          onClick={() => setFilter("all")}
        >
          Todas
          <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1.5">
            {notifications.length}
          </Badge>
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          className="text-xs h-8"
          onClick={() => setFilter("unread")}
        >
          Não lidas
          {unreadCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1.5 text-[10px] h-4 px-1.5"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">
            A carregar notificações...
          </span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 glass rounded-xl">
          <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground text-sm font-medium">
            {filter === "unread"
              ? "Nenhuma notificação por ler"
              : "Sem notificações"}
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            As suas notificações aparecerão aqui.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-2">
            {filtered.map((notification) => {
              const config = typeConfig[notification.type] || typeConfig.info;
              const IconComp = config.icon;

              return (
                <div
                  key={notification._id}
                  className={`group flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${
                    notification.read
                      ? "border-border bg-card/50 opacity-70"
                      : "border-primary/20 bg-primary/5 hover:bg-primary/10"
                  }`}
                  onClick={() =>
                    !notification.read && handleMarkAsRead(notification._id)
                  }
                >
                  <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}
                  >
                    <IconComp className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm font-medium truncate ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] h-5 px-1.5 border-border"
                      >
                        {config.label}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: pt,
                        })}
                      </span>
                    </div>
                  </div>

                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification._id);
                      }}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default NotificationPage;

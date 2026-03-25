import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSocket } from "@/services/authService";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { basicUrl } from "@/utils/index";
import { useAuth } from "@/context/AuthContext";
import { type FilterState } from "@/types/filters";
import { cn } from "@/lib/utils";

interface AvailableNowSectionProps {
  filters: FilterState;
}


/** Limite alto: o default do serviço é 6, insuficiente para encontrar quem está online. */
const ONLINE_CREATORS_FETCH_LIMIT = 250;

const AvailableNowSection = ({ filters }: AvailableNowSectionProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const { data: onlineUsers } = useQuery({
    queryKey: [
      "online-creators",
      currentUser?._id,
      filters.gender,
      filters.quickFilters,
      filters.profileTypes,
    ],
    queryFn: () =>
      userService.getAllUsers("creator", ONLINE_CREATORS_FETCH_LIMIT),
    enabled: !!currentUser?._id,
    select: (res) => {
      const allUsers = res.data.data || [];

      return allUsers.filter((u: any) => {
        // isOnline vem do User (socket / presença), não do Profile
        if (!u.isOnline || u._id === currentUser?._id) return false;

        // Género: único filtro “forte” partilhado com o resto do dashboard
        if (
          filters.gender !== "all" &&
          u.profile?.gender?.toLowerCase() !== filters.gender.toLowerCase()
        ) {
          return false;
        }

        // Verificados só quando o utilizador pediu explicitamente
        if (
          (filters.quickFilters.includes("Verificados") ||
            filters.profileTypes.includes("Apenas verificados")) &&
          !u.isVerified
        ) {
          return false;
        }

        return true;
      });
    },
  });
  
  // 2. OUVIR MUDANÇAS DE STATUS EM TEMPO REAL
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on(
      "user_status_changed",
      (data: { userId: string; status: string }) => {
        // Invalida as queries para atualizar as listas automaticamente
        queryClient.invalidateQueries({ queryKey: ["online-creators"] });
        queryClient.invalidateQueries({ queryKey: ["nearby-users"] });
      },
    );

    return () => {
      socket.off("user_status_changed");
    };
  }, [queryClient]);

  if (!onlineUsers || onlineUsers.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        <h2 className="font-display text-xl font-semibold">
          Disponíveis Agora
        </h2>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] animate-pulse">
          LIVE
        </Badge>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {onlineUsers.map((user: any) => {
          const photoSrc = user.profile?.photo
            ? `${basicUrl}img/users/${user.profile.photo}`
            : `${basicUrl}img/users/default.jpg`;
          const go = () => {
            if (user._id) navigate(`/details/${user._id}`);
          };

          return (
            <button
              key={user._id}
              type="button"
              onClick={go}
              disabled={!user._id}
              className={cn(
                "flex min-w-[80px] flex-col items-center gap-2 group",
                user._id && "cursor-pointer",
                !user._id && "cursor-default opacity-80",
              )}
            >
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-yellow-500 p-[2px]">
                  {photoSrc ? (
                    <img
                      src={photoSrc}
                      alt={user.name}
                      className="h-full w-full rounded-full border-2 border-background object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-semibold text-muted-foreground">
                      {(user.name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background bg-green-500" />
              </div>
              <span className="w-20 truncate text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                {(user.name || "").split(" ")[0] || "—"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default AvailableNowSection;

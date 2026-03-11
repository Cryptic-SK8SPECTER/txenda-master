import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { getSocket } from "@/services/authService";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { userService } from "@/services/userService"; // Importa o teu serviço
import { basicUrl } from "@/utils/index";
import { useAuth } from "@/context/AuthContext";

const AvailableNowSection = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

 const { data: onlineUsers } = useQuery({
   queryKey: ["online-creators"],
   queryFn: () => userService.getAllUsers(),
   select: (res) => {
     // FILTRO: Remove o utilizador logado da lista
     return res.data.data.filter(
       (u: any) => u.isOnline && u._id !== currentUser?._id,
     );
   },
 });

  // 2. OUVIR MUDANÇAS DE STATUS EM TEMPO REAL
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on(
      "user_status_changed",
      (data: { userId: string; status: string }) => {
        console.log(`📡 Status alterado: ${data.userId} está ${data.status}`);

        // Invalida as queries para atualizar as listas automaticamente
        queryClient.invalidateQueries({ queryKey: ["online-creators"] });
        queryClient.invalidateQueries({ queryKey: ["nearby-users"] });
      },
    );

    return () => {
      socket.off("user_status_changed");
    };
  }, [queryClient]);

  // Se não houver ninguém online, podes retornar null ou uma mensagem
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
        {onlineUsers.map((user: any) => (
          <button
            key={user._id}
            className="flex flex-col items-center gap-2 min-w-[80px] group"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-primary to-yellow-500">
                <img
                  src={`${basicUrl}img/users/${user.profile?.photo}`}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover border-2 border-background"
                />
              </div>
              {/* Indicador de Online */}
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-background" />
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate w-20">
              {user.name.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default AvailableNowSection;

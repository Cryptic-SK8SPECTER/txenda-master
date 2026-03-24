import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Search, ChevronDown, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { basicUrl } from "@/utils/index";
import { chatService } from "@/services/chatService";
import { cn } from "@/lib/utils";

type ChatListItem = {
  chatId: string;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
  otherUser: {
    _id: string;
    name: string;
    isOnline: boolean;
    profile?: { photo?: string };
  } | null;
};

function previewLastMessage(raw: string) {
  if (!raw) return "Sem mensagens ainda";
  try {
    const p = JSON.parse(raw);
    if (p?.txendaMsg === "paidContent") return "Oferta de conteúdo";
  } catch {
    /* texto */
  }
  const t = raw.trim();
  return t.length > 48 ? `${t.slice(0, 48)}…` : t;
}

function peerIdFromPath(pathname: string): string | null {
  const m = pathname.match(/\/messages\/([^/]+)$/);
  return m ? m[1] : null;
}

const MessagesLayout = () => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const activePeerId = peerIdFromPath(location.pathname);

  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState("");
  const listPeerRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!user?._id && !user?.id) return;

    const load = async (showSpinner: boolean) => {
      try {
        if (showSpinner) setLoadingList(true);
        const res = await chatService.getMyChats();
        const list = Array.isArray(res?.data) ? res.data : [];
        setChats(list);
      } catch (e) {
        console.error(e);
        setChats([]);
      } finally {
        if (showSpinner) setLoadingList(false);
      }
    };

    if (listPeerRef.current === undefined) {
      listPeerRef.current = activePeerId;
      void load(true);
      return;
    }
    if (listPeerRef.current && activePeerId === null) {
      void load(false);
    }
    listPeerRef.current = activePeerId;
  }, [activePeerId, user?._id, user?.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) => {
      const name = c.otherUser?.name?.toLowerCase() || "";
      const prev = previewLastMessage(c.lastMessage).toLowerCase();
      return name.includes(q) || prev.includes(q);
    });
  }, [chats, search]);

  const mePhoto = profile?.photo
    ? `${basicUrl}img/users/${profile.photo}`
    : undefined;
  const meInitial = user?.name?.[0]?.toUpperCase() ?? "?";

  const showSidebarOnMobile = !activePeerId;

  return (
    <div className="flex w-full min-h-[calc(100dvh-7rem)] max-h-[calc(100dvh-7rem)] md:min-h-[calc(100dvh-5.5rem)] md:max-h-[calc(100dvh-5.5rem)] overflow-hidden rounded-xl border border-white/[0.08] bg-[#121212] shadow-sm mx-2 sm:mx-4 mb-4">
      {/* Coluna esquerda — contactos */}
      <aside
        className={cn(
          "flex w-full max-w-full flex-col border-r border-white/[0.06] bg-[#121212] text-zinc-100 md:w-[min(100%,320px)] md:min-w-[280px] md:max-w-[340px] shrink-0",
          !showSidebarOnMobile && "hidden md:flex",
        )}
      >
        <div className="flex items-center gap-3 p-3 border-b border-white/[0.06]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex flex-1 min-w-0 items-center gap-2 rounded-lg p-1.5 text-left hover:bg-white/[0.06] transition-colors"
              >
                <div className="relative shrink-0">
                  <Avatar className="h-10 w-10 ring-2 ring-emerald-500/90 ring-offset-2 ring-offset-[#121212]">
                    {mePhoto ? (
                      <AvatarImage src={mePhoto} alt="" className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-zinc-800 text-zinc-200 text-sm font-semibold">
                      {meInitial}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#121212]"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate text-white">
                    {user?.name || "Eu"}
                  </p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wide">
                    Online
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/dashboard/profile">Ver perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard">Início</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="p-3 border-b border-white/[0.06]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar contactos…"
              className="h-10 border border-white/[0.08] bg-[#1a1a1a] pl-9 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-offset-[#121212]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loadingList ? (
            <p className="p-4 text-xs text-zinc-500 text-center">A carregar…</p>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-sm">
              <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
              {chats.length === 0
                ? "Ainda não tens conversas. Fala com alguém em Pessoas próximas."
                : "Nenhum contacto corresponde à pesquisa."}
            </div>
          ) : (
            <ul className="py-1">
              {filtered.map((item) => {
                const other = item.otherUser;
                if (!other) return null;
                const peerId = String(other._id);
                const active = activePeerId === peerId;
                const photo = other.profile?.photo
                  ? `${basicUrl}img/users/${other.profile.photo}`
                  : undefined;
                return (
                  <li key={item.chatId}>
                    <NavLink
                      to={`/dashboard/messages/${peerId}`}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 transition-colors border-l-2 border-transparent",
                        active
                          ? "bg-[#1a1a1a] border-l-zinc-400 text-white"
                          : "hover:bg-white/[0.04] text-zinc-200",
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-11 w-11 border border-white/[0.08]">
                          {photo ? (
                            <AvatarImage src={photo} alt="" className="object-cover" />
                          ) : null}
                          <AvatarFallback className="bg-zinc-800 text-zinc-300 text-sm">
                            {other.name?.[0] ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={cn(
                            "absolute -left-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#121212]",
                            other.isOnline ? "bg-emerald-500" : "bg-zinc-500",
                          )}
                          title={other.isOnline ? "Online" : "Offline"}
                        />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium truncate">
                            {other.name}
                          </span>
                          {item.unreadCount > 0 && (
                            <span className="shrink-0 rounded-full bg-zinc-600 px-1.5 py-0.5 text-[10px] font-bold text-white min-w-[1.25rem] text-center">
                              {item.unreadCount > 9 ? "9+" : item.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          {previewLastMessage(item.lastMessage)}
                        </p>
                      </div>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* Área principal — conversa ou placeholder */}
      <section
        className={cn(
          "flex flex-1 flex-col min-w-0 min-h-0 bg-[#121212]",
          showSidebarOnMobile && "hidden md:flex",
        )}
      >
        <Outlet />
      </section>
    </div>
  );
};

export default MessagesLayout;

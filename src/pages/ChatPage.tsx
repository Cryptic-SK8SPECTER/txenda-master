import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Loader2,
  MessageCircle,
  Image,
  Video,
  Plus,
  Library,
  Lock,
  DollarSign,
  Smile,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { chatService } from "@/services/chatService";
import { getSocket } from "@/services/authService";
import { contentService } from "@/services/contentService";
import { purchaseService } from "@/services/purchaseService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { basicUrl } from "@/utils/index";
import { cn } from "@/lib/utils";
import { isContentCreator } from "@/utils/userRole";

const PAID_MSG_MARKER = "txendaMsg";
const PAID_MSG_TYPE = "paidContent";

/** Emojis frequentes para o picker do chat (sem dependências extra). */
const CHAT_EMOJIS = [
  "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "🥲",
  "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😗",
  "😙", "😚", "🤗", "🤩", "😋", "😛", "😜", "😝",
  "😐", "😑", "🙄", "😏", "😣", "😥", "😮", "🤐",
  "😯", "😪", "😫", "🥱", "😴", "😌", "🤤", "😒",
  "😓", "😔", "😕", "🙃", "🫠", "😲", "🥹", "😱",
  "😨", "😰", "😢", "😭", "😤", "😠", "😡", "🤬",
  "😳", "🥵", "🥶", "😎", "🥳", "😈", "👿", "💀",
  "🤡", "👻", "👽", "🤖", "😺", "😸", "😹", "😻",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
  "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘",
  "👍", "👎", "👌", "✌️", "🤞", "🫶", "🙏", "👏",
  "🙌", "👋", "🤝", "💪", "🔥", "✨", "⭐", "🌟",
  "💋", "💯", "🎉", "🎊", "🍷", "🍕", "🌹", "🌙",
] as const;

type ChatMessage =
  | {
      id: string;
      sender: "me" | "them";
      time: string;
      kind: "text";
      text: string;
      edited?: boolean;
      isDeleted?: boolean;
    }
  | {
      id: string;
      sender: "me" | "them";
      time: string;
      kind: "paidContent";
      paid: {
        contentId: string;
        description: string;
        price: number;
        type: "photo" | "video";
        mediaUrl: string;
      };
    };

function formatTime(d?: string | Date) {
  if (!d) return "--:--";
  return new Date(d).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseApiMessage(msg: any, currentId: string): ChatMessage {
  const time = formatTime(msg.createdAt);
  const sid = String(msg.sender?._id ?? msg.sender);
  const sender: "me" | "them" = sid === String(currentId) ? "me" : "them";
  const raw = msg.content ?? "";

  if (msg.isDeleted) {
    return {
      id: msg._id,
      sender,
      time,
      kind: "text",
      text: "",
      isDeleted: true,
    };
  }

  try {
    const p = JSON.parse(raw);
    if (p?.[PAID_MSG_MARKER] === PAID_MSG_TYPE && p.contentId && p.url) {
      return {
        id: msg._id,
        sender,
        time,
        kind: "paidContent",
        paid: {
          contentId: String(p.contentId),
          description: p.description || "Conteúdo",
          price: Number(p.price ?? 0),
          type: p.type === "video" ? "video" : "photo",
          mediaUrl: `${basicUrl}img/contents/${p.url}`,
        },
      };
    }
  } catch {
    /* texto normal */
  }

  return {
    id: msg._id,
    sender,
    time,
    kind: "text",
    text: raw,
    edited: !!msg.editedAt,
  };
}

function upsertMessageFromApi(
  prev: ChatMessage[],
  raw: any,
  currentId: string,
): ChatMessage[] {
  const parsed = parseApiMessage(raw, currentId);
  const idx = prev.findIndex((m) => m.id === parsed.id);
  if (idx === -1) return [...prev, parsed];
  const next = [...prev];
  next[idx] = parsed;
  return next;
}

function buildPaidContentJson(doc: any) {
  return JSON.stringify({
    [PAID_MSG_MARKER]: PAID_MSG_TYPE,
    contentId: doc._id,
    description: doc.description || "",
    price: Number(doc.price ?? 0),
    type: doc.type === "video" ? "video" : "photo",
    url: doc.url,
  });
}

const ChatPage = () => {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isMessagesRoute = location.pathname.includes("/dashboard/messages");
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const isCreator = isContentCreator(currentUser);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<any>(null);

  const [showContentPicker, setShowContentPicker] = useState(false);
  const [creatorContents, setCreatorContents] = useState<any[]>([]);
  const [loadingContents, setLoadingContents] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadPrice, setUploadPrice] = useState<string>("0");
  const [uploadVisibility, setUploadVisibility] = useState<string>("Pago individualmente");
  const [isUploadingContent, setIsUploadingContent] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editText, setEditText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const currentIdStr = String(currentUser?._id ?? currentUser?.id ?? "");

  useEffect(() => {
    const loadCreatorContents = async () => {
      if (!isCreator) return;
      try {
        setLoadingContents(true);
        const res = await contentService.getMyContents(1, 40);
        setCreatorContents(res?.data?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingContents(false);
      }
    };
    loadCreatorContents();
  }, [isCreator]);

  useEffect(() => {
    const initChat = async () => {
      if (!routeId || !currentUser) return;

      try {
        setLoading(true);
        const chatRes = await chatService.getOrCreateChat(routeId);

        if (chatRes?.data) {
          const chat = chatRes.data;
          setActiveChatId(chat._id);

          const currentId = String(currentUser._id ?? currentUser.id);
          const otherUser = chat.participants?.find(
            (p: any) => String(p._id) !== currentId,
          );

          setRecipient(otherUser || null);

          const msgRes = await chatService.loadMessages(chat._id);

          if (Array.isArray(msgRes?.data)) {
            setMessages(
              msgRes.data.map((msg: any) => parseApiMessage(msg, currentId)),
            );
          }
        }
      } catch (err) {
        console.error("ERRO NO INIT CHAT:", err);
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [routeId, currentUser?._id, currentUser?.id]);

  useEffect(() => {
    setOtherUserTyping(false);
  }, [activeChatId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !activeChatId) return;

    const onNew = (payload: { chatId: string; message: any }) => {
      const { chatId, message } = payload;
      if (chatId !== activeChatId) return;
      setMessages((prev) => upsertMessageFromApi(prev, message, currentIdStr));
    };

    const onUpdated = (payload: { chatId: string; message: any }) => {
      const { chatId, message } = payload;
      if (chatId !== activeChatId) return;
      setMessages((prev) => upsertMessageFromApi(prev, message, currentIdStr));
    };

    const onTyping = (payload: { chatId: string; userId: string }) => {
      const { chatId, userId } = payload;
      if (chatId !== activeChatId) return;
      if (userId === currentIdStr) return;
      setOtherUserTyping(true);
    };

    const onStopTyping = (payload: { chatId: string }) => {
      const { chatId } = payload;
      if (chatId !== activeChatId) return;
      setOtherUserTyping(false);
    };

    socket.on("new_message", onNew);
    socket.on("message_updated", onUpdated);
    socket.on("user_typing", onTyping);
    socket.on("user_stopped_typing", onStopTyping);

    return () => {
      socket.off("new_message", onNew);
      socket.off("message_updated", onUpdated);
      socket.off("user_typing", onTyping);
      socket.off("user_stopped_typing", onStopTyping);
    };
  }, [activeChatId, currentIdStr]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !activeChatId || !recipient?._id) return;

    const clearTyping = () => {
      if (typingStopTimerRef.current) {
        clearTimeout(typingStopTimerRef.current);
        typingStopTimerRef.current = null;
      }
    };

    const rid = String(recipient._id);

    if (!newMessage.trim()) {
      socket.emit("stop_typing", { chatId: activeChatId, recipientId: rid });
      clearTyping();
      return;
    }

    socket.emit("typing", { chatId: activeChatId, recipientId: rid });
    clearTyping();
    typingStopTimerRef.current = setTimeout(() => {
      socket.emit("stop_typing", { chatId: activeChatId, recipientId: rid });
      typingStopTimerRef.current = null;
    }, 2500);

    return () => {
      clearTyping();
    };
  }, [newMessage, activeChatId, recipient?._id]);

  useEffect(() => {
    return () => {
      const socket = getSocket();
      if (!socket || !activeChatId || !recipient?._id) return;
      socket.emit("stop_typing", {
        chatId: activeChatId,
        recipientId: String(recipient._id),
      });
    };
  }, [activeChatId, recipient?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherUserTyping]);

  const resetUploadDialog = () => {
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setPendingFile(null);
    setUploadDescription("");
    setUploadPrice("0");
    setUploadVisibility("Pago individualmente");
    setUploadDialogOpen(false);
  };

  const handlePickFile = (file: File) => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setPendingFile(file);
    setUploadDialogOpen(true);
  };

  const onPhotoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) handlePickFile(f);
  };

  const onVideoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) handlePickFile(f);
  };

  const sendPaidContentDoc = async (doc: any): Promise<boolean> => {
    if (!activeChatId) {
      toast({
        title: "Chat indisponível",
        description: "Aguarde a ligação ao chat.",
        variant: "destructive",
      });
      return false;
    }
    setSending(true);
    try {
      const body = buildPaidContentJson(doc);
      const res = await chatService.sendMessage(activeChatId, body);
      const msg = res?.data;
      if (msg?._id) {
        setMessages((prev) => [
          ...prev,
          parseApiMessage(msg, currentIdStr),
        ]);
      }
      setShowContentPicker(false);
      toast({
        title: "Conteúdo enviado",
        description: "A oferta foi enviada na conversa.",
      });
      return true;
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o conteúdo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSending(false);
    }
  };

  const submitChatUpload = async () => {
    if (!pendingFile || !uploadDescription.trim()) {
      toast({
        title: "Descrição obrigatória",
        description: "Indique uma descrição para o conteúdo.",
        variant: "destructive",
      });
      return;
    }
    if (!activeChatId) {
      toast({
        title: "Chat indisponível",
        variant: "destructive",
      });
      return;
    }
    setIsUploadingContent(true);
    try {
      const fd = new FormData();
      fd.append("file", pendingFile);
      fd.append("description", uploadDescription.trim().toLowerCase());
      fd.append("price", String(Number(uploadPrice) || 0));
      fd.append("visibility", uploadVisibility);
      const res = await contentService.createContent(fd);
      const doc = res?.data?.data;
      if (!doc?._id) throw new Error("Resposta inválida");
      const sent = await sendPaidContentDoc(doc);
      if (!sent) return;
      const refreshed = await contentService.getMyContents(1, 40);
      setCreatorContents(refreshed?.data?.data || []);
      resetUploadDialog();
    } catch (error: any) {
      toast({
        title: "Erro ao carregar",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Não foi possível enviar o ficheiro.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingContent(false);
    }
  };

  const handleBuyContent = async (contentId: string) => {
    try {
      const res = await purchaseService.getCheckoutSession(contentId);
      if (res.session?.url) {
        window.location.href = res.session.url;
      } else {
        throw new Error("URL de checkout não encontrada.");
      }
    } catch (error: any) {
      toast({
        title: "Erro ao iniciar pagamento",
        description:
          error?.response?.data?.message ||
          "Não foi possível iniciar o checkout no Stripe.",
        variant: "destructive",
      });
    }
  };

  const emitStopTyping = () => {
    const socket = getSocket();
    if (socket && activeChatId && recipient?._id) {
      socket.emit("stop_typing", {
        chatId: activeChatId,
        recipientId: String(recipient._id),
      });
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeChatId) return;
    emitStopTyping();
    try {
      setSending(true);
      const res = await chatService.sendMessage(activeChatId, newMessage.trim());
      const msg = res.data;
      setMessages((prev) => [...prev, parseApiMessage(msg, currentIdStr)]);
      setNewMessage("");
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const openEditMessage = (msg: ChatMessage) => {
    if (msg.kind !== "text" || msg.isDeleted) return;
    setEditingMessageId(msg.id);
    setEditText(msg.text);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !activeChatId || !editText.trim()) return;
    try {
      const res = await chatService.updateMessage(
        activeChatId,
        editingMessageId,
        editText.trim(),
      );
      const msg = res.data;
      if (msg) {
        setMessages((prev) => upsertMessageFromApi(prev, msg, currentIdStr));
      }
      setEditDialogOpen(false);
      setEditingMessageId(null);
      setEditText("");
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível editar a mensagem.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteMessageId || !activeChatId) return;
    try {
      const res = await chatService.deleteMessage(activeChatId, deleteMessageId);
      const msg = res.data;
      if (msg) {
        setMessages((prev) => upsertMessageFromApi(prev, msg, currentIdStr));
      }
      setDeleteDialogOpen(false);
      setDeleteMessageId(null);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível apagar a mensagem.",
        variant: "destructive",
      });
    }
  };

  const pendingIsVideo = pendingFile?.type.startsWith("video");

  if (!loading && !recipient) {
    return (
      <div
        className={cn(
          "flex flex-1 min-h-[240px] items-center justify-center p-10 text-center text-muted-foreground",
          isMessagesRoute && "bg-[#121212] text-zinc-400",
        )}
      >
        Utilizador não encontrado.
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={cn(
          "flex flex-1 min-h-[280px] flex-col items-center justify-center gap-4 bg-background",
          isMessagesRoute && "bg-[#121212]",
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p
          className={cn(
            "text-sm text-muted-foreground italic",
            isMessagesRoute && "text-zinc-500",
          )}
        >
          A ligar ao chat…
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full min-h-0 flex-1 bg-background overflow-hidden",
        isMessagesRoute && "bg-[#121212]",
      )}
    >
      <Dialog
        open={uploadDialogOpen}
        onOpenChange={(open) => {
          if (!open) resetUploadDialog();
        }}
      >
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle>Carregar conteúdo</DialogTitle>
            <DialogDescription>
              {pendingIsVideo ? "Vídeo" : "Fotografia"} — publica e envia como
              oferta nesta conversa.
            </DialogDescription>
          </DialogHeader>
          {previewUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black">
              {pendingIsVideo ? (
                <video
                  src={previewUrl}
                  className="h-full w-full object-contain"
                  controls
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Pré-visualização"
                  className="h-full w-full object-contain"
                />
              )}
            </div>
          )}
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="chat-upload-desc">Descrição</Label>
              <Input
                id="chat-upload-desc"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Ex.: Pack exclusivo"
                className="bg-secondary/40"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="chat-upload-price">Preço (MZN)</Label>
              <Input
                id="chat-upload-price"
                type="number"
                min={0}
                step={0.01}
                value={uploadPrice}
                onChange={(e) => setUploadPrice(e.target.value)}
                className="bg-secondary/40"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Visibilidade</Label>
              <Select value={uploadVisibility} onValueChange={setUploadVisibility}>
                <SelectTrigger className="bg-secondary/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pago individualmente">
                    Pago individualmente
                  </SelectItem>
                  <SelectItem value="Exclusivo assinantes">
                    Exclusivo assinantes
                  </SelectItem>
                  <SelectItem value="Público">Público</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={resetUploadDialog}
              disabled={isUploadingContent}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={submitChatUpload}
              disabled={isUploadingContent}
            >
              {isUploadingContent ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> A enviar…
                </>
              ) : (
                "Publicar e enviar no chat"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setEditingMessageId(null);
            setEditText("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle>Editar mensagem</DialogTitle>
            <DialogDescription>
              Altera o texto e guarda. A conversa será actualizada para ambos.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="min-h-[100px] bg-secondary/40"
            placeholder="Mensagem…"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveEdit}
              disabled={!editText.trim()}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeleteMessageId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar mensagem?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acção não pode ser anulada. O outro utilizador verá que a
              mensagem foi apagada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmDelete();
              }}
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 border-b shrink-0 bg-background/80 backdrop-blur-xl",
          isMessagesRoute &&
            "border-white/[0.06] bg-[#121212] backdrop-blur-none",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            isMessagesRoute
              ? navigate("/dashboard/messages")
              : navigate(-1)
          }
          aria-label="Voltar"
          className={cn(isMessagesRoute && "text-zinc-300 hover:bg-white/[0.08] hover:text-white")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Avatar className="h-10 w-10 border">
          {recipient?.profile?.photo ? (
            <AvatarImage
              src={`${basicUrl}img/users/${recipient.profile.photo}`}
            />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {recipient?.name ? recipient.name[0] : "?"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "font-semibold text-sm truncate",
              isMessagesRoute && "text-zinc-100",
            )}
          >
            {recipient?.name || "Utilizador"}
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${recipient?.isOnline ? "bg-green-500" : "bg-muted-foreground/30"}`}
            />
            <p
              className={cn(
                "text-[10px] text-muted-foreground uppercase",
                isMessagesRoute && "text-zinc-500",
              )}
            >
              {recipient?.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex-1 overflow-y-auto px-4 py-6 space-y-6",
          isMessagesRoute && "bg-[#121212]",
        )}
      >
        {messages.length === 0 && (
          <div
            className={cn(
              "text-center py-10 opacity-50",
              isMessagesRoute && "text-zinc-400 opacity-100",
            )}
          >
            <MessageCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm">
              Diz olá para {recipient?.name?.split(" ")[0] || "seu amigo"}! 👋
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            {msg.kind === "text" ? (
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                  msg.sender === "me"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : isMessagesRoute
                      ? "bg-zinc-800 text-zinc-100 rounded-bl-none border border-white/[0.06]"
                      : "bg-secondary text-foreground rounded-bl-none",
                )}
              >
                <div className="flex gap-1.5 items-start">
                  <div className="flex-1 min-w-0">
                    {msg.isDeleted ? (
                      <p className="italic opacity-70">Mensagem apagada</p>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                  {msg.sender === "me" && !msg.isDeleted && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-7 w-7 shrink-0 -mr-1 -mt-0.5 opacity-80 hover:opacity-100",
                            msg.sender === "me" &&
                              "text-primary-foreground/80 hover:bg-primary-foreground/10",
                          )}
                          aria-label="Opções da mensagem"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="min-w-[10rem] border-white/10 bg-zinc-900 text-zinc-100"
                      >
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer focus:bg-white/10"
                          onSelect={() =>
                            setTimeout(() => openEditMessage(msg), 0)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-300"
                          onSelect={() =>
                            setTimeout(() => {
                              setDeleteMessageId(msg.id);
                              setDeleteDialogOpen(true);
                            }, 0)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                          Apagar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <p className="text-[9px] mt-1 text-right opacity-70">
                  {msg.time}
                  {msg.edited && !msg.isDeleted ? " · editado" : ""}
                </p>
              </div>
            ) : (
              <div className="max-w-[85%] space-y-1 relative">
                {msg.sender === "me" && (
                  <div className="absolute -top-1 right-0 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-amber-500/90 hover:bg-amber-500/15"
                          aria-label="Opções da mensagem"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="min-w-[10rem] border-white/10 bg-zinc-900 text-zinc-100"
                      >
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-300"
                          onSelect={() =>
                            setTimeout(() => {
                              setDeleteMessageId(msg.id);
                              setDeleteDialogOpen(true);
                            }, 0)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                          Apagar oferta
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
                <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/5 p-1 w-64">
                  <div className="relative aspect-square overflow-hidden rounded-xl">
                    {msg.paid.type === "video" ? (
                      <video
                        src={msg.paid.mediaUrl}
                        className="w-full h-full object-cover blur-2xl opacity-40"
                        muted
                        loop
                        autoPlay
                        playsInline
                      />
                    ) : (
                      <img
                        src={msg.paid.mediaUrl}
                        alt={msg.paid.description}
                        className="w-full h-full object-cover blur-2xl opacity-40"
                      />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                      <Lock className="h-8 w-8 text-amber-500 mb-2" />
                      <p className="text-[10px] font-bold text-amber-500 uppercase px-2 text-center">
                        Conteúdo privado
                      </p>
                      <p className="text-[10px] text-white/80 mt-1 px-2 text-center line-clamp-2">
                        {msg.paid.description}
                      </p>
                    </div>
                  </div>
                  {msg.sender === "me" ? (
                    <div className="w-full mt-1 bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold h-9 text-xs rounded-lg flex items-center justify-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Oferta enviada
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => handleBuyContent(msg.paid.contentId)}
                      className="w-full mt-1 bg-amber-500 hover:bg-amber-600 text-black font-bold h-9 text-xs"
                    >
                      Desbloquear — MZN {msg.paid.price.toFixed(2)}
                    </Button>
                  )}
                </div>
                <p
                  className={`text-[9px] opacity-70 ${msg.sender === "me" ? "text-right" : "text-left"}`}
                >
                  {msg.time}
                </p>
              </div>
            )}
          </div>
        ))}
        {otherUserTyping && (
          <div className="flex justify-start px-1">
            <p
              className={cn(
                "text-xs italic",
                isMessagesRoute ? "text-zinc-500" : "text-muted-foreground",
              )}
            >
              A escrever…
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div
        className={cn(
          "p-4 border-t bg-background shrink-0",
          isMessagesRoute && "border-white/[0.06] bg-[#121212]",
        )}
      >
        <div className="max-w-5xl mx-auto space-y-3">
          {isCreator && showContentPicker && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 max-h-56 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Da tua biblioteca
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowContentPicker(false)}
                >
                  Fechar
                </Button>
              </div>
              {loadingContents ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  A carregar…
                </div>
              ) : creatorContents.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Ainda não tens conteúdos publicados.
                </p>
              ) : (
                <div className="space-y-2">
                  {creatorContents.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      disabled={sending}
                      onClick={() => sendPaidContentDoc(c)}
                      className="w-full text-left p-2 rounded-lg border border-border hover:border-amber-500/40 hover:bg-secondary/60 transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs truncate">
                          {c.description || "Sem descrição"}
                        </span>
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 shrink-0">
                          MZN {Number(c.price || 0).toFixed(2)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {isCreator && (
            <>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onPhotoInputChange}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="sr-only"
                onChange={onVideoInputChange}
              />
            </>
          )}

          <div className="flex items-center gap-0.5 rounded-full border border-zinc-700/80 bg-zinc-900/95 pl-2 pr-2 py-2 min-h-[52px] dark:border-white/[0.06] dark:bg-[#1e1e1e]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08]"
                  aria-label="Anexar"
                >
                  <Plus className="h-[22px] w-[22px] stroke-[2]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="min-w-[14rem] bg-zinc-900 text-zinc-100 border-white/10"
              >
                {isCreator ? (
                  <>
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer focus:bg-white/10"
                      onSelect={() =>
                        setTimeout(() => photoInputRef.current?.click(), 0)
                      }
                    >
                      <Image className="h-4 w-4" />
                      Carregar fotografia
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer focus:bg-white/10"
                      onSelect={() =>
                        setTimeout(() => videoInputRef.current?.click(), 0)
                      }
                    >
                      <Video className="h-4 w-4" />
                      Carregar vídeo
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer focus:bg-white/10"
                      onSelect={() =>
                        setTimeout(() => setShowContentPicker((p) => !p), 0)
                      }
                    >
                      <Library className="h-4 w-4" />
                      Da biblioteca (venda)
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem disabled className="text-zinc-500">
                    Anexos apenas para criadores
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08]"
                  aria-label="Escolher emoji"
                  aria-expanded={emojiPickerOpen}
                >
                  <Smile className="h-[22px] w-[22px] stroke-[1.75]" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="start"
                sideOffset={10}
                className="w-[min(calc(100vw-2rem),18.5rem)] border-white/10 bg-zinc-900 p-3 text-zinc-100 shadow-xl"
              >
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  Emojis
                </p>
                <div className="grid max-h-[14rem] grid-cols-8 gap-0.5 overflow-y-auto overscroll-contain pr-1 [scrollbar-gutter:stable]">
                  {CHAT_EMOJIS.map((emoji, i) => (
                    <button
                      key={`${emoji}-${i}`}
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-xl leading-none transition-colors hover:bg-white/10 active:bg-white/15"
                      onClick={() => {
                        setNewMessage((prev) => prev + emoji);
                        setEmojiPickerOpen(false);
                        requestAnimationFrame(() =>
                          messageInputRef.current?.focus(),
                        );
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Input
              ref={messageInputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSend()
              }
              placeholder="Escreva uma mensagem..."
              className="flex-1 min-w-0 h-10 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] text-zinc-100 placeholder:text-zinc-500 px-2"
            />

            <Button
              type="button"
              size="icon"
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="h-11 w-11 shrink-0 rounded-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white border-0 shadow-none disabled:opacity-35 disabled:pointer-events-none active:scale-[0.97] transition-transform"
            >
              {sending ? (
                <Loader2 className="h-[18px] w-[18px] animate-spin" />
              ) : (
                <Send className="h-[18px] w-[18px] ml-px" strokeWidth={2.25} />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

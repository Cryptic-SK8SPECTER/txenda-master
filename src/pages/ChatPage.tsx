import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Phone,
  Video,
  MoreVertical,
  Image,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useRef, useEffect } from "react";
import { chatService } from "@/services/chatService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { basicUrl } from "@/utils/index";

interface Message {
  id: string;
  text: string;
  sender: "me" | "them";
  time: string;
}

const ChatPage = () => {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      if (!routeId || !currentUser) return;

      try {
        setLoading(true);
        const chatRes = await chatService.getOrCreateChat(routeId);

        if (chatRes?.data) {
          const chat = chatRes.data;
          setActiveChatId(chat._id);

          // Comparação segura convertendo para String
          const currentId = String(currentUser._id);
          const otherUser = chat.participants?.find(
            (p: any) => String(p._id) !== currentId,
          );

          setRecipient(otherUser || null);

          const msgRes = await chatService.loadMessages(chat._id);

          if (Array.isArray(msgRes?.data)) {
            const formatted = msgRes.data.map((msg: any) => ({
              id: msg._id,
              text: msg.content || "",
              sender: String(msg.sender) === currentId ? "me" : "them",
              time: msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--:--",
            }));
            setMessages(formatted);
          }
        }
      } catch (err) {
        console.error("ERRO NO INIT CHAT:", err);
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [routeId, currentUser?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeChatId) return;
    try {
      setSending(true);
      const res = await chatService.sendMessage(activeChatId, newMessage);
      const sentMsg: Message = {
        id: res.data._id,
        text: res.data.content,
        sender: "me",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, sentMsg]);
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

  // Se o carregamento terminou mas não temos recipient, algo falhou na lógica do otherUser
  if (!loading && !recipient) {
    return <div className="p-10 text-center">Usuário não encontrado.</div>;
  }

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground italic">
          Conectando ao chat...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background/80 backdrop-blur-xl shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
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
          <p className="font-semibold text-sm truncate">
            {recipient?.name || "Utilizador"}
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${recipient?.isOnline ? "bg-green-500" : "bg-muted-foreground/30"}`}
            />
            <p className="text-[10px] text-muted-foreground uppercase">
              {recipient?.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-10 opacity-50">
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
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                msg.sender === "me"
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-secondary text-foreground rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-[9px] mt-1 text-right opacity-70`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-background shrink-0">
        <div className="flex items-center gap-2 max-w-5xl mx-auto">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Escreva algo..."
            className="bg-secondary/40 border-none h-11"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="h-11 w-11 rounded-xl"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

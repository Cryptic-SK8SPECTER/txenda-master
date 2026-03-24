import React, { useEffect, useRef, useState } from "react";
import {
  Send,
  Plus,
  Image,
  Video,
  MoreVertical,
  ShieldCheck,
  Gem,
  Lock,
  CheckCheck,
  Smile,
  Mic,
  Square,
  Loader2,
  Library,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useAuth } from "@/context/AuthContext";
import { contentService } from "@/services/contentService";
import { purchaseService } from "@/services/purchaseService";
import { useToast } from "@/hooks/use-toast";
import { basicUrl } from "@/utils/index";
import { isContentCreator } from "@/utils/userRole";

type ChatMessage = {
  id: string;
  sender: "me" | "them";
  type: "text" | "audio" | "paidContent";
  text?: string;
  audioUrl?: string;
  paidContent?: {
    contentId: string;
    description: string;
    price: number;
    type: "photo" | "video";
    mediaUrl: string;
  };
  time: string;
};

const Chat = () => {
  const { planTier, user, profile } = useAuth();
  const { toast } = useToast();
  const userPlan = planTier === "free" ? "standard" : (planTier as "standard" | "premium" | "vip");
  const [messagesLeft] = useState(3); // Apenas para plano Standard
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "them",
      type: "text",
      text: "Olá! Vi que estavas por perto. Gostarias de ver algo especial hoje? 😉",
      time: "14:20",
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [creatorContents, setCreatorContents] = useState<any[]>([]);
  const [loadingContents, setLoadingContents] = useState(false);
  const [showContentPicker, setShowContentPicker] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadPrice, setUploadPrice] = useState<string>("0");
  const [uploadVisibility, setUploadVisibility] = useState<string>("Pago individualmente");
  const [isUploadingContent, setIsUploadingContent] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const isCreator = isContentCreator(user);

  useEffect(() => {
    const loadCreatorContents = async () => {
      if (!isCreator) return;
      try {
        setLoadingContents(true);
        const res = await contentService.getMyContents(1, 20);
        const items = res?.data?.data || [];
        setCreatorContents(items);
      } catch (error) {
        console.error("Erro ao carregar conteúdos do criador:", error);
      } finally {
        setLoadingContents(false);
      }
    };

    loadCreatorContents();
  }, [isCreator]);

  const nowTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleSendText = () => {
    if (!newMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: "me",
        type: "text",
        text: newMessage.trim(),
        time: nowTime(),
      },
    ]);
    setNewMessage("");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        setIsProcessingAudio(true);
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const audioUrl = URL.createObjectURL(audioBlob);

          setMessages((prev) => [
            ...prev,
            {
              id: `audio-${Date.now()}`,
              sender: "me",
              type: "audio",
              audioUrl,
              time: nowTime(),
            },
          ]);
        } finally {
          stream.getTracks().forEach((t) => t.stop());
          setIsProcessingAudio(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Microfone indisponível",
        description: "Permita acesso ao microfone para enviar áudio.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const handleSendPaidContent = (content: any) => {
    const mediaUrl = `${basicUrl}img/contents/${content.url}`;
    setMessages((prev) => [
      ...prev,
      {
        id: `paid-${Date.now()}`,
        sender: "me",
        type: "paidContent",
        paidContent: {
          contentId: content._id,
          description: content.description || "Conteúdo premium",
          price: Number(content.price || 0),
          type: content.type === "video" ? "video" : "photo",
          mediaUrl,
        },
        time: nowTime(),
      },
    ]);
    setShowContentPicker(false);
    toast({
      title: "Conteúdo enviado",
      description: "O conteúdo pago foi enviado no chat.",
    });
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
        description: error?.response?.data?.message || "Não foi possível iniciar o checkout no Stripe.",
        variant: "destructive",
      });
    }
  };

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

  const submitChatUpload = async () => {
    if (!pendingFile || !uploadDescription.trim()) {
      toast({
        title: "Descrição obrigatória",
        description: "Indique uma descrição para o conteúdo.",
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
      if (!doc?._id) throw new Error("Resposta inválida do servidor");
      const mediaUrl = `${basicUrl}img/contents/${doc.url}`;
      setMessages((prev) => [
        ...prev,
        {
          id: `paid-${Date.now()}`,
          sender: "me",
          type: "paidContent",
          paidContent: {
            contentId: doc._id,
            description: doc.description || uploadDescription.trim(),
            price: Number(doc.price ?? uploadPrice ?? 0),
            type: doc.type === "video" ? "video" : "photo",
            mediaUrl,
          },
          time: nowTime(),
        },
      ]);
      const refreshed = await contentService.getMyContents(1, 20);
      setCreatorContents(refreshed?.data?.data || []);
      toast({
        title: "Conteúdo carregado",
        description: "O ficheiro foi publicado e enviado no chat.",
      });
      resetUploadDialog();
    } catch (error: any) {
      toast({
        title: "Erro ao carregar",
        description:
          error?.response?.data?.message || error?.message || "Não foi possível enviar o ficheiro.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingContent(false);
    }
  };

  const pendingIsVideo = pendingFile?.type.startsWith("video");

  const meAvatarSrc = profile?.photo
    ? `${basicUrl}img/users/${profile.photo}`
    : undefined;
  const meInitial = user?.name?.[0] ?? "E";

  return (
      <>
          <Dialog
            open={uploadDialogOpen}
            onOpenChange={(open) => {
              if (!open) resetUploadDialog();
            }}
          >
            <DialogContent className="sm:max-w-md border-white/10 bg-card">
              <DialogHeader>
                <DialogTitle>Carregar conteúdo</DialogTitle>
                <DialogDescription>
                  {pendingIsVideo ? "Vídeo" : "Fotografia"} — preencha os dados e envie para a conversa.
                </DialogDescription>
              </DialogHeader>
              {previewUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black">
                  {pendingIsVideo ? (
                    <video src={previewUrl} className="h-full w-full object-contain" controls muted playsInline />
                  ) : (
                    <img src={previewUrl} alt="Pré-visualização" className="h-full w-full object-contain" />
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
                    className="bg-white/5 border-white/10"
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
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Visibilidade</Label>
                  <Select value={uploadVisibility} onValueChange={setUploadVisibility}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pago individualmente">Pago individualmente</SelectItem>
                      <SelectItem value="Exclusivo assinantes">Exclusivo assinantes</SelectItem>
                      <SelectItem value="Público">Público</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={resetUploadDialog} disabled={isUploadingContent}>
                  Cancelar
                </Button>
                <Button type="button" onClick={submitChatUpload} disabled={isUploadingContent}>
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

          <div className="flex flex-col h-[100dvh] max-h-[100dvh] min-h-0 w-full relative overflow-hidden bg-[#121212] text-zinc-100">
            <div
              className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.1]"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=70)",
              }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[#121212]/[0.94]"
              aria-hidden
            />

            <div className="relative z-10 flex flex-col h-full min-h-0 flex-1">
              <header className="px-4 py-3.5 border-b border-white/[0.05] bg-[#121212]/90 backdrop-blur-sm flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border border-white/10 shadow-lg shadow-black/40">
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150" />
                      <AvatarFallback className="bg-zinc-800 text-zinc-200">V</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 border-2 border-[#0a0a0c] rounded-full" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-semibold text-sm text-white tracking-tight">Valentina</h2>
                      <Gem className="h-3.5 w-3.5 text-amber-400/90" />
                      <ShieldCheck className="h-3.5 w-3.5 text-sky-400/90" />
                    </div>
                    <p className="text-[10px] text-emerald-400/90 font-medium uppercase tracking-wider">
                      Online agora
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-full"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-zinc-900 border-white/10 text-zinc-100"
                  >
                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white">
                      Ver Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white">
                      Limpar Conversa
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-white/10 focus:text-red-400 text-red-400">
                      Bloquear e Denunciar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </header>

              <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-4 [scrollbar-gutter:stable]">
                  <div className="w-full max-w-2xl mx-auto space-y-4 pb-6">
                    <div className="flex justify-center">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 bg-[#1a1a1a] px-3 py-1 rounded-full border border-white/[0.04]">
                        Hoje
                      </span>
                    </div>

                    {messages.map((msg) => {
                      const isMe = msg.sender === "me";
                      const bubbleClass =
                        "rounded-2xl px-3.5 py-2.5 bg-[#2a2a2a] text-zinc-100 border-0 shadow-none";

                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2.5 items-end w-full max-w-[min(100%,32rem)] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                        >
                          <Avatar className="h-9 w-9 shrink-0 ring-0 border-0">
                            {isMe ? (
                              <>
                                {meAvatarSrc ? (
                                  <AvatarImage src={meAvatarSrc} className="object-cover" />
                                ) : null}
                                <AvatarFallback className="bg-violet-900/60 text-[11px] font-medium text-violet-100">
                                  {meInitial}
                                </AvatarFallback>
                              </>
                            ) : (
                              <>
                                <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100" />
                                <AvatarFallback className="bg-zinc-800">V</AvatarFallback>
                              </>
                            )}
                          </Avatar>

                          <div className="flex flex-col gap-1 min-w-0">
                            {msg.type === "text" && (
                              <div className={bubbleClass}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                <div
                                  className={`flex items-center gap-1 mt-1.5 ${isMe ? "justify-end" : "justify-start"}`}
                                >
                                  <span className="text-[10px] text-zinc-500 tabular-nums">{msg.time}</span>
                                  {isMe && <CheckCheck className="h-3 w-3 text-zinc-500" />}
                                </div>
                              </div>
                            )}

                            {msg.type === "audio" && (
                              <div className={`${bubbleClass} max-w-[16.5rem]`}>
                                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">Áudio</p>
                                <audio controls src={msg.audioUrl} className="w-full max-w-full h-8" />
                                <div className={`flex items-center gap-1 mt-2 ${isMe ? "justify-end" : "justify-start"}`}>
                                  <span className="text-[9px] text-zinc-500">{msg.time}</span>
                                  {isMe && <CheckCheck className="h-3 w-3 text-zinc-500" />}
                                </div>
                              </div>
                            )}

                            {msg.type === "paidContent" && msg.paidContent && (
                              <div className="w-64 max-w-[85vw] space-y-1">
                                <div className="relative overflow-hidden rounded-[1.25rem] border border-amber-500/25 bg-zinc-900/80 p-1">
                                  <div className="relative aspect-square overflow-hidden rounded-xl">
                                    {msg.paidContent.type === "video" ? (
                                      <video
                                        src={msg.paidContent.mediaUrl}
                                        className="w-full h-full object-cover blur-2xl opacity-40"
                                        muted
                                        loop
                                        autoPlay
                                        playsInline
                                      />
                                    ) : (
                                      <img
                                        src={msg.paidContent.mediaUrl}
                                        className="w-full h-full object-cover blur-2xl opacity-40"
                                        alt={msg.paidContent.description}
                                      />
                                    )}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45">
                                      <Lock className="h-7 w-7 text-amber-400 mb-1.5" />
                                      <p className="text-[10px] font-semibold text-amber-400/95 uppercase tracking-wide">
                                        Conteúdo privado
                                      </p>
                                    </div>
                                  </div>
                                  {isMe ? (
                                    <div className="w-full mt-1 bg-amber-500/15 text-amber-300 font-semibold h-9 text-xs rounded-lg flex items-center justify-center border border-amber-500/20">
                                      Conteúdo enviado
                                    </div>
                                  ) : (
                                    <Button
                                      onClick={() => handleBuyContent(msg.paidContent!.contentId)}
                                      className="w-full mt-1 h-9 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 border-0"
                                    >
                                      Desbloquear — MZN {msg.paidContent.price.toFixed(2)}
                                    </Button>
                                  )}
                                </div>
                                <div className={`flex items-center gap-1 px-0.5 ${isMe ? "justify-end" : "justify-start"}`}>
                                  <span className="text-[9px] text-zinc-500">{msg.time}</span>
                                  {isMe && <CheckCheck className="h-3 w-3 text-zinc-500" />}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {userPlan === "standard" && (
                  <div className="shrink-0 px-4 py-2 border-t border-violet-500/15 bg-violet-950/25 flex items-center justify-between gap-2">
                    <p className="text-[10px] font-medium text-violet-200/80 uppercase tracking-tight">
                      Restam <strong className="text-violet-100">{messagesLeft}</strong> mensagens hoje (Standard)
                    </p>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-[10px] text-violet-300 font-semibold underline shrink-0"
                    >
                      Premium →
                    </Button>
                  </div>
                )}
              </main>

              <footer className="shrink-0 px-4 pb-5 pt-3 border-t border-white/[0.05] bg-[#121212]">
                <div className="w-full max-w-2xl mx-auto space-y-3">
                  {showContentPicker && isCreator && (
                    <div className="rounded-2xl border border-amber-500/25 bg-zinc-900/70 p-3 max-h-48 overflow-y-auto backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-amber-300">Biblioteca</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-zinc-400 hover:text-white"
                          onClick={() => setShowContentPicker(false)}
                        >
                          Fechar
                        </Button>
                      </div>
                      {loadingContents ? (
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          A carregar…
                        </div>
                      ) : creatorContents.length === 0 ? (
                        <p className="text-xs text-zinc-500">Sem conteúdos publicados.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {creatorContents.map((c) => (
                            <button
                              key={c._id}
                              type="button"
                              onClick={() => handleSendPaidContent(c)}
                              className="w-full text-left p-2 rounded-xl border border-white/[0.06] hover:border-amber-500/35 hover:bg-white/[0.04] transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-zinc-200 truncate">
                                  {c.description || "Sem descrição"}
                                </span>
                                <span className="text-[10px] font-bold text-amber-400 shrink-0">
                                  MZN {Number(c.price || 0).toFixed(2)}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

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

                  <div className="flex items-center gap-0.5 rounded-full bg-[#1e1e1e] border border-white/[0.06] pl-2 pr-2 py-2 min-h-[52px]">
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
                        className="bg-zinc-900 border-white/10 text-zinc-100 min-w-[13.5rem]"
                      >
                        {isCreator ? (
                          <>
                            <DropdownMenuItem
                              className="focus:bg-white/10 gap-2 cursor-pointer"
                              onSelect={() => setTimeout(() => photoInputRef.current?.click(), 0)}
                            >
                              <Image className="h-4 w-4" /> Fotografia
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="focus:bg-white/10 gap-2 cursor-pointer"
                              onSelect={() => setTimeout(() => videoInputRef.current?.click(), 0)}
                            >
                              <Video className="h-4 w-4" /> Vídeo
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="focus:bg-white/10 gap-2 cursor-pointer"
                              onSelect={() => setTimeout(() => setShowContentPicker((p) => !p), 0)}
                            >
                              <Library className="h-4 w-4" /> Da biblioteca (venda)
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem disabled className="text-zinc-500">
                            Anexos apenas para criadores
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="focus:bg-white/10 gap-2 cursor-pointer"
                          onSelect={() =>
                            setTimeout(() => {
                              if (isRecording) stopRecording();
                              else startRecording();
                            }, 0)
                          }
                        >
                          {isRecording ? (
                            <>
                              <Square className="h-4 w-4" /> Parar gravação
                            </>
                          ) : (
                            <>
                              <Mic className="h-4 w-4" /> Gravar áudio
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 shrink-0 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08]"
                      aria-label="Emoji"
                    >
                      <Smile className="h-[22px] w-[22px] stroke-[1.75]" />
                    </Button>

                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) handleSendText();
                      }}
                      placeholder="Escreva uma mensagem..."
                      className="flex-1 min-w-0 h-10 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] leading-normal text-zinc-100 placeholder:text-zinc-500 px-2"
                    />

                    <Button
                      type="button"
                      size="icon"
                      onClick={handleSendText}
                      disabled={!newMessage.trim()}
                      className="h-11 w-11 shrink-0 rounded-full bg-[#7c3aed] hover:bg-[#6d28d9] active:scale-[0.97] text-white border-0 disabled:opacity-35 disabled:pointer-events-none transition-transform"
                    >
                      <Send className="h-[18px] w-[18px] ml-px" strokeWidth={2.25} />
                    </Button>
                  </div>

                  {isProcessingAudio && (
                    <p className="text-center text-[10px] text-zinc-500">A processar áudio…</p>
                  )}
                </div>
              </footer>
            </div>
          </div>

      </>
  );
};

export default Chat;

import React, { useState } from "react";
import {
  Send,
  Plus,
  Image,
  Film,
  MapPin,
  MoreVertical,
  ShieldCheck,
  Gem,
  Lock,
  CheckCheck,
  Smile,
  DollarSign,
  Calendar,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";

const Chat = () => {
  const { planTier } = useAuth();
  const userPlan = planTier === "free" ? "standard" : (planTier as "standard" | "premium" | "vip");
  const [messagesLeft] = useState(3); // Apenas para plano Standard

  return (
      <>


          {/* 1️⃣ Header do Chat */}
          <header className="px-4 py-3 border-b border-white/5 bg-card/20 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 border border-primary/20">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150" />
                  <AvatarFallback>VT</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-sm">Valentina</h2>
                  <Gem className="h-3.5 w-3.5 text-amber-500" />
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <p className="text-[10px] text-green-500 font-medium uppercase tracking-wider">
                  Online agora
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-white"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#1a1a1a] border-white/10 text-white"
              >
                <DropdownMenuItem className="focus:bg-white/5 focus:text-white">
                  Ver Perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/5 focus:text-white">
                  Limpar Conversa
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/5 focus:text-red-400 text-red-400">
                  Bloquear e Denunciar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* 2️⃣ Área de Mensagens */}
          <main className="flex-1 overflow-hidden flex flex-col relative">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="flex justify-center">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
                    Hoje
                  </span>
                </div>

                {/* Mensagem Recebida */}
                <div className="flex gap-3 max-w-[85%]">
                  <div className="flex flex-col gap-1">
                    <div className="bg-secondary/40 backdrop-blur-sm p-3 rounded-2xl rounded-tl-none border border-white/5">
                      <p className="text-sm leading-relaxed">
                        Olá! Vi que estavas por perto. Gostarias de ver algo
                        especial hoje? 😉
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground ml-1">
                      14:20
                    </span>
                  </div>
                </div>

                {/* 4️⃣ Conteúdo Pago (Blur) */}
                <div className="flex gap-3 max-w-[85%]">
                  <div className="flex flex-col gap-2">
                    <div className="relative group overflow-hidden rounded-2xl rounded-tl-none border border-amber-500/30 bg-amber-500/5 p-1">
                      <div className="relative aspect-square w-48 md:w-64 overflow-hidden rounded-xl">
                        <img
                          src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=400"
                          className="w-full h-full object-cover blur-2xl opacity-40"
                          alt="Premium Content"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                          <Lock className="h-8 w-8 text-amber-500 mb-2" />
                          <p className="text-[10px] font-bold text-amber-500 uppercase">
                            Conteúdo Privado
                          </p>
                        </div>
                      </div>
                      <Button className="w-full mt-1 bg-amber-500 hover:bg-amber-600 text-black font-bold h-9 text-xs">
                        Desbloquear por MZN5,00
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                      <Info className="h-3 w-3" /> Foto exclusiva de bastidores
                    </p>
                  </div>
                </div>

                {/* Mensagem do Usuário */}
                <div className="flex flex-row-reverse gap-3 max-w-[85%] ml-auto">
                  <div className="flex flex-col gap-1 items-end">
                    <div className="bg-primary p-3 rounded-2xl rounded-tr-none shadow-lg shadow-primary/10">
                      <p className="text-sm text-white font-medium">
                        Com certeza! O que tens em mente?
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">
                        14:22
                      </span>
                      <CheckCheck className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Envio de Localização */}
                <div className="flex flex-row-reverse gap-3 max-w-[85%] ml-auto">
                  <div className="bg-primary/10 border border-primary/20 p-2 rounded-2xl rounded-tr-none w-48 overflow-hidden">
                    <div className="h-24 bg-secondary/50 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden">
                      <MapPin className="h-6 w-6 text-primary absolute z-10" />
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                    </div>
                    <p className="text-[10px] font-medium text-center text-primary-foreground/70">
                      Localização Aproximada
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* 6️⃣ Indicador de Plano (Standard / Free) */}
            {userPlan === "standard" && (
              <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/20 flex items-center justify-between">
                <p className="text-[10px] font-medium text-amber-500 uppercase tracking-tighter">
                  Resta(m) <strong>{messagesLeft} mensagens</strong> hoje no
                  plano Standard
                </p>
                <Button
                  variant="link"
                  className="h-auto p-0 text-[10px] text-amber-500 font-bold underline"
                >
                  Tornar-se Premium →
                </Button>
              </div>
            )}
          </main>

          {/* 5️⃣ Barra Inferior Fixa */}
          <footer className="p-4 bg-card/40 backdrop-blur-xl border-t border-white/5">
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full text-muted-foreground"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full text-muted-foreground"
                  >
                    <Image className="h-5 w-5" />
                  </Button>
                </div>

                <div className="relative flex-1">
                  <Input
                    placeholder="Escreva uma mensagem..."
                    className="h-11 bg-white/5 border-white/10 rounded-2xl pr-10 focus-visible:ring-primary/50"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-9 w-9 text-muted-foreground"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                </div>

                <Button className="h-11 w-11 rounded-full p-0 shadow-lg shadow-primary/20">
                  <Send className="h-5 w-5 ml-0.5" />
                </Button>
              </div>

              {/* Atalhos Rápidos de Marketplace */}
              <div className="flex gap-2 pb-2 md:pb-0">
                <Badge
                  variant="outline"
                  className="bg-amber-500/5 text-amber-500 border-amber-500/20 gap-1.5 py-1.5 cursor-pointer hover:bg-amber-500/10 transition-colors"
                >
                  <DollarSign className="h-3 w-3" /> Enviar Conteúdo Pago
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-primary/5 text-primary border-primary/20 gap-1.5 py-1.5 cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  <Calendar className="h-3 w-3" /> Propor Encontro
                </Badge>
              </div>
            </div>
          </footer>

      </>
  );
};

export default Chat;

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  ArrowRight,
  PartyPopper,
  Sparkles,
  ShieldCheck,
  LayoutDashboard,
  PlayCircle,
  Gem,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Detetar o tipo de sucesso vindo do Stripe
  const status = searchParams.get("status");
  const isSubscription = status === "success";
  const isPurchase = status === "payment_success";

  useEffect(() => {
    // Disparar confetis ao carregar
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[140px] rounded-full -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 border-border/40 bg-card/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          {/* Header Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="flex flex-col items-center text-center space-y-6">
            {/* Ícone de Sucesso */}
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="bg-primary/20 p-5 rounded-full"
              >
                <CheckCircle2 className="h-14 w-14 text-primary" />
              </motion.div>
              <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-amber-500 animate-pulse" />
            </div>

            <div className="space-y-2">
              <Badge
                variant="outline"
                className="border-primary/50 text-primary px-3 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-black"
              >
                Pagamento Concluído
              </Badge>
              <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                {isSubscription
                  ? "Acesso Premium Ativo!"
                  : "Conteúdo Desbloqueado!"}
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {isSubscription
                  ? "Parabéns! Agora fazes parte do círculo restrito. O teu selo de verificado já está visível no teu perfil."
                  : "O pagamento foi processado. Já podes desfrutar do conteúdo exclusivo que acabaste de adquirir."}
              </p>
            </div>

            {/* Caixa de Info */}
            <div className="w-full bg-black/20 rounded-2xl p-4 border border-white/5 space-y-3">
              <div className="flex items-center gap-3 text-left">
                <div className="bg-primary/10 p-2 rounded-lg">
                  {isSubscription ? (
                    <Gem className="h-4 w-4 text-primary" />
                  ) : (
                    <PlayCircle className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white uppercase tracking-wider">
                    {isSubscription ? "Plano Ativo" : "Novo Item na Biblioteca"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Atualizado instantaneamente via Stripe
                  </p>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col w-full gap-3 pt-4">
              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl gap-2 shadow-lg shadow-primary/20 group"
              >
                Ir para o Dashboard
                <LayoutDashboard className="h-4 w-4 transition-transform group-hover:rotate-6" />
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                Explorar mais conteúdos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Footer Discreto */}
      <div className="absolute bottom-8 flex items-center gap-2 opacity-30">
        <ShieldCheck className="h-3 w-3" />
        <span className="text-[10px] uppercase tracking-[0.3em]">
          Ambiente Seguro & Encriptado
        </span>
      </div>
    </div>
  );
};

export default SuccessPage;

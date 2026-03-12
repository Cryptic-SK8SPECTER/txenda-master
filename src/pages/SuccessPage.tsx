import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  ArrowRight,
  PartyPopper,
  Sparkles,
  ShieldCheck,
  LayoutDashboard,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  // Detetar o tipo de sucesso vindo do Stripe
  const status = searchParams.get("status");
  const isSubscription = status === "success";
  const isPurchase = status === "payment_success";

  useEffect(() => {
    setIsAnimating(true);
    // Poderias adicionar aqui uma chamada ao backend para atualizar o estado local do user,
    // embora o Webhook já o tenha feito no servidor.
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden relative">
      {/* Efeitos de Fundo (Glow) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10" />

      <Card className="max-w-md w-full p-8 border-border/50 bg-card/50 backdrop-blur-xl relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
        {/* Barra de Progresso Decorativa */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-muted">
          <div className="h-full bg-primary animate-out slide-out-to-right-full duration-1000 fill-mode-forwards" />
        </div>

        <div className="flex flex-col items-center text-center space-y-6">
          {/* Ícone Animado */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative bg-primary/10 p-4 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <PartyPopper className="absolute -top-2 -right-2 h-6 w-6 text-amber-500 animate-bounce" />
          </div>

          {/* Texto de Sucesso */}
          <div className="space-y-2">
            <Badge
              variant="outline"
              className="border-primary/50 text-primary px-3 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-bold"
            >
              Pagamento Confirmado
            </Badge>
            <h1 className="text-3xl font-display font-bold text-white">
              {isSubscription ? "Bem-vindo ao Clube!" : "Acesso Desbloqueado!"}
            </h1>
            <p className="text-muted-foreground text-sm">
              O teu pagamento foi processado com sucesso através do Stripe.
              {isSubscription
                ? "Agora tens acesso total às vantagens exclusivas do teu plano."
                : "O conteúdo já está disponível na tua biblioteca pessoal."}
            </p>
          </div>

          {/* Lista de Confirmação Rápida */}
          <div className="w-full bg-secondary/30 rounded-xl p-4 space-y-3 border border-white/5">
            <div className="flex items-center gap-3 text-xs text-left">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                Transação encriptada e segura
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-left">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-muted-foreground">
                Selo de Verificado Ativo
              </span>
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col w-full gap-3 pt-4">
            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl gap-2 transition-all hover:gap-3"
            >
              Ir para o Dashboard
              <LayoutDashboard className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate(isSubscription ? "/explore" : "/profile")}
              className="text-muted-foreground hover:text-white"
            >
              {isSubscription ? "Explorar Criadores" : "Ver Minhas Compras"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Rodapé Discreto */}
      <p className="absolute bottom-8 text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em]">
        Operação processada de forma anónima
      </p>
    </div>
  );
};

export default SuccessPage;

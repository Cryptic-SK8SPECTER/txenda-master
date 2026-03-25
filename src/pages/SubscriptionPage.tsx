import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Check,
  Crown,
  Zap,
  Infinity,
  Star,
  ShieldCheck,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { planService } from "@/services/planService";
import { customFetch } from "@/utils/index";


const SubscriptionPage = () => {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSub, setCurrentSub] = useState<any>(null);

  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // 1. Carregar todos os planos disponíveis
        const resPlans = await planService.getAllPlans();
        setPlans(resPlans.data);

        // 2. Se o utilizador estiver logado, carregar a subscrição ativa
        if (user?._id) {
          const resSub = await customFetch.get(
            `subscriptions/${user._id}`,
            { withCredentials: true },
          );
          // Armazenamos a subscrição para comparar IDs de plano depois
          setCurrentSub(resSub.data.data);
        }
      } catch (err) {
        console.error("Erro ao carregar dados da página:", err);
        toast({
          variant: "destructive",
          title: "Erro de carregamento",
          description:
            "Não foi possível carregar as informações de subscrição.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?._id, toast]);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Identificação Necessária",
        description: "Você precisa estar logado para adquirir um plano.",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/login")}
          >
            Fazer Login
          </Button>
        ),
      });
      return;
    }

    try {
      toast({
        title: "Processando...",
        description: "Estamos a preparar o seu checkout seguro.",
      });

      const response = await customFetch.get(
        `subscriptions/checkout-session/${planId}`,
        { withCredentials: true },
      );

      const { session } = response.data;

      if (session?.url) {
        window.location.href = session.url;
      } else {
        throw new Error("URL de checkout não encontrada.");
      }
    } catch (err: any) {
      console.error("Erro no checkout:", err);
      toast({
        variant: "destructive",
        title: "Erro no pagamento",
        description:
          err.response?.data?.message ||
          "Não foi possível iniciar o pagamento.",
      });
    }
  };

  const now = new Date();
  const startedAt = currentSub?.createdAt
    ? new Date(currentSub.createdAt)
    : now;
  const periodEndRaw =
    currentSub?.currentPeriodEnd ||
    currentSub?.endsAt ||
    currentSub?.expiresAt ||
    currentSub?.endDate;
  const endsAt = periodEndRaw ? new Date(periodEndRaw) : null;
  const cycleDays = 30;

  const elapsedDays = Math.max(
    0,
    Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const daysRemaining = endsAt
    ? Math.max(
      0,
      Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    )
    : Math.max(0, cycleDays - elapsedDays);
  const usedDays = Math.min(cycleDays, Math.max(0, cycleDays - daysRemaining));
  const progress = Math.min(100, Math.max(0, (usedDays / cycleDays) * 100));

  const isActivePlan = currentSub?.status === "active" && !!currentSub?.plan;
  const planName = currentSub?.plan?.name || "Básico";
  const planPrice = Number(currentSub?.plan?.price || 199);
  const planPriceText = `MZN ${planPrice.toLocaleString("pt-MZ")}`;
  const planNameLower = String(planName).toLowerCase();
  const isVipCurrent = planNameLower.includes("vip");
  const isPremiumCurrent = !isVipCurrent && planNameLower.includes("premium");
  const isStandardCurrent = !isVipCurrent && !isPremiumCurrent;

  const currentPlanBadge = isVipCurrent
    ? "VIP"
    : isPremiumCurrent
      ? "Premium"
      : "Standard";

  const planTone = isVipCurrent
    ? {
      panel: "border-amber-300/20 bg-amber-400/5",
      accentText: "text-amber-200",
      accentSoft: "text-amber-100/80",
      accentBg: "bg-amber-400/90",
      bar: "bg-amber-400/90",
        border: "border-amber-300/35",
      badge: "bg-amber-400/10 text-amber-200 border-amber-300/30",
      cta: "bg-amber-400/90 hover:bg-amber-400 text-black",
      alertTitle: "Seu plano VIP exige atenção!",
      alertMsg: "Mantenha os benefícios VIP atualizados para acesso máximo.",
    }
    : isPremiumCurrent
      ? {
        panel: "border-violet-300/20 bg-violet-400/5",
        accentText: "text-violet-200",
        accentSoft: "text-violet-100/80",
        accentBg: "bg-violet-400/90",
        bar: "bg-violet-400/90",
          border: "border-violet-300/35",
        badge: "bg-violet-400/10 text-violet-200 border-violet-300/30",
        cta: "bg-violet-400/90 hover:bg-violet-400 text-white",
        alertTitle: "Atenção ao seu plano Premium",
        alertMsg: "Atualize/renove para continuar com recursos Premium ativos.",
      }
      : {
        panel: "border-primary/20 bg-primary/5",
        accentText: "text-primary/90",
        accentSoft: "text-primary/80",
        accentBg: "bg-primary/90",
        bar: "bg-primary/90",
          border: "border-primary/35",
        badge: "bg-primary/10 text-primary/90 border-primary/25",
        cta: "",
        alertTitle: "Precisamos da sua atenção!",
        alertMsg: "O seu plano poderá precisar de atualização em breve.",
      };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto pb-24 md:pb-8 animate-in fade-in duration-700 bg-background">
      {/* Header */}
      <div className="text-center py-12 px-4 space-y-4">
        <Badge
          variant="outline"
          className="border-primary/50 text-primary px-4 py-1 rounded-full uppercase tracking-widest text-[10px] bg-primary/5"
        >
          Experiência Exclusive
        </Badge>
        <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
          Escolha seu nível de acesso
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Desbloqueie conexões reais e conteúdos de elite com total discrição e
          segurança.
        </p>
      </div>

      {/* Plano Atual (estilo painel informativo) */}
      {isActivePlan && (
        <section className="px-4 lg:px-8 max-w-6xl mx-auto mb-8">
          <div className="bg-background border border-border/50 rounded-2xl p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">Plano atual</p>
              <p className="text-sm text-muted-foreground">Acesso ativo com todos os benefícios deste nível.</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-medium text-foreground">{planName}</span>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${planTone.badge}`}>
                {currentPlanBadge}
              </span>
            </div>

            <div>
              <p className="text-[15px] font-medium text-foreground">
                Ativo até{" "}
                {endsAt
                  ? endsAt.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })
                  : "—"}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Avisaremos antes da expiração da subscrição.
              </p>
            </div>

            <div>
              <p className="text-3xl font-medium text-foreground">
                {planPriceText}{" "}
                <span className="text-base font-normal text-muted-foreground">/mês</span>
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Plano ideal para começar e crescer com segurança.
              </p>
            </div>

            <div className="border-t border-border/50 pt-5 flex flex-wrap gap-3">
              <Button
                onClick={() => navigate("/dashboard/subscription")}
                className="h-9 px-5 rounded-lg text-sm font-medium bg-foreground text-background hover:opacity-90 shadow-none"
              >
                Fazer upgrade
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/subscription/cancel")}
                className="h-9 px-5 rounded-lg text-sm font-medium border-red-300/40 text-red-500 hover:bg-red-500/10 hover:text-red-400"
              >
                Cancelar subscrição
              </Button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-5">
            <div className={`rounded-xl border p-4 flex gap-3 items-start ${planTone.panel}`}>
              <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5 bg-background/60 border ${planTone.border}`}>
                <AlertTriangle className={`h-4 w-4 ${planTone.accentText}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${planTone.accentText}`}>{planTone.alertTitle}</p>
                <p className={`text-sm mt-0.5 opacity-80 ${planTone.accentText}`}>{planTone.alertMsg}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Dias utilizados</span>
                <span className="text-sm text-muted-foreground">{usedDays} de {cycleDays} dias</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${planTone.bar}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Restam{" "}
                <span className="text-foreground font-medium">{daysRemaining} dias</span>{" "}
                para atualizar ou renovar o plano.
              </p>
            </div>
          </div>

          </div>
        </section>
      )}

      {/* Grid de Planos */}
      <div className="px-4 lg:px-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan: any) => {
          const isVIP =
            plan.name.toLowerCase().includes("vip") || plan.isPopular;
          const isPremium = plan.name.toLowerCase().includes("premium");
          const isStandard = !isVIP && !isPremium;

          // Lógica Crítica: Verifica se este plano é o plano atual ativo do utilizador
          const isCurrentPlan =
            currentSub?.plan?._id === plan._id &&
            currentSub?.status === "active";

          return (
            <Card
              key={plan._id}
              className={`relative p-8 flex flex-col transition-all duration-300 ${isVIP
                ? "bg-[#111] border-amber-500/50 shadow-[0_0_40px_-10px_rgba(245,158,11,0.2)] scale-105 z-10 overflow-hidden"
                : "bg-card/40 border-border backdrop-blur-sm hover:border-white/20"
                }`}
            >
              {isVIP && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-amber-500 text-black font-bold border-none shadow-lg">
                    RECOMENDADO
                  </Badge>
                </div>
              )}

              <div className="mb-8">
                {isVIP && (
                  <div className="flex items-center gap-2 text-amber-500 mb-1">
                    <Crown className="h-5 w-5 fill-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-tighter">
                      Ultimate Access
                    </span>
                  </div>
                )}
                <h3
                  className={`text-xl font-bold mb-2 ${isVIP ? "text-2xl font-black italic" : ""}`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-3xl font-bold ${isVIP ? "text-4xl text-amber-500" : ""}`}
                  >
                    MZN {plan.price.toLocaleString("pt-MZ")}
                  </span>
                  <span className="text-muted-foreground text-sm">/mês</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features?.map((feature: string, idx: number) => (
                  <BenefitItem
                    key={idx}
                    icon={
                      isVIP ? (
                        <Infinity className="text-amber-500 h-4 w-4" />
                      ) : (
                        <Check className="text-primary h-4 w-4" />
                      )
                    }
                    label={feature}
                    highlight={isVIP && idx < 3}
                  />
                ))}
              </ul>
              <Button
                onClick={() => handleSubscribe(plan._id)}
                disabled={isCurrentPlan} // Impede o erro 400 ao desativar o clique
                variant={
                  isCurrentPlan
                    ? "secondary"
                    : isStandard
                      ? "outline"
                      : "default"
                }
                className={`w-full h-12 rounded-xl font-bold transition-transform active:scale-95 ${isCurrentPlan
                  ? "opacity-80 cursor-default"
                  : isVIP
                    ? "bg-amber-500 hover:bg-amber-600 text-black"
                    : ""
                  }`}
              >
                {isCurrentPlan ? (
                  <>
                    Plano Atual
                    <Check />
                  </>
                ) : isVIP ? (
                  "Assinar Agora VIP"
                ) : (
                  "Escolher Plano"
                )}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Footer Trust */}
      <div className="mt-16 max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center border-t border-white/5 pt-12">
        <TrustItem
          icon={<ShieldCheck />}
          title="Pagamento Anónimo"
          desc="Faturação discreta em todos os extratos."
        />
        <TrustItem
          icon={<Star />}
          title="Conteúdo Curado"
          desc="Perfis e conteúdos verificados manualmente."
        />
        <TrustItem
          icon={<Zap />}
          title="Cancelamento Fácil"
          desc="Sem contratos, cancele online quando quiser."
        />
      </div>
    </main>
  );
};

const BenefitItem = ({ icon, label, highlight = false }: any) => (
  <li className="flex items-center gap-3 text-sm text-muted-foreground">
    <div className="flex-shrink-0">{icon}</div>
    <span className={highlight ? "text-white font-bold" : ""}>{label}</span>
  </li>
);

const TrustItem = ({ icon, title, desc }: any) => (
  <div className="flex flex-col items-center gap-2">
    <div className="text-muted-foreground opacity-50 scale-125 mb-1">
      {icon}
    </div>
    <h4 className="font-bold text-sm uppercase tracking-tighter">{title}</h4>
    <p className="text-xs text-muted-foreground text-balance">{desc}</p>
  </div>
);

export default SubscriptionPage;

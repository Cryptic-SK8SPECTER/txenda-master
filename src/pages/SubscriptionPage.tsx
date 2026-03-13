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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { planService } from "@/services/planService";
import axios from "axios";


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
          const resSub = await axios.get(
            `http://localhost:9000/api/v1/subscriptions/${user._id}`,
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

      const response = await axios.get(
        `http://localhost:9000/api/v1/subscriptions/checkout-session/${planId}`,
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

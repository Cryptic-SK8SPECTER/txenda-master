import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import {
  Check,
  Crown,
  Zap,
  Infinity,
  Star,
  ShieldCheck,
  Gem,

} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { planService } from "@/services/planService";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";

const stripePromise = loadStripe("pk_test_51T7TsvPkenJF9wWnwW6d7xzVyETjg7LBdfQ4Dp7CqZj47suCJ8rywUZqYJJ4fCEaqlgUp6T9U2gHbF86WrTGM7DV00c9EPETsW");

const SubscriptionPage = () => {

  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await planService.getAllPlans();
        // Ajuste conforme a estrutura da sua resposta (ex: res.data.data)
        setPlans(res.data);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os planos."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSubscribe = async (planId: string) => {
    try {
      toast({
        title: "Processando...",
        description: "Estamos a preparar o seu checkout seguro.",
      });
  
      // 1. Chamar o backend para criar a sessão
      const response = await axios.get(
        `http://localhost:9000/api/v1/subscriptions/checkout-session/${planId}`,
        { withCredentials: true }
      );
  
      // O Stripe agora devolve uma 'url' direta na sessão
      const { session } = response.data;
  
      if (session && session.url) {
        // 2. Redirecionamento direto via browser (não precisa mais do stripe.redirectToCheckout)
        window.location.href = session.url;
      } else {
        throw new Error("URL de checkout não encontrada.");
      }
  
    } catch (err: any) {
      console.error("Erro ao iniciar subscrição:", err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: err.response?.data?.message || "Erro ao conectar com o provedor de pagamento.",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#0a0a0a] text-white">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />

          <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
            {/* Header da Seção */}
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
                Desbloqueie conexões reais e conteúdos de elite com total
                discrição e segurança.
              </p>
            </div>

            {/* Grid de Planos */}
            <div className="px-4 lg:px-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan: any) => {
                // Lógica para definir estilos baseada no nome ou flag do plano vindo do BD
                const isVIP = plan.name.toLowerCase().includes('vip') || plan.isPopular;
                const isPremium = plan.name.toLowerCase().includes('premium');
                const isStandard = !isVIP && !isPremium;

                return (
                  <Card
                    key={plan._id}
                    className={`relative p-8 flex flex-col transition-colors ${isVIP
                        ? "bg-[#111] border-amber-500/50 shadow-[0_0_40px_-10px_rgba(245,158,11,0.2)] scale-105 z-10 overflow-hidden"
                        : "bg-card/40 border-border backdrop-blur-sm hover:border-white/20"
                      }`}
                  >
                    {/* Renderização condicional do brilho e Badge para VIP */}
                    {isVIP && (
                      <>
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 blur-[80px] rounded-full" />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-amber-500 text-black font-bold border-none">
                            RECOMENDADO
                          </Badge>
                        </div>
                      </>
                    )}

                    <div className="mb-8">
                      {isVIP && (
                        <div className="flex items-center gap-2 text-amber-500 mb-1">
                          <Crown className="h-5 w-5 fill-amber-500" />
                          <span className="text-xs font-bold uppercase tracking-tighter">Ultimate Access</span>
                        </div>
                      )}

                      <h3 className={`text-xl font-bold mb-2 ${isVIP ? "text-2xl font-black italic" : isPremium ? "text-primary" : ""}`}>
                        {plan.name}
                      </h3>

                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-bold ${isVIP ? "text-4xl font-black text-amber-500" : ""}`}>
                          MZN {plan.price.toLocaleString('pt-MZ')}
                        </span>
                        <span className="text-muted-foreground text-sm">/mês</span>
                      </div>
                    </div>

                    {/* Listagem de Benefícios vindos do Array 'features' do Model */}
                    <ul className="space-y-4 mb-8 flex-1">
                      {plan.features?.map((feature: string, idx: number) => (
                        <BenefitItem
                          key={idx}
                          icon={
                            isVIP ? (
                              <Infinity className="text-amber-500 h-4 w-4" />
                            ) : (
                              <Check className={isStandard ? "text-green-500" : "text-primary"} />
                            )
                          }
                          label={feature}
                          highlight={isVIP && idx < 3} // Destaca os 3 primeiros itens se for VIP
                        />
                      ))}
                    </ul>

                    {/* Botão de Ação conectado ao Stripe Checkout */}
                    <Button
                      onClick={() => handleSubscribe(plan._id)}
                      disabled={isLoading}
                      variant={isStandard ? "outline" : "default"}
                      className={`w-full h-12 rounded-xl font-bold ${isVIP
                          ? "bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20 text-lg"
                          : isPremium
                            ? "bg-primary hover:bg-primary/90"
                            : "border-primary/20 hover:bg-primary/10"
                        }`}
                    >
                      {isVIP ? "Assinar Agora VIP" : "Escolher Plano"}
                    </Button>
                  </Card>
                );
              })}
            </div>

            {/* Garantias de Confiança */}
            <div className="mt-16 max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center border-t border-white/5 pt-12">
              <div className="flex flex-col items-center gap-2">
                <ShieldCheck className="h-8 w-8 text-muted-foreground opacity-50" />
                <h4 className="font-bold text-sm uppercase tracking-tighter">
                  Pagamento Anónimo
                </h4>
                <p className="text-xs text-muted-foreground text-balance">
                  Faturação discreta em todos os extratos.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Star className="h-8 w-8 text-muted-foreground opacity-50" />
                <h4 className="font-bold text-sm uppercase tracking-tighter">
                  Conteúdo Curado
                </h4>
                <p className="text-xs text-muted-foreground text-balance">
                  Perfis e conteúdos verificados manualmente.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Zap className="h-8 w-8 text-muted-foreground opacity-50" />
                <h4 className="font-bold text-sm uppercase tracking-tighter">
                  Cancelamento Fácil
                </h4>
                <p className="text-xs text-muted-foreground text-balance">
                  Sem contratos, cancele online quando quiser.
                </p>
              </div>
            </div>
          </main>

          <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
};

// Componente auxiliar para os itens de benefício
const BenefitItem = ({
  icon,
  label,
  muted = false,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  muted?: boolean;
  highlight?: boolean;
}) => (
  <li
    className={`flex items-center gap-3 text-sm ${muted ? "text-muted-foreground/40" : "text-muted-foreground"}`}
  >
    <div className="flex-shrink-0">{icon}</div>
    <span className={highlight ? "text-white font-bold" : ""}>{label}</span>
  </li>
);

export default SubscriptionPage;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  AlertTriangle, 
  ArrowLeft, 
  ShieldX, 
  Gem, 
  HeartBreak, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { customFetch } from "@/utils/index";

const CancelSubscriptionPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchSub = async () => {
      if (!user?._id) return;
      try {
        const res = await customFetch.get(
          `subscriptions/${user._id}`,
          {
            withCredentials: true,
          },
        );
        setCurrentSub(res.data.data);
      } catch (err) {
        console.error("Erro ao carregar subscrição", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSub();
  }, [user?._id]);

  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      const res = await customFetch.patch(
        `subscriptions/${user?._id}/cancel`,
        {},
        { withCredentials: true },
      );

      if (res.data.status === "success") {
        toast({
          title: "Subscrição Cancelada",
          description: "A tua subscrição não será renovada no próximo ciclo.",
        });
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao cancelar",
        description: err.response?.data?.message || "Ocorreu um erro técnico.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentSub || currentSub.status !== "active") {
    return (
      <div className="flex flex-col h-screen items-center justify-center p-4 text-center space-y-4">
        <ShieldX className="h-12 w-12 text-muted-foreground/50" />
        <h2 className="text-xl font-bold">Nenhuma subscrição ativa encontrada</h2>
        <Button onClick={() => navigate("/dashboard")} variant="outline">Voltar ao Início</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        
        {/* Botão Voltar */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>

        <Card className="border-red-500/20 bg-card/40 backdrop-blur-xl p-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50" />
          
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Badge variant="outline" className="text-red-500 border-red-500/30 uppercase text-[10px] px-2">
                  Gerir Assinatura
                </Badge>
                <h1 className="text-3xl font-display font-bold">É um adeus?</h1>
                <p className="text-muted-foreground text-sm">
                  Lamentamos ver-te partir. Antes de confirmares, repara no que vais perder.
                </p>
              </div>
              <div className="bg-red-500/10 p-3 rounded-2xl">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>

            {/* Resumo do que perde */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <LossItem 
                icon={<Gem className="text-primary" />} 
                title="Selo VIP" 
                desc="O selo de verificado será removido do teu perfil." 
              />
              <LossItem 
                icon={<CheckCircle2 className="text-primary" />} 
                title="Acesso Total" 
                desc="Perderás acesso a conteúdos exclusivos de criadores." 
              />
            </div>

            {/* Informação de Data */}
            <div className="bg-secondary/30 border border-white/5 rounded-xl p-4 text-sm">
              <p className="text-muted-foreground">
                Se cancelares agora, continuarás a ter acesso às vantagens Premium até ao dia 
                <span className="text-white font-bold ml-1">
                  {new Date(currentSub.endDate).toLocaleDateString('pt-PT')}.
                </span>
              </p>
            </div>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button 
                variant="outline" 
                className="flex-1 h-12 rounded-xl"
                onClick={() => navigate("/dashboard")}
              >
                Manter Subscrição
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1 h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Cancelamento"}
              </Button>
            </div>

            <p className="text-[10px] text-center text-muted-foreground/50 uppercase tracking-widest pt-4">
              Podes voltar a assinar a qualquer momento no futuro.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Sub-componente para itens de perda
const LossItem = ({ icon, title, desc }: any) => (
  <div className="flex gap-3 p-4 rounded-xl border border-white/5 bg-white/5">
    <div className="flex-shrink-0 mt-1">{icon}</div>
    <div className="space-y-1">
      <h4 className="text-sm font-bold text-white">{title}</h4>
      <p className="text-[11px] text-muted-foreground leading-tight">{desc}</p>
    </div>
  </div>
);

export default CancelSubscriptionPage;
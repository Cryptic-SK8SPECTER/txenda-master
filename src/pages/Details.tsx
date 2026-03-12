import React, { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Star,
  ShieldCheck,
  MapPin,
  Lock,
  Unlock,
  Clock,
  Flame,
  Flag,
  Check,
  Share2,
  ArrowLeft,
  Gem,
  Loader2,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { basicUrl } from "@/utils/index";
import { userService } from "@/services/userService";
import { useParams, useNavigate, Link } from "react-router-dom";

const Details = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();
  const navigate = useNavigate();
  const { calculateAge, user: currentUser } = useAuth();

  // Regra de Negócio: isVerified no seu sistema identifica se o user é um assinante/verificado
  const isSubscriber = currentUser?.isVerified === true;

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await userService.getUser(id);
        const userData =
          res.data?.data?.data || res.data?.data || res.data || res;
        setTargetUser(userData);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground italic">
          Carregando perfil...
        </p>
      </div>
    );
  }

  if (!targetUser || !targetUser.profile) {
    return (
      <div className="flex flex-col h-screen items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold">Usuário não encontrado</h2>
        <Button className="mt-4" onClick={() => navigate("/dashboard")}>
          Voltar
        </Button>
      </div>
    );
  }

  const age = targetUser.profile.birthDate
    ? calculateAge(targetUser.profile.birthDate)
    : "??";

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24 md:pb-6 animate-in fade-in duration-500">
      {/* --- HEADER HERO --- */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <img
          src={
            targetUser.profile.photo
              ? `${basicUrl}img/users/${targetUser.profile.photo}`
              : `${basicUrl}img/users/default.jpg`
          }
          alt={targetUser.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/20 backdrop-blur-md text-white"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-3xl font-bold text-white">
            {targetUser.name} • {age}
          </h1>
          <span className="flex items-center gap-1 text-sm text-white/90">
            <MapPin className="h-4 w-4" />{" "}
            {targetUser.profile.location || "N/A"}
          </span>
        </div>
      </div>

      {/* --- CONTEÚDO --- */}
      <div className="px-6 mt-8">
        <Tabs defaultValue="sobre" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-secondary/50 rounded-xl p-1">
            <TabsTrigger value="sobre">Sobre</TabsTrigger>
            <TabsTrigger value="galeria">Galeria</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
          </TabsList>

          {/* TAB SOBRE */}
          <TabsContent value="sobre" className="mt-6 space-y-4">
            <section>
              <h3 className="text-lg font-semibold mb-2">Biografia</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {targetUser.profile.bio}
              </p>
            </section>
          </TabsContent>

          {/* TAB GALERIA (FOTOS) */}
          <TabsContent value="galeria" className="mt-6">
            <div className="grid grid-cols-3 gap-2">
              {targetUser.contents
                ?.filter((c: any) => c.type === "photo")
                .map((photo: any) => {
                  const isLocked =
                    (photo.visibility === "Exclusivo assinantes" &&
                      !isSubscriber) ||
                    photo.visibility === "Pago individualmente";

                  return (
                    <div
                      key={photo._id}
                      className="aspect-square rounded-lg overflow-hidden relative group bg-secondary/20"
                    >
                      <img
                        src={`${basicUrl}img/contents/${photo.url}`}
                        className={`w-full h-full object-cover transition-all ${isLocked ? "blur-xl grayscale" : ""}`}
                        alt=""
                      />
                      {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Lock className="text-white h-6 w-6" />
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </TabsContent>

          {/* TAB PREMIUM (VÍDEOS E CONTEÚDOS PAGOS) */}
          <TabsContent value="premium" className="mt-6 space-y-4">
            {/* Banner de Assinatura se não for assinante */}
            {!isSubscriber && (
              <Card className="p-4 border-primary/30 bg-primary/5 flex flex-col items-center text-center">
                <Gem className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm font-bold">Conteúdo Exclusivo</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Assine para desbloquear fotos e vídeos exclusivos de{" "}
                  {targetUser.name}.
                </p>
                <Button size="sm" className="w-full rounded-full"  onClick={() => navigate("/dashboard/subscription")}>
                  Assinar agora
                </Button>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
              {targetUser.contents
                ?.filter((c: any) => c.type === "video")
                .map((video: any) => {
                  const needsSub =
                    video.visibility === "Exclusivo assinantes" &&
                    !isSubscriber;
                  const needsPay = video.visibility === "Pago individualmente";
                  const isLocked = needsSub || needsPay;

                  return (
                    <Card
                      key={video._id}
                      className="overflow-hidden border-none bg-secondary/30"
                    >
                      <div className="relative aspect-video">
                        <img
                          src={`${basicUrl}img/users/${targetUser.profile.photo}`}
                          className={`w-full h-full object-cover ${isLocked ? "blur-2xl" : ""}`}
                          alt=""
                        />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
                          {needsSub ? (
                            <>
                              <Lock className="text-white h-8 w-8 mb-2" />
                              <p className="text-white text-xs font-bold uppercase mb-3">
                                Exclusivo para Assinantes
                              </p>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="rounded-full"
                              >
                                Subscrever para ver
                              </Button>
                            </>
                          ) : needsPay ? (
                            <>
                              <CreditCard className="text-amber-400 h-8 w-8 mb-2" />
                              <p className="text-white text-xs font-bold uppercase mb-1">
                                Conteúdo Premium
                              </p>
                              <p className="text-white/70 text-[10px] mb-3">
                                {video.description}
                              </p>
                              <Button
                                size="sm"
                                className="bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-full"
                              >
                                Desbloquear por {video.price?.toFixed(2)} MZN
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="secondary"
                              size="icon"
                              className="rounded-full h-12 w-12"
                            >
                              <Unlock className="h-6 w-6" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* CTA FIXO */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t z-50 flex gap-3 md:hidden">
        <Button
          variant="secondary"
          size="icon"
          className="h-12 w-12 rounded-full"
        >
          <Heart
            className={`h-5 w-5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`}
          />
        </Button>
        <Button
          className="flex-1 h-12 rounded-full font-bold"
          onClick={() => navigate(`/dashboard/chat/${targetUser._id}`)}
        >
          <MessageCircle className="h-5 w-5 mr-2" /> Enviar Mensagem
        </Button>
      </div>
    </div>
  );
};

export default Details;

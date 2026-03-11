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
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { basicUrl } from "@/utils/index";
import { userService } from "@/services/userService";
import { useParams, useNavigate } from "react-router-dom";

const Details = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  const navigate = useNavigate();

  const { calculateAge } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await userService.getUser(id); // ou getUserById

        // O seu backend usa data: { data: doc }
        // Então precisamos acessar res.data.data.data
        const userData = res.data?.data?.data || res.data?.data || res;

        setTargetUser(userData);
        console.log("DADOS CARREGADOS:", userData);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }, [id]);

  console.log("USER TARGET DATA  ", targetUser);

   const age = targetUser?.profile?.birthDate
     ? calculateAge(targetUser?.profile?.birthDate)
     : null;

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24 md:pb-6">
      {/* 🖼️ 1️⃣ Header do Perfil (Hero Image) */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <img
          src={`${basicUrl}img/users/${targetUser?.profile.photo}`}
          alt={targetUser?.name}
          className="w-full h-full object-cover"
        />
        {/* Overlay Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />

        {/* Top Actions */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/20 backdrop-blur-md text-white"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black/20 backdrop-blur-md text-white"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black/20 backdrop-blur-md text-white"
            >
              <Flag className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Informações Rápidas (Sobrepostas à Imagem) */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 mb-2">
            {targetUser.isOnline && (
              <Badge className="bg-green-500 text-white border-none gap-1 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                Online agora
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="bg-primary/20 text-primary border-primary/30 gap-1"
            >
              <Flame className="h-3 w-3" />
              {targetUser?.profile?.gender}
            </Badge>
          </div>

          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            {targetUser?.name} • {age}
          </h1>

          <div className="flex items-center gap-3 text-white/90 mt-1">
            <span className="flex items-center gap-1 text-sm">
              <MapPin className="h-4 w-4" /> {targetUser?.profile.location}
            </span>
            {/* <span className="text-white/40">•</span> */}
            {/* <span className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9
              (128 reviews)
            </span> */}
          </div>
        </div>
      </div>

      {/* 🔘 Botões Principais de Ação */}
      <div className="px-6 -mt-6 relative z-10 flex gap-3">
        <Button
          onClick={() => setIsLiked(!isLiked)}
          className={`flex-1 h-14 rounded-2xl shadow-lg transition-all ${isLiked ? "bg-rose-500 hover:bg-rose-600" : "bg-primary"}`}
        >
          <Heart className={`mr-2 h-6 w-6 ${isLiked ? "fill-white" : ""}`} />
          {isLiked ? "Match!" : "Curtir"}
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-14 w-14 rounded-2xl shadow-lg bg-card border border-border"
        >
          <Star className="h-6 w-6 text-amber-500" />
        </Button>
      </div>

      {/* 📋 Conteúdo em Abas */}
      <div className="px-6 mt-8">
        <Tabs defaultValue="sobre" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-secondary/50 rounded-xl p-1">
            <TabsTrigger value="sobre">Sobre</TabsTrigger>
            <TabsTrigger value="galeria">Galeria</TabsTrigger>
            <TabsTrigger value="premium">Conteúdo</TabsTrigger>
          </TabsList>

          {/* 2️⃣ Sobre Mim & 3️⃣ Preferências */}
          <TabsContent value="sobre" className="mt-6 space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-2">Sobre mim</h3>
              <p className="text-muted-foreground leading-relaxed">
                {targetUser?.profile?.bio}
              </p>
            </section>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-secondary/20 border-border">
                <span className="text-xs text-muted-foreground block mb-1">
                  Interesse
                </span>
                <span className="font-medium">
                  {targetUser?.profile?.lookingFor === "ambos"
                    ? "Conteúdos e Encontros"
                    : targetUser?.profile?.lookingFor === "conteudos"
                      ? "Apenas Conteúdos"
                      : targetUser?.profile?.lookingFor === "encontros"
                        ? "Apenas Encontros"
                        : "Não especificado"}
                </span>
              </Card>

              <Card className="p-4 bg-secondary/20 border-border">
                <span className="text-xs text-muted-foreground block mb-1">
                  Contacto
                </span>
                <span className="font-medium">
                  {targetUser?.profile?.phone || "Privado"}
                </span>
              </Card>
            </div>
            {/* 8️⃣ Indicadores de Confiança */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="text-primary h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Conta Verificada</p>
                  <p className="text-xs text-muted-foreground">
                    Membro desde Outubro 2025
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">150+</p>
                <p className="text-[10px] text-muted-foreground uppercase">
                  Vendas
                </p>
              </div>
            </div>
          </TabsContent>

          {/* 4️⃣ Galeria */}
          <TabsContent value="galeria" className="mt-6">
            <div className="grid grid-cols-3 gap-2">
              {targetUser?.contents
                ?.filter((content) => content.type === "photo") // Filtra apenas fotos
                .map((photo) => {
                  // Lógica para decidir se a foto aparece bloqueada
                  const isPrivate =
                    !isSubscribed &&
                    photo.visibility === "Pago individualmente";

                  return (
                    <div
                      key={photo._id}
                      className="aspect-square rounded-lg overflow-hidden relative group bg-secondary/20"
                    >
                      <img
                        src={`${basicUrl}img/contents/${photo.url}`}
                        className={`w-full h-full object-cover transition-all duration-300 ${
                          isPrivate
                            ? "blur-xl grayscale opacity-50"
                            : "hover:scale-110"
                        }`}
                        alt={photo.description || "Foto da galeria"}
                      />

                      {isPrivate ? (
                        /* Overlay para Fotos Privadas */
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-2">
                          <Lock className="h-5 w-5 mb-1" />
                          <span className="text-[10px] font-bold uppercase tracking-tighter">
                            Privado
                          </span>
                        </div>
                      ) : (
                        /* Overlay para Fotos Públicas/Desbloqueadas ao passar o mouse */
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Unlock className="text-white h-5 w-5" />
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* Caso não existam fotos */}
              {targetUser?.contents?.filter((c) => c.type === "photo")
                .length === 0 && (
                <div className="col-span-3 py-10 text-center text-muted-foreground text-sm">
                  Nenhuma foto publicada ainda.
                </div>
              )}
            </div>

            {/* Botão de CTA se houver conteúdo bloqueado */}
            {!isSubscribed && (
              <Button
                variant="outline"
                className="w-full mt-4 gap-2 border-dashed border-primary/50 hover:bg-primary/5"
              >
                Solicitar acesso à galeria privada
              </Button>
            )}
          </TabsContent>

          {/* 5️⃣ Conteúdo Premium */}
          <TabsContent value="premium" className="mt-6">
            <div className="space-y-4">
              {/* 1. Banner de Assinatura (só mostra se não for subscrito) */}
              {!isSubscribed && (
                <Card className="p-6 border-amber-500/50 bg-amber-500/5 text-center">
                  <Gem className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                  <h4 className="font-bold">Acesso Premium Exclusivo</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Assine para desbloquear todos os vídeos e fotos sem censura.
                  </p>
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold">
                    Assinar Perfil - MZN19,90/mês
                  </Button>
                </Card>
              )}

              {/* 2. Grid de Vídeos Reais */}
              <div className="grid grid-cols-1 gap-4">
                {targetUser?.contents
                  ?.filter((content) => content.type === "video") // Filtra apenas vídeos
                  .map((video) => (
                    <div
                      key={video._id}
                      className="relative group rounded-xl overflow-hidden aspect-video border border-border bg-black"
                    >
                      {/* Se o vídeo for pago e o user não tiver acesso, mostra blur */}
                      <img
                        src={`${basicUrl}img/users/${targetUser.profile?.photo || "default.jpg"}`}
                        className={`w-full h-full object-cover transition-all duration-500 ${
                          !isSubscribed &&
                          video.visibility === "Pago individualmente"
                            ? "blur-2xl opacity-40"
                            : ""
                        }`}
                        alt={video.description}
                      />

                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-4">
                        <Badge className="mb-2 bg-primary uppercase">
                          {video.type} •{" "}
                          {video.visibility === "Pago individualmente"
                            ? "Premium"
                            : "Grátis"}
                        </Badge>

                        <p className="text-white font-medium mb-3 text-center">
                          {video.description || "Sem descrição"}
                        </p>

                        {/* Lógica do Botão: Desbloquear ou Assistir */}
                        {!isSubscribed &&
                        video.visibility === "Pago individualmente" ? (
                          <Button
                            size="sm"
                            className="gap-2 bg-amber-500 hover:bg-amber-600 text-black"
                          >
                            <Lock className="h-4 w-4" /> Desbloquear por MZN
                            {video.price?.toFixed(2)}
                          </Button>
                        ) : (
                          <Button size="sm" className="gap-2 variant-secondary">
                            <Unlock className="h-4 w-4" /> Assistir Agora
                          </Button>
                        )}
                      </div>

                      {/* Overlay de info inferior (Views) */}
                      <div className="absolute bottom-2 right-2 text-[10px] text-white/70 bg-black/20 px-2 py-1 rounded">
                        {video.views} visualizações
                      </div>
                    </div>
                  ))}

                {/* Caso não existam vídeos */}
                {targetUser?.contents?.filter((c) => c.type === "video")
                  .length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-10">
                    Este criador ainda não publicou vídeos.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 🕕 Última Atividade & Localização */}
      <div className="px-6 mt-10 space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" /> Visto há 12 minutos
        </div>
        <div className="h-32 w-full rounded-xl bg-secondary/30 border border-border flex items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30 grayscale contrast-125"
            style={{
              backgroundImage: "radial-gradient(#888 1px, transparent 1px)",
              size: "20px 20px",
            }}
          />
          <div className="relative z-10 text-center">
            <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
              <div className="h-3 w-3 bg-primary rounded-full" />
            </div>
            <p className="text-[10px] uppercase tracking-widest font-bold">
              Localização Aproximada
            </p>
          </div>
        </div>
      </div>

      {/* 💬 9️⃣ CTA Fixo no Rodapé (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border z-50 flex items-center gap-3 md:hidden">
        <Button
          variant="secondary"
          size="icon"
          className="h-12 w-12 rounded-full flex-shrink-0"
        >
          <Heart className="h-5 w-5" />
        </Button>
        <Button className="flex-1 h-12 rounded-full font-bold text-base gap-2 shadow-lg shadow-primary/20">
          <MessageCircle className="h-5 w-5" /> Enviar Mensagem
        </Button>
      </div>
    </div>
  );
};

export default Details;

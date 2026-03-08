import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, MapPin, Diamond, Target, Sparkles, Lock, Eye, Camera, Video, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import ContentCard from "@/components/content/ContentCard";
import SkeletonGrid from "@/components/content/SkeletonGrid";
import heroBg from "@/assets/hero-bg.jpg";
import { fadeUp } from "@/utils/index";
import { useToast } from "@/hooks/use-toast";
import { contentService } from "@/services/contentService";
import Pagination from "@/components/content/Pagination";



const benefits = [
  { icon: Lock, title: "Segurança e privacidade", desc: "Perfis verificados, localização protegida." },
  { icon: Diamond, title: "Exclusividade", desc: "Comunidade premium e comprometida." },
  { icon: MapPin, title: "Geolocalização inteligente", desc: "Encontre pessoas perto de você em tempo real." },
  { icon: Target, title: "Conteúdo premium", desc: "Fotos e vídeos seguros e exclusivos." },
  { icon: Sparkles, title: "Experiências reais", desc: "Conexões com intenções claras e consensuais." },
];

const allContents = [
  {
    id: 1, creator: "Mariana S.", description: "Ensaio exclusivo na praia", price: 29.90, views: 1240,
    type: "photo" as const, visibility: "Exclusivo assinantes",
    preview: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop",
  },
  {
    id: 2, creator: "Lucas M.", description: "Behind the scenes – sessão fitness", price: 19.90, views: 890,
    type: "video" as const, visibility: "Pago individualmente",
    preview: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=500&fit=crop",
  },
  {
    id: 3, creator: "Ana R.", description: "Lifestyle & moda – coleção verão", price: 0, views: 3200,
    type: "photo" as const, visibility: "Público",
    preview: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop",
  },
  {
    id: 4, creator: "Pedro V.", description: "Vlog diário – rotina de criador", price: 14.90, views: 560,
    type: "video" as const, visibility: "Exclusivo assinantes",
    preview: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop",
  },
  {
    id: 5, creator: "Sofia L.", description: "Dança contemporânea – performance", price: 24.90, views: 2100,
    type: "video" as const, visibility: "Exclusivo assinantes",
    preview: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop",
  },
  {
    id: 6, creator: "Rafael C.", description: "Fotografia artística urbana", price: 9.90, views: 750,
    type: "photo" as const, visibility: "Pago individualmente",
    preview: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
  },
  {
    id: 7, creator: "Camila F.", description: "Sessão fotográfica ao pôr do sol", price: 34.90, views: 1850,
    type: "photo" as const, visibility: "Exclusivo assinantes",
    preview: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop",
  },
  {
    id: 8, creator: "Diego R.", description: "Treino funcional – série completa", price: 12.90, views: 430,
    type: "video" as const, visibility: "Pago individualmente",
    preview: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
  },
  {
    id: 9, creator: "Juliana P.", description: "Moda streetwear – lookbook", price: 0, views: 2750,
    type: "photo" as const, visibility: "Público",
    preview: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop",
  },
  {
    id: 10, creator: "Thiago M.", description: "Vlog de viagem – Luanda", price: 19.90, views: 980,
    type: "video" as const, visibility: "Exclusivo assinantes",
    preview: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
  },
  {
    id: 11, creator: "Beatriz S.", description: "Ensaio artístico minimalista", price: 39.90, views: 3100,
    type: "photo" as const, visibility: "Exclusivo assinantes",
    preview: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop",
  },
  {
    id: 12, creator: "André L.", description: "Cooking show – receitas premium", price: 8.90, views: 620,
    type: "video" as const, visibility: "Pago individualmente",
    preview: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop",
  },
  {
    id: 13, creator: "Isabela N.", description: "Yoga ao ar livre – sessão guiada", price: 15.90, views: 1420,
    type: "video" as const, visibility: "Exclusivo assinantes",
    preview: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop",
  },
  {
    id: 14, creator: "Gabriel T.", description: "Fotografia noturna – city lights", price: 22.90, views: 870,
    type: "photo" as const, visibility: "Pago individualmente",
    preview: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=500&fit=crop",
  },
  {
    id: 15, creator: "Fernanda A.", description: "Behind the scenes – editorial", price: 27.90, views: 2300,
    type: "photo" as const, visibility: "Exclusivo assinantes",
    preview: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop",
  },
  {
    id: 16, creator: "Carlos H.", description: "Parkour urbano – highlights", price: 11.90, views: 540,
    type: "video" as const, visibility: "Público",
    preview: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop",
  },
];

const ITEMS_PER_PAGE = 12;
const FREE_VISIBLE = 3;

const Index = () => {
  const isSubscribed = false;
  const [currentPage, setCurrentPage] = useState(1);
  const [allContents, setAllContents] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true); // Ativa o skeleton
      try {
        const res = await contentService.getAllContents(currentPage, ITEMS_PER_PAGE);

        // LOG DE DEBUG - Verifique o que aparece no console agora
        console.log("Resposta API:", res);

        const contentArray = res.data?.data;
        const total = res.total;

        console.log("Resposta total:", total);
        setAllContents(contentArray);
        setTotalItems(total);

      } catch (err) {
        console.error("Erro no fetch:", err);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível carregar os conteúdos.",
          variant: "destructive"
        });
      } finally {
        // ESTA LINHA É OBRIGATÓRIA PARA O SKELETON SUMIR
        setLoading(false);
      }
    };

    fetchFeed();
  }, [currentPage]);

  const handlePageChange = (page: number) => {

    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);

  };


  return (
    <div className="min-h-screen bg-background font-body">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)", mixBlendMode: "multiply" }} />

        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-12 py-5">
          <span className="font-display text-xl md:text-2xl font-bold text-foreground tracking-wider uppercase">
            TXENDA
          </span>
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "ENTRAR", href: "/login" },
              { label: "VANTAGENS", href: "#vantagens" },
              { label: "CONTEÚDOS", href: "#conteudos" },
              { label: "CRIAR CONTEÚDOS", href: "/register" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium tracking-wider text-muted-foreground hover:text-foreground transition-colors border-b-2 border-transparent hover:border-primary pb-1"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-6"
          >
            Plataforma Premium
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            Conexões reais.{" "}
            <span className="text-gradient">Pessoas reais.</span>{" "}
            Intenções claras.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Descubra encontros exclusivos e adquira conteúdo premium de quem
            você deseja, em um ambiente seguro e discreto.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button variant="hero" size="lg" className="text-lg px-10 py-6 rounded-full" asChild>
              <Link to="/signup">Crie sua conta agora</Link>
            </Button>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>



      {/* Conteúdos de Criadores */}
      <section id="conteudos" className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-primary tracking-[0.3em] uppercase text-sm mb-4">
              Descubra
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-5xl font-bold mb-4">
              Conteúdos de Criadores
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-2xl mx-auto">
              Explore conteúdos exclusivos publicados por criadores verificados da nossa comunidade.
            </motion.p>
          </motion.div>

          {/* Content Grid */}
          {/* No Content Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`page-${currentPage}`}
              // ... animações
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {loading ? (
                <SkeletonGrid count={8} />
              ) : (
                // MAPEIE allContents diretamente
                allContents.map((content, i) => (
                  <ContentCard
                    key={content._id}
                    content={content}
                    index={i}
                    isLocked={false}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />

          {/* CTA after grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mt-16"
          >
            <div className="glass rounded-2xl p-8 md:p-12 text-center border border-primary/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20">
                  <Lock className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">
                  Quer ver todos os conteúdos?
                </h3>
                <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-base md:text-lg">
                  Acesse conteúdos exclusivos de criadores e desbloqueie experiências únicas.
                </p>
                <Button variant="hero" size="lg" className="text-lg px-10 py-6 rounded-full" asChild>
                  <Link to="/subscription">Ativar Subscrição</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Por que escolher */}
      <section id="vantagens" className="py-24" style={{ background: "var(--gradient-dark)" }}>
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-primary tracking-[0.3em] uppercase text-sm mb-4">
              Vantagens
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-5xl font-bold">
              Por que escolher nossa plataforma
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="glass rounded-xl p-8 text-center hover:border-primary/30 transition-all hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-5">
                  <b.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{b.title}</h3>
                <p className="text-muted-foreground text-sm">{b.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mt-14"
          >
            <Button variant="cta" size="lg" className="text-lg px-10 py-6" asChild>
              <Link to="/signup">Assine e tenha acesso completo</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Mensagem Final */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative z-10 container mx-auto px-4 max-w-3xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl md:text-5xl font-bold mb-8 leading-tight">
              Entre em um mundo de conexões adultas{" "}
              <span className="text-gradient">premium</span>.
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-lg md:text-xl text-foreground/80 mb-10 leading-relaxed">
              Descubra encontros e conteúdos exclusivos, em um ambiente seguro e
              discreto. Aqui, você encontra pessoas reais e experiências que
              realmente importam.
            </motion.p>
            <motion.div variants={fadeUp} custom={2}>
              <Button variant="hero" size="lg" className="text-lg px-10 py-6 rounded-full" asChild>
                <Link to="/signup">Comece agora – é rápido e seguro</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2026 Plataforma Premium. Todos os direitos reservados. Apenas +18.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

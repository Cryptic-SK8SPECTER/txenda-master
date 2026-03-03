import { Link } from "react-router-dom";
import { Shield, MapPin, Diamond, Target, Sparkles, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6 },
  }),
};

const steps = [
  { num: "01", title: "Crie seu perfil", desc: "Totalmente verificado e seguro." },
  { num: "02", title: "Escolha sua subscrição", desc: "Acesso completo à comunidade e conteúdos premium." },
  { num: "03", title: "Encontre pessoas próximas", desc: "Com base na geolocalização e interesses." },
  { num: "04", title: "Converse e combine encontros", desc: "Chat privado, rápido e protegido." },
  { num: "05", title: "Compre fotos e vídeos", desc: "Conteúdo exclusivo de vendedores verificados." },
];

const benefits = [
  { icon: Lock, title: "Segurança e privacidade", desc: "Perfis verificados, localização protegida." },
  { icon: Diamond, title: "Exclusividade", desc: "Comunidade premium e comprometida." },
  { icon: MapPin, title: "Geolocalização inteligente", desc: "Encontre pessoas perto de você em tempo real." },
  { icon: Target, title: "Conteúdo premium", desc: "Fotos e vídeos seguros e exclusivos." },
  { icon: Sparkles, title: "Experiências reais", desc: "Conexões com intenções claras e consensuais." },
];

const Index = () => {
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
              <Link to="/register">Crie sua conta agora</Link>
            </Button>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Como Funciona */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-primary tracking-[0.3em] uppercase text-sm mb-4">
              Passo a passo
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-5xl font-bold">
              Como funciona
            </motion.h2>
          </motion.div>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="glass rounded-xl p-6 md:p-8 flex items-start gap-6 hover:border-primary/30 transition-colors"
              >
                <span className="text-primary font-display text-3xl font-bold shrink-0">
                  {step.num}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold mb-1">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mt-12"
          >
            <Button variant="cta" size="lg" className="text-lg px-10 py-6" asChild>
              <Link to="/register">Veja os perfis próximos</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Por que escolher */}
      <section className="py-24" style={{ background: "var(--gradient-dark)" }}>
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
              <Link to="/register">Assine e tenha acesso completo</Link>
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
                <Link to="/register">Comece agora – é rápido e seguro</Link>
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

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import registerBg from "@/assets/register-bg.jpg";

const Register = () => {
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex font-body">
      {/* Left - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${registerBg})` }}
        />
        <div className="absolute inset-0 bg-background/60" />
        <div className="relative z-10 p-12 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-4xl font-bold mb-6 leading-tight">
              Entre para uma comunidade{" "}
              <span className="text-gradient">exclusiva</span>.
            </h1>
            <p className="text-foreground/70 text-lg mb-8">
              Perfis verificados, conexões reais e conteúdo premium em um
              ambiente seguro e discreto.
            </p>
            <div className="space-y-3">
              {[
                "+18 apenas",
                "Comunidade por subscrição",
                "Privacidade garantida",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground/80">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold mb-2">Criar Conta</h2>
            <p className="text-muted-foreground">Preencha os dados para entrar na plataforma.</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <Label htmlFor="displayName">Nome de exibição</Label>
              <Input id="displayName" placeholder="Como quer ser chamado(a)" className="mt-1.5 bg-secondary border-border" />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" className="mt-1.5 bg-secondary border-border" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Palavra-passe</Label>
                <Input id="password" type="password" placeholder="••••••••" className="mt-1.5 bg-secondary border-border" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" className="mt-1.5 bg-secondary border-border" />
              </div>
            </div>

            <div>
              <Label htmlFor="birthdate">Data de nascimento</Label>
              <Input id="birthdate" type="date" className="mt-1.5 bg-secondary border-border" />
            </div>

            <div>
              <Label>Género</Label>
              <Select>
                <SelectTrigger className="mt-1.5 bg-secondary border-border">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                  <SelectItem value="nonbinary">Não-binário</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>O que procura</Label>
              <Select>
                <SelectTrigger className="mt-1.5 bg-secondary border-border">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="encounters">Encontros</SelectItem>
                  <SelectItem value="content">Conteúdo</SelectItem>
                  <SelectItem value="both">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Interesse em conteúdo</Label>
              <Select>
                <SelectTrigger className="mt-1.5 bg-secondary border-border">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Quero comprar conteúdo</SelectItem>
                  <SelectItem value="sell">Quero vender conteúdo</SelectItem>
                  <SelectItem value="both">Comprar e vender</SelectItem>
                  <SelectItem value="none">Não tenho interesse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="age"
                checked={ageConfirmed}
                onCheckedChange={(v) => setAgeConfirmed(v === true)}
              />
              <Label htmlFor="age" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                Confirmo que tenho mais de 18 anos e aceito os{" "}
                <span className="text-primary underline">Termos e Condições</span> e a{" "}
                <span className="text-primary underline">Política de Privacidade</span>.
              </Label>
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full rounded-full text-base py-6 mt-2"
              disabled={!ageConfirmed}
            >
              Criar Conta e Continuar
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-muted-foreground text-sm">
              Já tem conta?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Entrar
              </Link>
            </p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
              <Shield className="w-3.5 h-3.5" />
              <span>Seus dados são protegidos e nunca serão exibidos publicamente sem sua permissão.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;

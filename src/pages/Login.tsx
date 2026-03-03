import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import logo from "@/assets/txenda.png";

const Login = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center font-body p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={logo}
                alt="txenda"
                className="mx-auto h-14 w-auto "
              />
            </Link>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="mt-1.5 bg-secondary border-border"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Palavra-passe</Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                >
                  Esqueceu a palavra-passe?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="mt-1.5 bg-secondary border-border"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label
                htmlFor="remember"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Manter sessão iniciada
              </Label>
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full rounded-full text-base py-6"
            >
              Entrar na Plataforma
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-muted-foreground text-sm">
              Não tem conta?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Criar nova conta
              </Link>
            </p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
              <Shield className="w-3.5 h-3.5" />
              <span>Acesso seguro com criptografia avançada.</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

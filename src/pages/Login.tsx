import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import logo from "@/assets/txenda.png";
import { login } from "@/services/authService"; 
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { signin } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await login(email, password);

      if (res.status === 'success') {
        await signin(res.data.user, res.token);
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: error.response?.data?.message || "Verifique suas credenciais.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              <img src={logo} alt="txenda" className="mx-auto h-14 w-auto " />
            </Link>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Informe o seu email"
                className="mt-1.5 bg-secondary border-border"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Palavra-passe</Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => navigate("/recover")}
                >
                  Esqueceu a palavra-passe?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="mt-1.5 bg-secondary border-border"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar na Plataforma"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-muted-foreground text-sm">
              Não tem conta?{" "}
              <Link
                to="/signup"
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

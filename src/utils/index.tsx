import axios from 'axios';
import {
  DollarSign,
  Crown,
  Globe,
  MapPin,
  Diamond,
  Target,
  Sparkles,
  Lock,
} from "lucide-react";

import * as z from "zod";


// --- ESQUEMA DE VALIDAÇÃO ZOD ---
export const schema = z
  .object({
    email: z
      .string()
      .trim()
      .email("E-mail inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    passwordConfirm: z.string().min(8, "Mínimo 8 caracteres"),
    displayName: z
      .string()
      .trim()
      .min(2, "Nome muito curto"),
    role: z.string(),
    bio: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.string().max(500).optional(),
    ),
    birthDate: z.string().refine((date) => {
      const birth = new Date(date);
      const now = new Date();
      const age = now.getFullYear() - birth.getFullYear();
      return age >= 18;
    }, "Você deve ter pelo menos 18 anos"),
    gender: z.enum(["masculino", "feminino", "outro"]),
    lookingFor: z.enum(["conteudos", "encontros", "ambos"]),
    location: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.string().optional(),
    ),
    phone: z.preprocess(
      (v) => {
        if (typeof v !== "string") return v;
        const cleaned = v.replace(/\s+/g, "").replace(/-/g, "").trim();
        return cleaned === "" ? undefined : cleaned;
      },
      z
        .string()
        .regex(/^\+?[0-9]{8,15}$/, "Telefone inválido. Use apenas números (com ou sem +).")
        .optional(),
    ),
    terms: z.literal(true, {
      errorMap: () => ({ message: "Você deve aceitar os termos" }),
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "As senhas não coincidem",
    path: ["passwordConfirm"],
  });



// Base da API: aceita com ou sem barra final; e corrige caso venha com "/api/v1"
// Ex: VITE_API_URL="https://...onrender.com/api/v1" -> basicUrl="https://...onrender.com/"
const rawApiUrl = (import.meta.env.VITE_API_URL || "http://localhost:9000").trim();
const normalizedApiUrl = rawApiUrl.replace(/\/api\/v1\/?$/i, "");
export const basicUrl = normalizedApiUrl.endsWith("/")
  ? normalizedApiUrl
  : `${normalizedApiUrl}/`;
const productionUrl = `${basicUrl}api/v1/`;

export const customFetch = axios.create({
  baseURL: productionUrl,
  withCredentials: true, // necessário para cookies/auth em produção (CORS)
});

// Garante que todos os pedidos levam o token atualizado
customFetch.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de erro: log e mensagem mais clara para Network Error (CORS / API inacessível)
customFetch.interceptors.response.use(
  (res) => res,
  (err) => {
    const isNetworkError = err.message === "Network Error" || err.code === "ERR_NETWORK";
    if (isNetworkError) {
      console.error("[API] Network Error — possíveis causas: CORS (FRONTEND_URL no Render), API em baixo ou URL errada (VITE_API_URL). URL base:", productionUrl);
    } else if (err.response) {
      console.error("[API] Erro", err.response.status, err.response.data?.message || err.response.data);
    }
    return Promise.reject(err);
  }
);

export const visibilityLabels = {
  "Público": { label: "Público", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: <Globe className="h-3 w-3" /> },
  "Exclusivo assinantes": { label: "Exclusivo", color: "bg-primary/20 text-primary border-primary/30", icon: <Crown className="h-3 w-3" /> },
  "Pago individualmente": { label: "Pago", color: "bg-gold/20 text-gold border-gold/30", icon: <DollarSign className="h-3 w-3" /> },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: "easeOut"
    },
  }),
};

export const schemasignup = z
  .object({
    email: z.string().trim().email("E-mail inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    passwordConfirm: z.string().min(8, "Mínimo 8 caracteres"),
    displayName: z.string().trim().min(2, "Nome muito curto"),
    role: z.string(),
    terms: z.literal(true, {
      errorMap: () => ({ message: "Você deve aceitar os termos" }),
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "As senhas não coincidem",
    path: ["passwordConfirm"],
  });

export const ITEMS_PER_PAGE = 12;

export const benefits = [
  {
    icon: Lock,
    title: "Segurança e privacidade",
    desc: "Perfis verificados, localização protegida.",
  },
  {
    icon: Diamond,
    title: "Exclusividade",
    desc: "Comunidade premium e comprometida.",
  },
  {
    icon: MapPin,
    title: "Geolocalização inteligente",
    desc: "Encontre pessoas perto de você em tempo real.",
  },
  {
    icon: Target,
    title: "Conteúdo premium",
    desc: "Fotos e vídeos seguros e exclusivos.",
  },
  {
    icon: Sparkles,
    title: "Experiências reais",
    desc: "Conexões com intenções claras e consensuais.",
  },
];

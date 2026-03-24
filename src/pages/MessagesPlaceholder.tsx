import { MessageCircle } from "lucide-react";

/** Painel vazio quando não há conversa selecionada em /dashboard/messages */
const MessagesPlaceholder = () => {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-3 p-8 text-center bg-[#121212] text-zinc-400">
      <MessageCircle className="h-14 w-14 opacity-30 text-zinc-500" />
      <div>
        <p className="text-sm font-medium text-zinc-200">As tuas mensagens</p>
        <p className="text-xs mt-1 max-w-xs text-zinc-500">
          Escolhe uma conversa na lista à esquerda para continuar a falar.
        </p>
      </div>
    </div>
  );
};

export default MessagesPlaceholder;

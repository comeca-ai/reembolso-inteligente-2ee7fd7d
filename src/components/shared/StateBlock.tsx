import { type ReactNode } from "react";
import { Inbox, Loader2, ImageOff, MailX, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type StateKind = "vazio" | "carregando" | "erro_leitura" | "convite_falhou" | "sem_permissao";

const config: Record<StateKind, { icon: typeof Inbox; title: string; text: string; tone: string }> = {
  vazio: { icon: Inbox, title: "Nada por aqui", text: "Quando chegar algo, aparece nesta lista.", tone: "text-muted-foreground" },
  carregando: { icon: Loader2, title: "Carregando", text: "Buscando as informações mais recentes.", tone: "text-muted-foreground" },
  erro_leitura: { icon: ImageOff, title: "Comprovante sem leitura confiável", text: "Pedimos ao colaborador uma foto mais nítida pelo WhatsApp.", tone: "text-state-read-error" },
  convite_falhou: { icon: MailX, title: "Convite não entregue", text: "Confira o contato e tente de novo.", tone: "text-state-read-error" },
  sem_permissao: { icon: Lock, title: "Sem acesso", text: "Seu perfil não permite ver esta área.", tone: "text-muted-foreground" },
};

/** Bloco único para os estados de tela: vazio, carregando, erro de leitura, convite falhou, sem permissão. */
export function StateBlock({ kind, title, text, action, className }: {
  kind: StateKind; title?: string; text?: string; action?: ReactNode; className?: string;
}) {
  const c = config[kind];
  const Icon = c.icon;
  return (
    <div role={kind === "carregando" ? "status" : undefined} className={cn("flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-12 text-center", className)}>
      <Icon className={cn("h-6 w-6", c.tone, kind === "carregando" && "animate-spin")} />
      <h3 className="mt-3 text-sm font-semibold">{title ?? c.title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text ?? c.text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

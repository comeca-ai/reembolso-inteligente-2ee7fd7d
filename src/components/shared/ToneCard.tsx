import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone = "ok" | "atencao" | "nao" | "neutro";

const stripe: Record<Tone, string> = {
  ok: "bg-state-approved",
  atencao: "bg-state-pending",
  nao: "bg-state-read-error",
  neutro: "bg-border",
};

/** Cartão com borda fina e faixa de cor no topo (ok / atenção / não). */
export function ToneCard({ tone = "neutro", title, value, sentence, children, className }: {
  tone?: Tone; title: string; value?: ReactNode; sentence?: string; children?: ReactNode; className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-card text-card-foreground", className)}>
      <div className={cn("h-1 w-full", stripe[tone])} aria-hidden="true" />
      <div className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
        {value !== undefined && <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">{value}</p>}
        {sentence && <p className="mt-1 text-sm text-muted-foreground">{sentence}</p>}
        {children}
      </div>
    </div>
  );
}

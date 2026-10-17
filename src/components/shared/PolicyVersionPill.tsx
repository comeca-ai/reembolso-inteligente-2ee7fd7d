import { Link } from "@tanstack/react-router";
import { FileCheck2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Selo "Política vN em vigor desde dd/mm", clicável até a página da política. */
export function PolicyVersionPill({ version, since, className }: { version?: number | string | null; since?: string | null; className?: string }) {
  const label = version ? `Política v${version} em vigor${since ? ` desde ${since}` : ""}` : "Nenhuma política em vigor";
  return (
    <Link to="/policy" className={cn("inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium hover:border-brand", version ? "text-foreground" : "text-state-pending", className)}>
      <FileCheck2 className="h-3.5 w-3.5 text-brand" />{label}
    </Link>
  );
}

import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, FileSpreadsheet } from "lucide-react";
import { inviteParticipantsBatch, type ParticipantInviteResult } from "@/lib/participants-invite.functions";
import { parseParticipantsCsv, type ParsedParticipantRow } from "@/lib/participants-csv";
import { pendingInviteRows } from "@/lib/setup";
const ROLE_LABELS: Record<ParsedParticipantRow["role"], string> = {
  admin: "Administrador",
  approver: "Aprovador",
  member: "Colaborador",
};

export function ParticipantsStep({ onFinish }: { onFinish: () => void }) {
  const inviteBatch = useServerFn(inviteParticipantsBatch);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const [rows, setRows] = useState<ParsedParticipantRow[]>([]);
  const [parseError, setParseError] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<ParticipantInviteResult[]>([]);
  const pending = pendingInviteRows(rows.filter(r => !r.error), results);

  const validRows = rows.filter((r) => !r.error);
  const invalidRows = rows.filter((r) => r.error);

  async function handleFile(file: File) {
    setParseError("");
    setResults([]);
    setFileName(file.name);
    const text = await file.text();
    const { rows: parsed, error } = parseParticipantsCsv(text);
    if (error) {
      setParseError(error);
      setRows([]);
      return;
    }
    if (parsed.length === 0) {
      setParseError("Nenhum participante encontrado na planilha.");
      setRows([]);
      return;
    }
    setRows(parsed);
  }

  async function handleSend() {
    if (pending.length === 0) return;
    setSending(true);
    try {
      const out = await inviteBatch({
        data: {
          origin: window.location.origin,
          participants: pending.map((r) => ({
            nome: r.nome,
            email: r.email,
            whatsapp: r.whatsapp,
            role: r.role,
          })),
        },
      });
      const failed = out.total - out.succeeded;
      if (out.succeeded > 0) {
        toast.success(`${out.succeeded} convite(s) enviado(s)`, {
          description: failed > 0 ? `${failed} não puderam ser enviados.` : "Todos receberão o e-mail de acesso.",
        });
      }
      if (failed > 0 && out.succeeded === 0) {
        toast.error("Nenhum convite pôde ser enviado", {
          description: "Verifique os e-mails da planilha e tente novamente.",
        });
      }
      setResults(previous => [...previous.filter(r => r.ok), ...out.results]);
    } catch (err) {
      const message = (err as { message?: string })?.message ?? "Tente novamente.";
      toast.error("Falha ao enviar convites", { description: message });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Formato da planilha (CSV)</p>
        <p className="mt-1">
          Colunas: <strong>Nome</strong>, <strong>E-mail</strong>, <strong>WhatsApp</strong> e{" "}
          <strong>Cargo/Função</strong> (admin, aprovador ou colaborador).
        </p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => fileRef.current?.click()}
        disabled={sending}
      >
        <Upload className="h-4 w-4" />
        {fileName ? "Trocar planilha" : "Selecionar planilha CSV"}
      </Button>

      {fileName && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileSpreadsheet className="h-4 w-4" /> {fileName}
        </p>
      )}

      {parseError && <p className="text-sm text-destructive">{parseError}</p>}

      {rows.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {validRows.length} válido(s)
            {invalidRows.length > 0 && ` · ${invalidRows.length} com problema`}
          </p>
          <div className="max-h-64 overflow-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Nome</th>
                  <th className="px-3 py-2 font-medium">E-mail</th>
                  <th className="px-3 py-2 font-medium">Papel</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.line} className="border-t border-border">
                    <td className="px-3 py-2">{r.nome || "—"}</td>
                    <td className="px-3 py-2">
                      {r.email || "—"}
                      {r.error && <span className="block text-xs text-destructive">{r.error}</span>}
                    </td>
                    <td className="px-3 py-2">{ROLE_LABELS[r.role]}{results.filter(result => result.email.toLowerCase() === r.email.toLowerCase()).map(result => <span key={result.email} className={result.ok ? "block text-xs text-brand" : "block text-xs text-destructive"}>{result.ok ? "Enviado" : result.error}</span>)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          className="flex-1"
          onClick={handleSend}
          disabled={sending || pending.length === 0}
        >
          {sending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending.length === 0 && results.length > 0 ? "Convites enviados" : `Enviar ${pending.length || ""} convite(s)`}
        </Button>
        <Button type="button" variant="ghost" onClick={onFinish} disabled={sending}>
          {results.length > 0 ? "Concluir configuração" : "Convidar depois"}
        </Button>
      </div>
    </div>
  );
}

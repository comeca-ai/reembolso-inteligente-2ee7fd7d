import { useRef, useState } from "react";
import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Eye, EyeOff, Check, X, Circle, Upload, FileSpreadsheet, UploadCloud, FileText, CheckCircle2 } from "lucide-react";
import {
  signUpCompany,
  isAuthenticated,
  getCurrentUser,
  markPolicyUploaded,
  SIGN_UP_STEPS,
  SIGN_UP_STEP_LABELS,
  SignUpStepError,
  type SignUpStep,
} from "@/lib/auth";
import { inviteParticipantsBatch } from "@/lib/participants-invite.functions";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { parseParticipantsCsv, type ParsedParticipantRow } from "@/lib/participants-csv";

export const Route = createFileRoute("/signup")({
  ssr: false,
  beforeLoad: async () => {
    if (await isAuthenticated()) {
      throw redirect({ to: "/overview" });
    }
  },
  component: SignupPage,
});

function maskCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

type FormState = {
  razaoSocial: string;
  cnpj: string;
  nomeResponsavel: string;
  email: string;
  whatsapp: string;
  senha: string;
  confirmarSenha: string;
  aceite: boolean;
};

type Errors = Partial<Record<keyof FormState, string>>;

function SignupPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"form" | "politica" | "participants">("form");
  const [form, setForm] = useState<FormState>({
    razaoSocial: "",
    cnpj: "",
    nomeResponsavel: "",
    email: "",
    whatsapp: "",
    senha: "",
    confirmarSenha: "",
    aceite: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<SignUpStep | null>(null);
  const [failedStep, setFailedStep] = useState<SignUpStep | null>(null);
  const [failedMessage, setFailedMessage] = useState<string>("");

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    const next: Errors = {};
    if (!form.razaoSocial.trim()) next.razaoSocial = "Informe a razão social.";
    const cnpjDigits = form.cnpj.replace(/\D/g, "");
    if (!cnpjDigits) next.cnpj = "Informe o CNPJ.";
    else if (cnpjDigits.length !== 14) next.cnpj = "CNPJ deve ter 14 dígitos.";
    if (!form.nomeResponsavel.trim()) next.nomeResponsavel = "Informe o responsável.";
    if (!form.email.trim()) next.email = "Informe o e-mail corporativo.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "E-mail inválido.";
    if (!form.whatsapp.replace(/\D/g, "")) next.whatsapp = "Informe o WhatsApp.";
    if (!form.senha) next.senha = "Crie uma senha.";
    else if (form.senha.length < 8) next.senha = "Mínimo de 8 caracteres.";
    if (form.confirmarSenha !== form.senha)
      next.confirmarSenha = "As senhas não conferem.";
    if (!form.aceite) next.aceite = "É necessário aceitar os termos.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await runSignup();
  }

  async function runSignup() {
    setLoading(true);
    setFailedStep(null);
    setFailedMessage("");
    setCurrentStep("validando");
    setProgressOpen(true);
    try {
      const result = await signUpCompany(
        {
          razaoSocial: form.razaoSocial,
          cnpj: form.cnpj,
          nomeResponsavel: form.nomeResponsavel,
          email: form.email,
          whatsapp: form.whatsapp,
          senha: form.senha,
        },
        (step) => setCurrentStep(step),
      );

      if (result.status === "confirmation_required") {
        setProgressOpen(false);
        toast.success("Quase lá! Confirme seu e-mail", {
          description: `Enviamos um link de confirmação para ${form.email.trim()}. Confirme para acessar o painel.`,
        });
        navigate({ to: "/login" });
        return;
      }

      setProgressOpen(false);
      toast.success("Conta criada!", {
        description: `${form.razaoSocial} está pronta. Agora envie a política de reembolso da empresa — primeiro passo do setup.`,
      });
      setPhase("politica");
    } catch (err) {
      const message = (err as { message?: string })?.message ?? "";
      let description = "Tente novamente em instantes.";
      if (/weak|pwned|password/i.test(message)) {
        description =
          "Essa senha é muito comum ou apareceu em vazamentos. Crie uma senha mais forte e única.";
      } else if (/already registered|already been registered|user already|já possui conta/i.test(message)) {
        description = "Este e-mail já possui conta. Tente entrar ou recuperar a senha.";
      } else if (/network|fetch|failed to fetch/i.test(message)) {
        description = "Falha de conexão. Verifique sua internet e tente novamente.";
      }

      // Marca a etapa em que o processo parou, para o usuário ver "até onde foi".
      if (err instanceof SignUpStepError) {
        setFailedStep(err.step);
      } else {
        setFailedStep(currentStep);
      }
      setFailedMessage(description);
      toast.error("Não foi possível concluir o pré-cadastro", { description });
    } finally {
      setLoading(false);
    }
  }


  if (phase === "politica") {
    return (
      <AuthLayout
        eyebrow="Configurar a solução"
        title="Envie a política da empresa"
        subtitle="Primeiro passo do setup: a IA lê a sua política de reembolso para avaliar cada despesa automaticamente."
      >
        <PoliticaStep
          onFinish={() => setPhase("participants")}
          onSkip={() => setPhase("participants")}
        />
      </AuthLayout>
    );
  }

  if (phase === "participants") {
    return (
      <AuthLayout
        eyebrow="Configurar a solução"
        title="Participantes da equipe"
        subtitle="Suba uma planilha (CSV) com quem vai participar. Cada pessoa recebe acesso e o convite por e-mail."
      >
        <ParticipantsStep onFinish={() => navigate({ to: "/overview" })} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Configurar a solução"
      title="Configure a solução"
      subtitle="Cadastre sua empresa e o primeiro administrador para começar o setup."
    >

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <Field label="Razão social" error={errors.razaoSocial}>
          <Input
            placeholder="Sua Empresa Ltda."
            value={form.razaoSocial}
            onChange={(e) => set("razaoSocial", e.target.value)}
            aria-invalid={!!errors.razaoSocial}
          />
        </Field>

        <Field label="CNPJ" error={errors.cnpj}>
          <Input
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
            value={form.cnpj}
            onChange={(e) => set("cnpj", maskCnpj(e.target.value))}
            aria-invalid={!!errors.cnpj}
          />
        </Field>

        <Field label="Nome do responsável" error={errors.nomeResponsavel}>
          <Input
            placeholder="Maria Silva"
            value={form.nomeResponsavel}
            onChange={(e) => set("nomeResponsavel", e.target.value)}
            aria-invalid={!!errors.nomeResponsavel}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="E-mail corporativo" error={errors.email}>
            <Input
              type="email"
              placeholder="voce@empresa.com.br"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              aria-invalid={!!errors.email}
            />
          </Field>
          <Field label="WhatsApp" error={errors.whatsapp}>
            <Input
              placeholder="(11) 99999-9999"
              inputMode="numeric"
              value={form.whatsapp}
              onChange={(e) => set("whatsapp", maskPhone(e.target.value))}
              aria-invalid={!!errors.whatsapp}
            />
          </Field>
        </div>

        <Field label="Senha" error={errors.senha}>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo de 8 caracteres"
              value={form.senha}
              onChange={(e) => set("senha", e.target.value)}
              aria-invalid={!!errors.senha}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <Field label="Confirmar senha" error={errors.confirmarSenha}>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Repita a senha"
            value={form.confirmarSenha}
            onChange={(e) => set("confirmarSenha", e.target.value)}
            aria-invalid={!!errors.confirmarSenha}
          />
        </Field>

        <div className="space-y-1.5">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="aceite"
              checked={form.aceite}
              onCheckedChange={(v) => set("aceite", v === true)}
              className="mt-0.5"
            />
            <Label htmlFor="aceite" className="text-sm font-normal leading-snug text-muted-foreground">
              Li e aceito os termos de uso e a política de privacidade (LGPD) do
              reembolso.ia.br.
            </Label>
          </div>
          {errors.aceite && <p className="text-xs text-destructive">{errors.aceite}</p>}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Criando conta…" : "Configurar a solução"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link to="/login" className="font-semibold text-brand hover:underline">
          Entrar
        </Link>
      </p>

      <SignupProgressDialog
        open={progressOpen}
        loading={loading}
        currentStep={currentStep}
        failedStep={failedStep}
        failedMessage={failedMessage}
        onClose={() => setProgressOpen(false)}
        onRetry={() => {
          setFailedStep(null);
          setFailedMessage("");
          void runSignup();
        }}
      />
    </AuthLayout>
  );
}

function SignupProgressDialog({
  open,
  loading,
  currentStep,
  failedStep,
  failedMessage,
  onClose,
  onRetry,
}: {
  open: boolean;
  loading: boolean;
  currentStep: SignUpStep | null;
  failedStep: SignUpStep | null;
  failedMessage: string;
  onClose: () => void;
  onRetry: () => void;
}) {
  // Etapas exibidas (sem "concluido", que vira o estado final de sucesso).
  const steps: SignUpStep[] = SIGN_UP_STEPS.filter((s) => s !== "concluido");
  const failedIndex = failedStep ? steps.indexOf(failedStep) : -1;
  const currentIndex = currentStep ? steps.indexOf(currentStep) : -1;

  return (
    <Dialog open={open} onOpenChange={(v) => (!v && !loading ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {failedStep ? "O pré-cadastro foi interrompido" : "Processando pré-cadastro"}
          </DialogTitle>
          <DialogDescription>
            {failedStep
              ? "Veja abaixo até onde o processo chegou antes de falhar."
              : "Aguarde enquanto criamos sua conta."}
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2">
          {steps.map((step, i) => {
            const isFailed = failedStep !== null && i === failedIndex;
            const isDone =
              failedStep !== null ? i < failedIndex : currentIndex > i || (!loading && !failedStep);
            const isActive =
              failedStep === null && loading && i === currentIndex;
            return (
              <li key={step} className="flex items-center gap-3 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {isFailed ? (
                    <X className="h-4 w-4 text-destructive" />
                  ) : isDone ? (
                    <Check className="h-4 w-4 text-brand" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 animate-spin text-brand" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-muted-foreground/40" />
                  )}
                </span>
                <span
                  className={
                    isFailed
                      ? "text-destructive font-medium"
                      : isDone
                        ? "text-foreground"
                        : isActive
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                  }
                >
                  {SIGN_UP_STEP_LABELS[step]}
                </span>
              </li>
            );
          })}
        </ul>

        {failedStep && (
          <div className="space-y-3 rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">{failedMessage}</p>
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={onRetry} disabled={loading}>
                {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                Tentar novamente
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={onClose} disabled={loading}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

const POLICY_MAX_MB = 10;
const POLICY_ACCEPT = [".pdf", ".doc", ".docx"];

function PoliticaStep({ onFinish, onSkip }: { onFinish: () => void; onSkip: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [erro, setErro] = useState<string | undefined>();
  const [dragging, setDragging] = useState(false);
  const [enviando, setEnviando] = useState(false);

  function validar(f: File): string | undefined {
    const ok = POLICY_ACCEPT.some((ext) => f.name.toLowerCase().endsWith(ext));
    if (!ok) return "Formato inválido. Envie um PDF, DOC ou DOCX.";
    if (f.size > POLICY_MAX_MB * 1024 * 1024) return `Arquivo acima de ${POLICY_MAX_MB} MB.`;
    return undefined;
  }

  function selecionar(f: File | null) {
    if (!f) return;
    const e = validar(f);
    setErro(e);
    setFile(e ? null : f);
  }

  async function concluir() {
    if (!file) return;
    setEnviando(true);
    try {
      await api.uploadPolicy(file.name, getCurrentUser()?.nome ?? "Admin");
      await markPolicyUploaded(file.name);
      toast.success("Política ativada", {
        description: "A IA já pode avaliar despesas com base nas suas regras.",
      });
      onFinish();
    } catch {
      setEnviando(false);
      toast.error("Não foi possível enviar agora. Tente novamente.");
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept={POLICY_ACCEPT.join(",")}
        className="hidden"
        onChange={(e) => selecionar(e.target.files?.[0] ?? null)}
      />

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            selecionar(e.dataTransfer.files?.[0] ?? null);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
            dragging
              ? "border-brand bg-brand/5"
              : "border-border bg-secondary/30 hover:bg-secondary/50",
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
            <UploadCloud className="h-6 w-6 text-brand" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">
            Arraste o arquivo ou clique para selecionar
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF, DOC ou DOCX · até {POLICY_MAX_MB} MB
          </p>
        </button>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-brand/30 bg-brand/5 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand/15">
            <FileText className="h-5 w-5 text-brand" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
            aria-label="Remover arquivo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <Button onClick={concluir} disabled={!file || enviando} className="w-full gap-2" size="lg">
        {enviando ? (
          "Ativando política…"
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Ativar política e continuar
          </>
        )}
      </Button>
      <button
        type="button"
        onClick={onSkip}
        className="w-full text-center text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Enviar depois — continuar sem política
      </button>
      <p className="text-center text-xs text-muted-foreground">
        Sem a política, a análise automática fica desativada até você enviá-la na tela de Política.
      </p>
    </div>
  );
}

const ROLE_LABELS: Record<ParsedParticipantRow["role"], string> = {
  admin: "Administrador",
  approver: "Aprovador",
  member: "Colaborador",
};

function ParticipantsStep({ onFinish }: { onFinish: () => void }) {
  const inviteBatch = useServerFn(inviteParticipantsBatch);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const [rows, setRows] = useState<ParsedParticipantRow[]>([]);
  const [parseError, setParseError] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const validRows = rows.filter((r) => !r.error);
  const invalidRows = rows.filter((r) => r.error);

  async function handleFile(file: File) {
    setParseError("");
    setDone(false);
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
    if (validRows.length === 0) return;
    setSending(true);
    try {
      const out = await inviteBatch({
        data: {
          origin: window.location.origin,
          participants: validRows.map((r) => ({
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
      setDone(true);
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
                    <td className="px-3 py-2">{ROLE_LABELS[r.role]}</td>
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
          disabled={sending || validRows.length === 0 || done}
        >
          {sending && <Loader2 className="h-4 w-4 animate-spin" />}
          {done ? "Convites enviados" : `Enviar ${validRows.length || ""} convite(s)`}
        </Button>
        <Button type="button" variant="ghost" onClick={onFinish} disabled={sending}>
          {done ? "Ir ao painel" : "Pular"}
        </Button>
      </div>
    </div>
  );
}




function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

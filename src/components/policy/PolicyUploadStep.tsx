import { useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { UploadCloud, FileText, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { uploadAndExtractPolicy } from '@/lib/policy.functions';
import { validatePolicyFile } from '@/lib/setup';

export function PolicyUploadStep({ onFinish }: { onFinish: () => Promise<void> }) {
  const upload = useServerFn(uploadAndExtractPolicy);
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  function select(candidate?: File) {
    if (!candidate) return;
    const message = validatePolicyFile(candidate);
    setError(message); setFile(message ? null : candidate); setUploaded(false);
  }
  async function finish(skip = false) {
    setBusy(true); setError(undefined);
    try {
      if (!skip && !uploaded) {
        if (!file) return;
        const fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
          reader.onerror = () => reject(new Error('Não foi possível abrir o PDF.'));
          reader.readAsDataURL(file);
        });
        const result = await upload({ data: { fileName: file.name, fileBase64 } });
        if (!result.ok || result.rulesCount < 1) throw new Error('Nenhuma regra foi identificada.');
        setUploaded(true);
        toast.success('Política ativada', { description: `${result.rulesCount} regras identificadas no documento.` });
      }
      await onFinish();
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível continuar.'); }
    finally { setBusy(false); }
  }
  return <div className="space-y-4">
    <input aria-label="Política da empresa em PDF" ref={input} type="file" accept=".pdf,application/pdf" className="hidden" disabled={busy} onChange={e => select(e.target.files?.[0])} />
    <div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (!busy) select(e.dataTransfer.files[0]); }} className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/30 px-6 py-8 text-center">
      <UploadCloud className="h-8 w-8 text-brand" />
      <Button variant="outline" onClick={() => input.current?.click()} disabled={busy}>{file ? 'Trocar documento' : 'Selecionar política em PDF'}</Button>
      <p className="text-xs text-muted-foreground">PDF · até 10 MB</p>
    </div>
    {file && <div className="flex items-center gap-3 rounded-lg border border-border p-3"><FileText className="h-5 w-5 shrink-0 text-brand" /><span className="min-w-0 flex-1 break-all text-sm">{file.name}</span><Button variant="ghost" size="icon" aria-label="Remover documento" disabled={busy} onClick={() => { setFile(null); setUploaded(false); if (input.current) input.current.value = ''; }}><X className="h-4 w-4" /></Button></div>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button className="w-full" disabled={busy || !file} onClick={() => void finish()}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? 'Processando documento…' : uploaded ? 'Continuar' : 'Ativar política e continuar'}</Button>
    <Button variant="ghost" className="w-full" disabled={busy} onClick={() => void finish(true)}>Enviar depois</Button>
  </div>;
}
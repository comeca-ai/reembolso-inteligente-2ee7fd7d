export type SetupStep = 'policy' | 'participants' | 'completed';
export function nextSetupStep(step: SetupStep): SetupStep {
  return step === 'policy' ? 'participants' : 'completed';
}
export function pendingInviteRows<T extends { email: string }>(rows: T[], results: Array<{ email: string; ok: boolean }>): T[] {
  const sent = new Set(results.filter(r => r.ok).map(r => r.email.toLowerCase()));
  return rows.filter(r => !sent.has(r.email.toLowerCase()));
}
export function validatePolicyFile(file: { name: string; size: number }): string | undefined {
  if (!file.name.toLowerCase().endsWith('.pdf')) return 'Envie um arquivo PDF.';
  if (file.size > 10 * 1024 * 1024) return 'O arquivo deve ter no máximo 10 MB.';
  if (file.size === 0) return 'O arquivo está vazio.';
}
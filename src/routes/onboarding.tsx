import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import { landingForRole } from '@/lib/permissions';
import { getSetupProgress, saveSetupProgress } from '@/lib/setup.functions';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PolicyUploadStep } from '@/components/policy/PolicyUploadStep';
import { ParticipantsStep } from '@/components/auth/ParticipantsStep';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/onboarding')({
  ssr: false,
  head: () => ({ meta: [{ title: 'Configuração inicial · reembolsa aí' }, { name: 'description', content: 'Configure a política da empresa e os participantes da operação.' }, { property: 'og:title', content: 'Configuração inicial · reembolsa aí' }, { property: 'og:description', content: 'Política e participantes para sua operação corporativa.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  beforeLoad: async () => {
    if (!(await isAuthenticated())) throw redirect({ to: '/login' });
    const role = getCurrentUser()?.role;
    if (role !== 'admin') throw redirect({ to: landingForRole(role) });
  },
  component: OnboardingPage,
});
function OnboardingPage() {
  const navigate = useNavigate();
  const read = useServerFn(getSetupProgress);
  const save = useServerFn(saveSetupProgress);
  const query = useQuery({ queryKey: ['company-setup', getCurrentUser()?.company.id], queryFn: () => read() });
  async function advance(step: 'participants' | 'completed') {
    await save({ data: { step } });
    await query.refetch();
    if (step === 'completed') await navigate({ to: landingForRole(getCurrentUser()?.role) });
  }
  const step = query.data?.step;
  return <AuthLayout eyebrow="Configurar a solução" title={step === 'participants' ? 'Participantes da empresa' : step === 'completed' ? 'Configuração concluída' : 'Política da empresa'} subtitle={getCurrentUser()?.company.razao_social ?? 'Configuração corporativa'}>
    <ol aria-label="Etapas da configuração" className="mb-6 flex flex-wrap gap-4 text-xs text-muted-foreground"><li>1. Empresa e conta</li><li className={step === 'policy' ? 'font-semibold text-brand' : ''} aria-current={step === 'policy' ? 'step' : undefined}>2. Política</li><li className={step === 'participants' ? 'font-semibold text-brand' : ''} aria-current={step === 'participants' ? 'step' : undefined}>3. Participantes</li></ol>
    {query.isPending ? <p role="status" className="text-sm text-muted-foreground">Carregando configuração…</p> : query.isError ? <div><p role="alert" className="mb-3 text-sm text-destructive">Não foi possível carregar a configuração.</p><Button onClick={() => void query.refetch()}>Tentar novamente</Button></div> : step === 'policy' ? <PolicyUploadStep onFinish={() => advance('participants')} /> : step === 'participants' ? <ParticipantsStep onFinish={() => { void advance('completed').catch(() => toast.error('Não foi possível concluir. Tente novamente.')); }} /> : <Button className="w-full" onClick={() => navigate({ to: landingForRole(getCurrentUser()?.role) })}>Entrar na aplicação</Button>}
    <Button variant="link" className="mt-4 w-full" onClick={() => navigate({ to: landingForRole(getCurrentUser()?.role) })}>Continuar na aplicação</Button>
  </AuthLayout>;
}

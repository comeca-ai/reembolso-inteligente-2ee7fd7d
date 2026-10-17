import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getSetupProgress = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile, error } = await context.supabase.from('profiles').select('company_id').eq('id', context.userId).single();
    if (error || !profile?.company_id) throw new Error('Empresa não encontrada.');
    const { data, error: readError } = await context.supabase.from('company_setup_progress').select('step').eq('company_id', profile.company_id).maybeSingle();
    if (readError) throw new Error('Não foi possível carregar a configuração.');
    return { step: z.enum(['policy', 'participants', 'completed']).parse(data?.step ?? 'policy') };
  });

export const saveSetupProgress = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ step: z.enum(['policy', 'participants', 'completed']) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: profile, error } = await context.supabase.from('profiles').select('company_id').eq('id', context.userId).single();
    if (error || !profile?.company_id) throw new Error('Empresa não encontrada.');
    const { error: writeError } = await context.supabase.from('company_setup_progress').upsert({ company_id: profile.company_id, step: data.step, updated_at: new Date().toISOString() });
    if (writeError) throw new Error('Não foi possível salvar a etapa.');
    return { step: data.step };
  });
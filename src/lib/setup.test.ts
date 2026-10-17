import { describe, expect, it } from 'vitest';
import { nextSetupStep, pendingInviteRows, validatePolicyFile } from './setup';
describe('configuração corporativa', () => {
  it('política vem antes dos participantes', () => expect(nextSetupStep('policy')).toBe('participants'));
  it('participantes concluem a configuração', () => expect(nextSetupStep('participants')).toBe('completed'));
  it('não repete convites enviados', () => expect(pendingInviteRows([{ email: 'a@empresa.com' }, { email: 'b@empresa.com' }], [{ email: 'A@empresa.com', ok: true }, { email: 'b@empresa.com', ok: false }])).toEqual([{ email: 'b@empresa.com' }]));
  it('aceita PDF de 10 MB', () => expect(validatePolicyFile({ name: 'politica.pdf', size: 10 * 1024 * 1024 })).toBeUndefined());
  it('rejeita tamanho acima do limite', () => expect(validatePolicyFile({ name: 'politica.pdf', size: 10 * 1024 * 1024 + 1 })).toBeDefined());
  it('não aceita DOC sem conversão', () => expect(validatePolicyFile({ name: 'politica.doc', size: 100 })).toBeDefined());
});
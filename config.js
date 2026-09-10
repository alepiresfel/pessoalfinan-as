/* ============================================================
   Chaves do projeto no Supabase — já preenchidas.

   A chave "publishable" é pública de propósito: sozinha ela não
   abre nada, porque quem protege os dados são as regras (RLS)
   criadas pelo arquivo supabase.sql. NUNCA troque por uma chave
   "secret" (sb_secret_...): essa dá acesso total e ignora as regras.

   Se um dia trocar de projeto, as duas ficam em
   Supabase → botão "Connect" (ou Settings → API Keys).
   ============================================================ */

window.FINCONFIG = {
  url: 'https://ijwtxhmduowmgeuznyds.supabase.co',
  anonKey: 'sb_publishable_1RUKhAi0SaKhdLlzjt5RDg_kxT0cX7r',

  // cor de destaque do app (opcional)
  accent: '#6E747F',
};

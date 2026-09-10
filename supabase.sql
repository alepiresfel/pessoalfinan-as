-- ============================================================
--  Finanças pessoais — estrutura no Supabase
--  Cole TUDO isto no SQL Editor do Supabase e clique em "Run".
--  Pode rodar mais de uma vez sem problema.
-- ============================================================

-- ---------- 1. quem tem permissão de usar o app ----------
create table if not exists public.membros (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  nome       text not null default '',
  email      text,
  criado_em  timestamptz not null default now()
);

-- ---------- 2. os dados (um único documento compartilhado) ----------
create table if not exists public.cofre (
  id          text primary key,
  dados       jsonb not null default '{}'::jsonb,
  rev         bigint not null default 1,
  updated_by  uuid,
  updated_at  timestamptz not null default now()
);

alter table public.membros enable row level security;
alter table public.cofre   enable row level security;

-- ---------- 3. "esta pessoa é membro?" ----------
-- security definer para a regra da tabela membros não consultar a si mesma
create or replace function public.e_membro()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.membros m where m.user_id = auth.uid());
$$;

revoke all on function public.e_membro() from public;
grant execute on function public.e_membro() to authenticated;

-- ---------- 4. regras de acesso (RLS) ----------
-- sem estar logado e sem estar em "membros", ninguém lê nem escreve nada
drop policy if exists membros_select on public.membros;
create policy membros_select on public.membros
  for select to authenticated using (public.e_membro());

drop policy if exists cofre_select on public.cofre;
create policy cofre_select on public.cofre
  for select to authenticated using (public.e_membro());

drop policy if exists cofre_insert on public.cofre;
create policy cofre_insert on public.cofre
  for insert to authenticated with check (public.e_membro());

drop policy if exists cofre_update on public.cofre;
create policy cofre_update on public.cofre
  for update to authenticated using (public.e_membro()) with check (public.e_membro());
-- de propósito não existe política de DELETE: ninguém apaga o documento pelo app

-- ---------- 5. todo usuário novo entra em "membros" automaticamente ----------
-- (seguro porque o cadastro público fica desligado: só você cria usuários)
create or replace function public.novo_membro()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.membros (user_id, nome, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'nome', ''), split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.novo_membro();

-- ---------- 6. inclui os usuários que já existiam ----------
insert into public.membros (user_id, nome, email)
select u.id,
       coalesce(nullif(u.raw_user_meta_data->>'nome', ''), split_part(u.email, '@', 1)),
       u.email
from auth.users u
on conflict (user_id) do nothing;

-- ---------- conferência ----------
select user_id, nome, email from public.membros order by criado_em;

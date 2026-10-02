-- PairsGratuitEsport — RLS, privilèges de colonnes, vues publiques
-- A coller APRES 0001_init.sql

-- On repart d'une base saine : on retire tout accès par défaut, puis on
-- ré-accorde explicitement le strict nécessaire par rôle. Toutes les
-- écritures sensibles (solde de points, paris, ledger) ne passent JAMAIS
-- par un GRANT direct : uniquement par les fonctions RPC "security definer"
-- du fichier 0003_functions.sql, qui s'exécutent avec les droits du
-- propriétaire (postgres) et contournent ces restrictions par conception.

revoke all on all tables in schema public from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ---------- profiles ----------
alter table public.profiles enable row level security;

grant select on public.profiles to authenticated;
grant update (username, bio, avatar_url) on public.profiles to authenticated;

create policy "profiles_select_all" on public.profiles
  for select to authenticated using (true);

create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- ---------- games / teams / matches / rating history (catalogue public) ----------
alter table public.games enable row level security;
alter table public.teams enable row level security;
alter table public.matches enable row level security;
alter table public.team_rating_history enable row level security;

grant select on public.games, public.teams, public.matches, public.team_rating_history to anon, authenticated;

create policy "games_select_all" on public.games for select to anon, authenticated using (true);
create policy "teams_select_all" on public.teams for select to anon, authenticated using (true);
create policy "matches_select_all" on public.matches for select to anon, authenticated using (true);
create policy "rating_history_select_all" on public.team_rating_history for select to anon, authenticated using (true);
-- Aucune policy insert/update/delete : écriture réservée au service_role (crons de synchro).

-- ---------- bets / point_ledger (lecture privée, écriture RPC uniquement) ----------
alter table public.bets enable row level security;
alter table public.point_ledger enable row level security;

grant select on public.bets, public.point_ledger to authenticated;

create policy "bets_select_own" on public.bets
  for select to authenticated using (auth.uid() = user_id);

create policy "ledger_select_own" on public.point_ledger
  for select to authenticated using (auth.uid() = user_id);

-- ---------- quiz_questions (jamais lu en direct par le client) ----------
alter table public.quiz_questions enable row level security;

create policy "quiz_questions_admin_all" on public.quiz_questions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select, insert, update, delete on public.quiz_questions to authenticated;
-- La policy "admin_all" restreint malgré tout l'accès réel aux seuls admins.

-- Vue exposée aux joueurs : ne renvoie jamais `correct_index`.
create view public.quiz_questions_public as
  select id, game_id, question, choices, difficulty
  from public.quiz_questions
  where is_active;

grant select on public.quiz_questions_public to authenticated;

-- ---------- daily_quiz / quiz_attempts ----------
alter table public.daily_quiz enable row level security;
alter table public.quiz_attempts enable row level security;

grant select on public.daily_quiz to anon, authenticated;
create policy "daily_quiz_select_all" on public.daily_quiz for select to anon, authenticated using (true);

grant select on public.quiz_attempts to authenticated;
create policy "quiz_attempts_select_own" on public.quiz_attempts
  for select to authenticated using (auth.uid() = user_id);

-- ---------- groups / group_members / snapshots ----------
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_tournament_snapshot enable row level security;

grant select, insert (name, owner_id, tournament_start, tournament_end) on public.groups to authenticated;
grant update (name, tournament_start, tournament_end) on public.groups to authenticated;

create policy "groups_select_member_or_owner" on public.groups
  for select to authenticated using (
    owner_id = auth.uid()
    or exists (select 1 from public.group_members gm where gm.group_id = groups.id and gm.user_id = auth.uid())
  );

create policy "groups_insert_as_owner" on public.groups
  for insert to authenticated with check (owner_id = auth.uid());

create policy "groups_update_owner" on public.groups
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

grant select on public.group_members to authenticated;
create policy "group_members_select_same_group" on public.group_members
  for select to authenticated using (
    exists (select 1 from public.group_members gm2 where gm2.group_id = group_members.group_id and gm2.user_id = auth.uid())
  );
-- Aucune policy insert : l'adhésion passe uniquement par la RPC join_group().

grant select on public.group_tournament_snapshot to authenticated;
create policy "group_snapshot_select_same_group" on public.group_tournament_snapshot
  for select to authenticated using (
    exists (select 1 from public.group_members gm where gm.group_id = group_tournament_snapshot.group_id and gm.user_id = auth.uid())
  );

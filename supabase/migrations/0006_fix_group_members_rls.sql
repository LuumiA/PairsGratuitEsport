-- PairsGratuitEsport — corrige une récursion infinie RLS sur group_members
-- A coller APRES 0005_group_leaderboard.sql
--
-- La policy group_members_select_same_group interrogeait group_members
-- depuis sa propre clause USING, ce qui redéclenche la policy sur la
-- sous-requête -> boucle infinie ("infinite recursion detected in policy
-- for relation group_members"). Fix : passer par une fonction
-- security definer, qui s'exécute avec les droits du propriétaire (postgres)
-- et contourne donc la RLS pour sa requête interne — même pattern que is_admin().

drop policy if exists "group_members_select_same_group" on public.group_members;

create or replace function public.is_group_member(p_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid()
  );
$$;

revoke all on function public.is_group_member(uuid) from public;
grant execute on function public.is_group_member(uuid) to authenticated;

create policy "group_members_select_same_group" on public.group_members
  for select to authenticated using (public.is_group_member(group_id));

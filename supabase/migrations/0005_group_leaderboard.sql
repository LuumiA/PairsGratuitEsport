-- PairsGratuitEsport — classement d'un mini-tournoi de groupe
-- A coller APRES 0004_storage.sql

-- Points gagnés par chaque membre PENDANT la fenêtre du tournoi (bornée par
-- sa date d'adhésion si elle est postérieure au début du tournoi) : on
-- additionne simplement les mouvements du ledger déjà existant, sans avoir
-- à tagger chaque pari par groupe. Visible uniquement par les membres du
-- groupe (vérifié via exists() dans la fonction elle-même).
create or replace function public.get_group_leaderboard(p_group_id uuid)
returns table (user_id uuid, username text, avatar_url text, points_delta bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    p.username,
    p.avatar_url,
    coalesce(sum(pl.amount) filter (
      where pl.created_at >= greatest(g.tournament_start, gm.joined_at)
        and pl.created_at <= least(g.tournament_end, now())
    ), 0)::bigint as points_delta
  from public.groups g
  join public.group_members gm on gm.group_id = g.id
  join public.profiles p on p.id = gm.user_id
  left join public.point_ledger pl on pl.user_id = gm.user_id
  where g.id = p_group_id
    and exists (
      select 1 from public.group_members me
      where me.group_id = p_group_id and me.user_id = auth.uid()
    )
  group by p.id, p.username, p.avatar_url
  order by points_delta desc;
$$;

revoke all on function public.get_group_leaderboard(uuid) from public;
grant execute on function public.get_group_leaderboard(uuid) to authenticated;

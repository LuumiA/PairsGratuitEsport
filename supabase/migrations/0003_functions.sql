-- PairsGratuitEsport — triggers & fonctions RPC atomiques
-- A coller APRES 0002_security.sql

-- ---------- auto-création du profil à l'inscription ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'player_' || substr(new.id::text, 1, 8))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- le créateur d'un groupe en devient automatiquement membre ----------
create or replace function public.handle_new_group()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.group_members (group_id, user_id) values (new.id, new.owner_id);
  return new;
end;
$$;

create trigger on_group_created
  after insert on public.groups
  for each row execute function public.handle_new_group();

-- ---------- place_bet : pose atomique d'un pari ----------
create or replace function public.place_bet(
  p_match_id bigint,
  p_team_id bigint,
  p_stake bigint,
  p_idempotency_key uuid
)
returns public.bets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_match public.matches;
  v_balance bigint;
  v_odds numeric;
  v_bet public.bets;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  if p_stake <= 0 then
    raise exception 'stake must be positive';
  end if;

  select * into v_match from public.matches where id = p_match_id for update;
  if not found then
    raise exception 'match not found';
  end if;
  if v_match.status <> 'upcoming' or v_match.betting_locked_at is not null then
    raise exception 'betting closed for this match';
  end if;
  if p_team_id <> v_match.team_a_id and p_team_id <> v_match.team_b_id then
    raise exception 'invalid team for this match';
  end if;

  select points_balance into v_balance from public.profiles where id = v_uid for update;
  if v_balance is null then
    raise exception 'profile not found';
  end if;
  if p_stake > v_balance then
    raise exception 'insufficient balance';
  end if;

  v_odds := case when p_team_id = v_match.team_a_id then v_match.odds_a else v_match.odds_b end;
  if v_odds is null then
    raise exception 'odds unavailable for this match';
  end if;

  begin
    insert into public.bets (user_id, match_id, chosen_team_id, stake, odds, idempotency_key)
    values (v_uid, p_match_id, p_team_id, p_stake, v_odds, p_idempotency_key)
    returning * into v_bet;
  exception when unique_violation then
    select * into v_bet from public.bets where user_id = v_uid and idempotency_key = p_idempotency_key;
    return v_bet;
  end;

  update public.profiles
    set points_balance = points_balance - p_stake
    where id = v_uid
    returning points_balance into v_balance;

  insert into public.point_ledger (user_id, amount, balance_after, reason, ref_bet_id)
  values (v_uid, -p_stake, v_balance, 'bet_stake', v_bet.id);

  return v_bet;
end;
$$;

revoke all on function public.place_bet(bigint, bigint, bigint, uuid) from public;
grant execute on function public.place_bet(bigint, bigint, bigint, uuid) to authenticated;

-- ---------- settle_match : règlement atomique + mise à jour Elo (service_role uniquement) ----------
create or replace function public.settle_match(
  p_match_id bigint,
  p_winner_team_id bigint
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.matches;
  v_bet public.bets;
  v_payout bigint;
  v_balance bigint;
  v_ra numeric;
  v_rb numeric;
  v_ea numeric;
  v_eb numeric;
  v_sa numeric;
  v_sb numeric;
  v_k numeric := 32;
begin
  select * into v_match from public.matches where id = p_match_id for update;
  if not found then
    raise exception 'match not found';
  end if;
  if v_match.settled_at is not null then
    return; -- déjà réglé : no-op idempotent, rejouable sans risque par le cron
  end if;
  if p_winner_team_id <> v_match.team_a_id and p_winner_team_id <> v_match.team_b_id then
    raise exception 'invalid winner team';
  end if;

  update public.matches
    set status = 'finished', winner_team_id = p_winner_team_id, settled_at = now()
    where id = p_match_id;

  for v_bet in select * from public.bets where match_id = p_match_id and outcome = 'pending' for update loop
    if v_bet.chosen_team_id = p_winner_team_id then
      v_payout := round(v_bet.stake * v_bet.odds);
      update public.profiles set points_balance = points_balance + v_payout
        where id = v_bet.user_id
        returning points_balance into v_balance;
      insert into public.point_ledger (user_id, amount, balance_after, reason, ref_bet_id)
        values (v_bet.user_id, v_payout, v_balance, 'bet_payout', v_bet.id);
      update public.bets set outcome = 'won', payout = v_payout where id = v_bet.id;
    else
      update public.bets set outcome = 'lost', payout = 0 where id = v_bet.id;
    end if;
  end loop;

  select rating into v_ra from public.teams where id = v_match.team_a_id;
  select rating into v_rb from public.teams where id = v_match.team_b_id;
  v_ea := 1.0 / (1 + power(10, (v_rb - v_ra) / 400.0));
  v_eb := 1 - v_ea;
  v_sa := case when p_winner_team_id = v_match.team_a_id then 1 else 0 end;
  v_sb := 1 - v_sa;

  insert into public.team_rating_history (team_id, match_id, rating_before, rating_after)
  values (v_match.team_a_id, p_match_id, v_ra, v_ra + v_k * (v_sa - v_ea));
  insert into public.team_rating_history (team_id, match_id, rating_before, rating_after)
  values (v_match.team_b_id, p_match_id, v_rb, v_rb + v_k * (v_sb - v_eb));

  update public.teams set rating = v_ra + v_k * (v_sa - v_ea), rating_updated_at = now() where id = v_match.team_a_id;
  update public.teams set rating = v_rb + v_k * (v_sb - v_eb), rating_updated_at = now() where id = v_match.team_b_id;
end;
$$;

revoke all on function public.settle_match(bigint, bigint) from public;
grant execute on function public.settle_match(bigint, bigint) to service_role;

-- ---------- submit_quiz : correction + crédit de points, anti-rejeu ----------
create or replace function public.submit_quiz(
  p_quiz_date date,
  p_answers jsonb -- [{"question_id": 1, "chosen_index": 2}, ...]
)
returns public.quiz_attempts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_daily public.daily_quiz;
  v_question public.quiz_questions;
  v_answer jsonb;
  v_qid bigint;
  v_chosen smallint;
  v_score smallint := 0;
  v_points bigint := 0;
  v_balance bigint;
  v_attempt public.quiz_attempts;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select * into v_daily from public.daily_quiz where quiz_date = p_quiz_date;
  if not found then
    raise exception 'no quiz for this date';
  end if;

  for v_answer in select * from jsonb_array_elements(p_answers) loop
    v_qid := (v_answer ->> 'question_id')::bigint;
    v_chosen := (v_answer ->> 'chosen_index')::smallint;
    if v_qid = any (v_daily.question_ids) then
      select * into v_question from public.quiz_questions where id = v_qid;
      if found and v_question.correct_index = v_chosen then
        v_score := v_score + 1;
        v_points := v_points + (50 * v_question.difficulty);
      end if;
    end if;
  end loop;

  -- la contrainte unique(user_id, quiz_date) bloque tout rejeu : la 2e tentative lève une erreur
  insert into public.quiz_attempts (user_id, quiz_date, answers, score, points_awarded)
  values (v_uid, p_quiz_date, p_answers, v_score, v_points)
  returning * into v_attempt;

  update public.profiles set points_balance = points_balance + v_points
    where id = v_uid
    returning points_balance into v_balance;

  insert into public.point_ledger (user_id, amount, balance_after, reason, ref_quiz_attempt_id)
  values (v_uid, v_points, v_balance, 'quiz_reward', v_attempt.id);

  return v_attempt;
end;
$$;

revoke all on function public.submit_quiz(date, jsonb) from public;
grant execute on function public.submit_quiz(date, jsonb) to authenticated;

-- ---------- join_group : adhésion via code d'invitation ----------
create or replace function public.join_group(p_invite_code text)
returns public.group_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_group public.groups;
  v_member public.group_members;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select * into v_group from public.groups where invite_code = p_invite_code;
  if not found then
    raise exception 'invalid invite code';
  end if;

  insert into public.group_members (group_id, user_id)
  values (v_group.id, v_uid)
  on conflict (group_id, user_id) do nothing;

  select * into v_member from public.group_members where group_id = v_group.id and user_id = v_uid;
  return v_member;
end;
$$;

revoke all on function public.join_group(text) from public;
grant execute on function public.join_group(text) to authenticated;

-- ---------- claim_login_bonus : bonus quotidien anti double-réclamation ----------
create or replace function public.claim_login_bonus()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_already boolean;
  v_bonus bigint := 50;
  v_balance bigint;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select exists(
    select 1 from public.point_ledger
    where user_id = v_uid and reason = 'login_bonus' and created_at >= date_trunc('day', now())
  ) into v_already;

  if v_already then
    raise exception 'bonus already claimed today';
  end if;

  update public.profiles set points_balance = points_balance + v_bonus
    where id = v_uid
    returning points_balance into v_balance;

  insert into public.point_ledger (user_id, amount, balance_after, reason)
  values (v_uid, v_bonus, v_balance, 'login_bonus');

  return v_balance;
end;
$$;

revoke all on function public.claim_login_bonus() from public;
grant execute on function public.claim_login_bonus() to authenticated;

-- ---------- classement global (vue agrégée) ----------
create view public.leaderboard as
select
  p.id as user_id,
  p.username,
  p.avatar_url,
  p.points_balance,
  count(b.id) filter (where b.outcome in ('won', 'lost')) as bets_settled,
  count(b.id) filter (where b.outcome = 'won') as bets_won,
  case when count(b.id) filter (where b.outcome in ('won', 'lost')) > 0
    then round(100.0 * count(b.id) filter (where b.outcome = 'won') / count(b.id) filter (where b.outcome in ('won', 'lost')), 1)
    else 0
  end as win_rate_pct,
  coalesce(sum(b.payout) filter (where b.outcome = 'won'), 0) as total_points_won
from public.profiles p
left join public.bets b on b.user_id = p.id
group by p.id, p.username, p.avatar_url, p.points_balance;

grant select on public.leaderboard to authenticated;

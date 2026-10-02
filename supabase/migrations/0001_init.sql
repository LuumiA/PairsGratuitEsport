-- PairsGratuitEsport — schema initial
-- A coller dans Supabase Dashboard > SQL Editor > New query > Run

create type match_status as enum ('upcoming', 'running', 'finished', 'canceled');
create type bet_outcome as enum ('pending', 'won', 'lost', 'void');
create type ledger_reason as enum ('quiz_reward', 'login_bonus', 'bet_stake', 'bet_payout', 'bet_refund', 'admin_adjustment');

create table public.games (
  id smallint primary key,
  slug text unique not null,          -- slug pandascore ('valorant', 'csgo' pour CS2, 'lol')
  name text not null
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  bio text,
  avatar_url text,
  points_balance bigint not null default 1000 check (points_balance >= 0),
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.teams (
  id bigint primary key,               -- id pandascore
  game_id smallint references public.games (id),
  name text not null,
  logo_url text,
  rating numeric not null default 1500,
  rating_updated_at timestamptz default now()
);

create table public.matches (
  id bigint primary key,               -- id pandascore
  game_id smallint references public.games (id),
  team_a_id bigint references public.teams (id),
  team_b_id bigint references public.teams (id),
  status match_status not null default 'upcoming',
  scheduled_at timestamptz,
  winner_team_id bigint references public.teams (id),
  odds_a numeric,
  odds_b numeric,
  betting_locked_at timestamptz,
  settled_at timestamptz,
  raw jsonb,
  updated_at timestamptz default now()
);

create table public.team_rating_history (
  id bigint generated always as identity primary key,
  team_id bigint references public.teams (id),
  match_id bigint references public.matches (id),
  rating_before numeric,
  rating_after numeric,
  created_at timestamptz default now()
);

create table public.bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id),
  match_id bigint references public.matches (id),
  chosen_team_id bigint references public.teams (id),
  stake bigint not null check (stake > 0),
  odds numeric not null,
  outcome bet_outcome not null default 'pending',
  payout bigint,
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create table public.point_ledger (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id),
  amount bigint not null,
  balance_after bigint not null,
  reason ledger_reason not null,
  ref_bet_id uuid references public.bets (id),
  ref_quiz_attempt_id bigint,
  created_at timestamptz not null default now()
);

create table public.quiz_questions (
  id bigint generated always as identity primary key,
  game_id smallint references public.games (id),
  question text not null,
  choices jsonb not null,
  correct_index smallint not null,
  difficulty smallint not null default 1,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz default now()
);

create table public.daily_quiz (
  quiz_date date primary key,
  question_ids bigint[] not null
);

create table public.quiz_attempts (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id),
  quiz_date date references public.daily_quiz (quiz_date),
  answers jsonb not null,
  score smallint not null,
  points_awarded bigint not null,
  created_at timestamptz default now(),
  unique (user_id, quiz_date)
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references public.profiles (id),
  invite_code text unique not null default encode(gen_random_bytes(6), 'base64'),
  tournament_start timestamptz,
  tournament_end timestamptz,
  created_at timestamptz default now()
);

create table public.group_members (
  group_id uuid references public.groups (id) on delete cascade,
  user_id uuid references public.profiles (id),
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);

create table public.group_tournament_snapshot (
  group_id uuid references public.groups (id),
  user_id uuid references public.profiles (id),
  points_delta bigint not null,
  computed_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

insert into public.games (id, slug, name) values
  (1, 'valorant', 'Valorant'),
  (2, 'csgo', 'CS2'),
  (3, 'lol', 'League of Legends');

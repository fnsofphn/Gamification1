create extension if not exists "pgcrypto";

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text not null,
  instructions text not null,
  duration_seconds integer not null default 180,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.game_questions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  question_order integer not null,
  question_text text not null,
  question_type text not null default 'textarea',
  options text[] null,
  correct_answer text null,
  is_required boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  unit_name text null,
  created_at timestamptz not null default now()
);

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz null,
  status text not null check (status in ('playing', 'completed', 'timeout')),
  time_limit_seconds integer not null,
  score integer null
);

create table if not exists public.game_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  question_id uuid not null references public.game_questions(id) on delete cascade,
  answer_text text not null,
  is_correct boolean null,
  created_at timestamptz not null default now()
);

create table if not exists public.game_ai_analyses (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  session_id uuid null references public.game_sessions(id) on delete cascade,
  analysis_type text not null check (analysis_type in ('submission', 'game_summary')),
  summary text not null,
  keywords text[] not null default '{}',
  recommendations text[] not null default '{}',
  raw_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_game_questions_game_id on public.game_questions(game_id, question_order);
create index if not exists idx_game_sessions_game_id on public.game_sessions(game_id, submitted_at desc);
create index if not exists idx_game_answers_session_id on public.game_answers(session_id);
create index if not exists idx_game_ai_analyses_game_id on public.game_ai_analyses(game_id, created_at desc);

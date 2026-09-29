-- DESAFIO 30 — Schema PostgreSQL (Supabase)
-- Execute no SQL Editor do Supabase. Todas as tabelas usam Row Level Security (RLS).

create extension if not exists "pgcrypto";

-- Usuários (espelha auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  photo_url text,
  created_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_url text,
  invite_code text not null unique,
  admin_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  name text not null default 'Desafio 30',
  start_date date not null,
  duration_days int not null default 30,
  status text not null default 'draft' check (status in ('draft','active','ended')),
  created_at timestamptz not null default now()
);

-- Metas e pontuação configuráveis pelo admin (uma linha por desafio)
create table public.goals (
  challenge_id uuid primary key references public.challenges(id) on delete cascade,
  workouts_per_week int not null default 4,
  workout_bonus_at int not null default 5,
  cardio_per_week int not null default 3,
  cardio_min_minutes int not null default 30,
  water_goal_ml int not null default 3000,
  pts_workout int not null default 10,
  pts_workout_bonus int not null default 5,
  pts_cardio int not null default 5,
  pts_water int not null default 5,
  pts_no_sweets int not null default 5,
  pts_no_alcohol int not null default 5
);

create table public.participants (
  challenge_id uuid references public.challenges(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  type text not null,
  minutes int,
  note text,
  created_at timestamptz not null default now()
);

create table public.cardio (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  time time not null,
  type text not null,
  minutes int not null check (minutes > 0),
  note text,
  photo_url text,
  created_at timestamptz not null default now()
);

-- Registro diário: água + zero doce + zero álcool (histórico diário)
create table public.daily_logs (
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  water_ml int not null default 0,
  no_sweets boolean,
  no_alcohol boolean,
  primary key (challenge_id, user_id, date)
);

-- Pontos por dia (calculados pelo app/trigger; base do ranking e do histórico)
create table public.points (
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  points int not null default 0,
  primary key (challenge_id, user_id, date)
);

create table public.achievements (
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  code text not null,
  unlocked_at timestamptz not null default now(),
  primary key (challenge_id, user_id, code)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create table public.reactions (
  activity_id uuid references public.activities(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  emoji text not null check (emoji in ('❤️','🔥','💪','👏')),
  primary key (activity_id, user_id, emoji)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Ranking (visão calculada)
create or replace view public.ranking as
select p.challenge_id, p.user_id, sum(p.points)::int as total_points
from public.points p
group by p.challenge_id, p.user_id;

-- ===== RLS =====
alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.challenges enable row level security;
alter table public.goals enable row level security;
alter table public.participants enable row level security;
alter table public.workouts enable row level security;
alter table public.cardio enable row level security;
alter table public.daily_logs enable row level security;
alter table public.points enable row level security;
alter table public.achievements enable row level security;
alter table public.activities enable row level security;
alter table public.reactions enable row level security;
alter table public.comments enable row level security;
alter table public.notifications enable row level security;

create or replace function public.is_member(cid uuid) returns boolean
language sql stable security definer as $$
  select exists (select 1 from public.participants where challenge_id = cid and user_id = auth.uid());
$$;

create policy "perfil: ler autenticados" on public.profiles for select using (auth.role() = 'authenticated');
create policy "perfil: editar o próprio" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());

create policy "desafio: membros leem" on public.challenges for select using (public.is_member(id));
create policy "goals: membros leem" on public.goals for select using (public.is_member(challenge_id));
create policy "participantes: membros leem" on public.participants for select using (public.is_member(challenge_id));

-- Registros: membros leem; cada um escreve só os próprios
do $$
declare t text;
begin
  foreach t in array array['workouts','cardio','daily_logs','points','achievements','activities'] loop
    execute format('create policy "%1$s: membros leem" on public.%1$s for select using (public.is_member(challenge_id))', t);
    execute format('create policy "%1$s: escreve o próprio" on public.%1$s for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;

create policy "reactions: ler" on public.reactions for select using (auth.role() = 'authenticated');
create policy "reactions: própria" on public.reactions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "comments: ler" on public.comments for select using (auth.role() = 'authenticated');
create policy "comments: própria" on public.comments for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notificações: próprias" on public.notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- TODO admin: políticas para o admin do grupo editar goals/challenges/participants
-- (ex.: using (exists (select 1 from groups g join challenges c on c.group_id = g.id where c.id = challenge_id and g.admin_id = auth.uid()))).
-- TODO entrada por código: criar RPC security definer `join_group(code text)` que insere em participants.

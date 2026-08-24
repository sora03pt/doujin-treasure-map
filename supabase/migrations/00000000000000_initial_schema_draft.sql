-- Draft schema for Phase 1. Review against the active Supabase project before applying.

create type circle_priority as enum ('must_go', 'want_to_go', 'if_time');
create type visit_status as enum ('not_visited', 'purchased', 'sold_out', 'skipped');

create table events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  event_date date not null,
  venue text,
  memo text,
  planned_budget integer check (planned_budget is null or planned_budget >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table circles (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  space_number text not null,
  x_url text,
  web_url text,
  memo text,
  priority circle_priority not null default 'want_to_go',
  assignee text,
  visit_status visit_status not null default 'not_visited',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint circles_user_event_unique unique (user_id, event_id, space_number, name)
);

create table items (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  price integer not null default 0 check (price >= 0),
  quantity integer not null default 1 check (quantity > 0),
  memo text,
  purchased boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_user_date_idx on events (user_id, event_date desc);
create index circles_event_priority_idx on circles (event_id, priority, visit_status);
create index circles_event_space_idx on circles (event_id, space_number);
create index circles_user_assignee_idx on circles (user_id, assignee) where assignee is not null;
create index items_circle_idx on items (circle_id);
create index items_user_purchased_idx on items (user_id, purchased);

alter table events enable row level security;
alter table circles enable row level security;
alter table items enable row level security;

create policy "events are owned by the current user"
  on events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "circles are owned by the current user"
  on circles for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from events
      where events.id = circles.event_id
        and events.user_id = auth.uid()
    )
  );

create policy "items are owned by the current user"
  on items for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from circles
      where circles.id = items.circle_id
        and circles.user_id = auth.uid()
    )
  );

-- Initial schema for a new Supabase project.
-- Phase 1 keeps the MVP schema intentionally small: auth.users, events,
-- circles, and items. Budget, map assets, sharing, and profiles are later
-- phase concerns.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  event_date date not null,
  venue text,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_name_not_blank check (length(btrim(name)) > 0)
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
  priority text not null default 'want',
  assignee text,
  visit_status text not null default 'unvisited',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint circles_name_not_blank check (length(btrim(name)) > 0),
  constraint circles_space_number_not_blank check (
    length(btrim(space_number)) > 0
  ),
  constraint circles_priority_check check (
    priority in ('must', 'want', 'if_time')
  ),
  constraint circles_visit_status_check check (
    visit_status in ('unvisited', 'purchased', 'sold_out', 'skipped')
  )
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
  updated_at timestamptz not null default now(),
  constraint items_name_not_blank check (length(btrim(name)) > 0)
);

create trigger set_events_updated_at
  before update on events
  for each row
  execute function public.set_updated_at();

create trigger set_circles_updated_at
  before update on circles
  for each row
  execute function public.set_updated_at();

create trigger set_items_updated_at
  before update on items
  for each row
  execute function public.set_updated_at();

create index events_user_date_idx on events (user_id, event_date desc);
create index events_user_idx on events (user_id);
create index circles_user_idx on circles (user_id);
create index circles_event_idx on circles (event_id);
create index circles_event_priority_idx on circles (event_id, priority, visit_status);
create index circles_event_space_idx on circles (event_id, space_number);
create index circles_user_assignee_idx on circles (user_id, assignee) where assignee is not null;
create index items_circle_idx on items (circle_id);
create index items_user_idx on items (user_id);
create index items_user_purchased_idx on items (user_id, purchased);

alter table events enable row level security;
alter table circles enable row level security;
alter table items enable row level security;

create policy "events_select_own"
  on events for select
  using (auth.uid() = user_id)
;

create policy "events_insert_own"
  on events for insert
  with check (auth.uid() = user_id);

create policy "events_update_own"
  on events for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "events_delete_own"
  on events for delete
  using (auth.uid() = user_id);

create policy "circles_select_own_parent"
  on circles for select
  using (
    auth.uid() = user_id
    and exists (
      select 1 from events
      where events.id = circles.event_id
        and events.user_id = auth.uid()
    )
  );

create policy "circles_insert_own_parent"
  on circles for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from events
      where events.id = circles.event_id
        and events.user_id = auth.uid()
    )
  );

create policy "circles_update_own_parent"
  on circles for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from events
      where events.id = circles.event_id
        and events.user_id = auth.uid()
    )
  );

create policy "circles_delete_own_parent"
  on circles for delete
  using (
    auth.uid() = user_id
    and exists (
      select 1 from events
      where events.id = circles.event_id
        and events.user_id = auth.uid()
    )
  );

create policy "items_select_own_parent"
  on items for select
  using (
    auth.uid() = user_id
    and exists (
      select 1 from circles
      where circles.id = items.circle_id
        and circles.user_id = auth.uid()
    )
  );

create policy "items_insert_own_parent"
  on items for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from circles
      where circles.id = items.circle_id
        and circles.user_id = auth.uid()
    )
  );

create policy "items_update_own_parent"
  on items for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from circles
      where circles.id = items.circle_id
        and circles.user_id = auth.uid()
    )
  );

create policy "items_delete_own_parent"
  on items for delete
  using (
    auth.uid() = user_id
    and exists (
      select 1 from circles
      where circles.id = items.circle_id
        and circles.user_id = auth.uid()
    )
  );

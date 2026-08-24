# Database Design

The first Supabase schema should model ownership explicitly and rely on RLS for tenant isolation.

## Entities

### users

Use `auth.users`. Do not create a duplicate user table unless profile fields become necessary.

### events

Owned by one user.

- `id uuid primary key`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `name text not null`
- `event_date date not null`
- `venue text`
- `memo text`
- `planned_budget integer`
- timestamps

### circles

Owned by one user and belongs to one event.

- `id uuid primary key`
- `event_id uuid not null references events(id) on delete cascade`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `name text not null`
- `space_number text not null`
- `x_url text`
- `web_url text`
- `memo text`
- `priority circle_priority not null`
- `assignee text`
- `visit_status visit_status not null`
- timestamps

### items

Owned by one user and belongs to one circle.

- `id uuid primary key`
- `circle_id uuid not null references circles(id) on delete cascade`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `name text not null`
- `price integer not null default 0`
- `quantity integer not null default 1`
- `memo text`
- `purchased boolean not null default false`
- timestamps

## Enum Strategy

PostgreSQL enums are acceptable for stable values:

- `circle_priority`: `must_go`, `want_to_go`, `if_time`
- `visit_status`: `not_visited`, `purchased`, `sold_out`, `skipped`

If product copy changes, keep DB enum keys stable and translate at the UI boundary.

## Indexes

- `events (user_id, event_date desc)`
- `circles (event_id, priority, visit_status)`
- `circles (event_id, space_number)`
- `circles (user_id, assignee)` where assignee is not null
- `items (circle_id)`
- `items (user_id, purchased)`

## Future Tables

Add these only when their feature phase starts:

- `map_assets`: user-uploaded map images/PDF references
- `map_pins`: normalized pin coordinates linked to circles
- `circle_assets`: oshinagaki or reference images
- `shared_event_members`: friend sharing and assignment
- `plans` or billing tables: only after monetization is designed

# Database Design

The first Supabase schema should model ownership explicitly and rely on RLS for tenant isolation. Phase 1 keeps the schema small and does not add tables or columns only for later phases.

## Entities

### users

Use `auth.users`. Do not create a duplicate user table unless profile fields become necessary.

### profiles

Do not add this table in the MVP. Add it later only when display names, avatars, sharing, or user preferences require profile data.

### events

Owned by one user.

- `id uuid primary key`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `name text not null`
- `event_date date not null`
- `venue text`
- `memo text`
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
- `priority text not null`
- `assignee text`
- `visit_status text not null`
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

## Value Constraint Strategy

Use `text + check constraint` for MVP values:

- `priority`: `must`, `want`, `if_time`
- `visit_status`: `unvisited`, `purchased`, `sold_out`, `skipped`

This keeps the initial schema easy to evolve while still rejecting invalid states. UI labels can change independently from stored values.

## Indexes

- `events (user_id, event_date desc)`
- `events (user_id)`
- `circles (user_id)`
- `circles (event_id)`
- `circles (event_id, priority, visit_status)`
- `circles (event_id, space_number)`
- `circles (user_id, assignee)` where assignee is not null
- `items (circle_id)`
- `items (user_id)`
- `items (user_id, purchased)`

## Deferred Columns

`planned_budget` is deferred until Phase 5 Budget. The first budget UI can be added with a focused migration when the budget workflow starts.

## Future Tables

Add these only when their feature phase starts:

- `map_assets`: user-uploaded map images/PDF references
- `map_pins`: normalized pin coordinates linked to circles
- `circle_assets`: oshinagaki or reference images
- `shared_event_members`: friend sharing and assignment
- `plans` or billing tables: only after monetization is designed

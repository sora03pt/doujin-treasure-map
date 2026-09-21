alter table public.events
  add column halls text[] not null default '{}'::text[];

alter table public.circles
  add column hall text;

comment on column public.events.halls is
  'Venue-defined halls used by this event, stored in canonical venue order.';

comment on column public.circles.hall is
  'Optional hall selected from the parent event halls.';

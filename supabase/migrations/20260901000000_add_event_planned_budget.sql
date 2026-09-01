-- Phase 5 adds an optional event-level budget in whole Japanese yen.

alter table public.events
  add column planned_budget integer;

alter table public.events
  add constraint events_planned_budget_non_negative check (
    planned_budget is null or planned_budget >= 0
  );

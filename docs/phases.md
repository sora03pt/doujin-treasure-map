# Phase Plan

## Phase 1: Initial Setup / DB / Auth

- Create Supabase project
- Add environment variables
- Add Supabase browser/server clients
- Apply reviewed initial schema and RLS
- Implement login/logout/session guard

## Phase 2: Event CRUD

- Event list
- Event create/edit/delete
- Event ownership tests or verification

## Phase 3: Circle / Item CRUD

- Circle add/edit/delete
- Item add/edit/delete
- Circle detail with wanted items

## Phase 4: Event-Day UI / Filter / Priority / Visit Status

- Event detail as primary screen
- Must-go, not-visited, purchased, assignee, space search filters
- Fast status update controls
- Mobile-first interaction polish

## Phase 5: Budget

- Planned budget input
- Purchased amount calculation
- Remaining budget display
- Budget warning states

## Phase 6: Testing / Accessibility / CI

- Unit tests for budget/filter logic
- Component or e2e tests for core event-day flows
- Accessibility checks
- GitHub Actions for lint/typecheck/build

## Phase 7: PWA / Offline

- PWA manifest
- Static app shell and offline fallback through Serwist
- User-scoped, read-only Event-day snapshots in IndexedDB
- Offline mutation prevention and logout cleanup
- Offline mutation queues remain out of scope

## Phase 8: Map UI

- User-owned map upload
- Map asset table/storage policy
- Pin placement
- Optional route display

## Phase 9: Monetization / Sharing / OCR

- Free/Paid plan enforcement
- Shared event members and permissions
- CSV/PDF export
- AI OCR for user-provided images

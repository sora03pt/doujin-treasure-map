---
name: doujin-treasure-map
description: Work on this repository's doujin event treasure-map app, preserving its architecture, Supabase RLS safety model, mobile-first UI, and prohibited external-data actions.
---

# Doujin Treasure Map

Use this skill when changing this repository.

## Product Boundary

Build a private event-day planning app for arbitrary doujin events. Do not hardcode specific event names, official services, venue maps, trademarks, or catalog providers into product logic.

Users manually register information they are allowed to use. Do not implement scraping, unofficial API access, automatic catalog imports, or official image redistribution unless the user provides a verified official API/license and explicitly asks for that feature.

## Architecture

- Keep routes in `app/`.
- Keep feature-owned types, components, queries, and actions in `features/<feature>/`.
- Keep shared primitives in `components/ui/`.
- Keep cross-feature helpers in `lib/`.
- Keep Supabase SQL and migration drafts in `supabase/`.
- Prefer small feature boundaries: events, circles, items, budget, map.

## Naming

- PostgreSQL tables and columns use snake_case.
- TypeScript types and React components use PascalCase.
- Functions, variables, and file-local constants use camelCase.
- Stable enum values are English snake_case-like keys; Japanese labels belong at the UI boundary.

## UI

- Optimize for one-handed mobile use at crowded event venues.
- Use tap targets of at least 44px for primary actions.
- Make priority and visit status scannable through both text and visual treatment.
- Keep Event Detail / Event-Day Screen central; avoid unnecessary page proliferation.

## Accessibility

- Prefer semantic HTML and native controls.
- Every input needs a visible or programmatic label.
- Preserve keyboard operation and visible focus.
- Check color contrast with WCAG 2.2 AA in mind.
- Do not rely on color alone to communicate priority, errors, or status.

## Supabase / RLS

- Every user-owned table must include `user_id uuid not null references auth.users(id)`.
- Enable RLS before exposing a table to the app.
- Base policies on `auth.uid() = user_id`.
- For child tables, verify the parent row is also owned by the current user.
- Do not expose Service Role Key to browser code.
- Storage paths for future uploads must include user-owned prefixes.

## Testing

For implementation changes, run:

```bash
npm run lint
npm run typecheck
npm run build
```

Add focused tests when touching budget calculation, filters, RLS-sensitive queries, auth guards, or event-day state changes.

## Branch / PR

- Do not commit or push to `main` directly.
- Use a `codex/` branch unless the user requests another naming scheme.
- Create PRs only when the user asks.
- Never merge without explicit user approval.

## Dependencies

Add dependencies only when they materially reduce risk or complexity. Prefer existing framework features and small local utilities. Explain why a new library is needed before adding it.

## Prohibited Actions

- No unauthorized scraping of COMIC MARKET Web Catalog, Akaboo NAVIO, COMITIA services, or other event services.
- No unofficial external data acquisition.
- No unlicensed official logos, maps, or catalog images in the repository.
- No monetization logic before its phase.
- No broad refactors unrelated to the requested phase.

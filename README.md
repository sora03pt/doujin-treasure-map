# Doujin Treasure Map

自分で作る、同人誌即売会当日のための宝の地図。

コミケ、赤ブー、COMITIAなど、任意の同人イベントで使える個人用Webアプリとして設計します。特定イベント専用にはせず、ユーザーが公式PDFや画像、Webカタログ、Xなどを自分で参照しながら、行きたいサークル・欲しい頒布物・優先度・予算・訪問状態を登録する方式を基本にします。

## Current Status

Phase 7 branch: `codex/phase-7-pwa-offline`

The MVP currently includes Auth, Event/Circle/Item CRUD, the event-day view,
budget summaries, automated quality gates, and read-only offline snapshots.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Auth
- Serwist PWA
- IndexedDB offline snapshots
- Vercel

Supabase uses cookie-based SSR helpers and the browser-safe publishable key. Do not put a Service Role Key or secret key in this repository or in browser code.

## Product Principles

- Any doujin event can be registered by the user.
- Do not hardcode specific event names into product logic.
- Do not scrape event catalog services unless an official API and permission are confirmed.
- Do not commit official event logos, trademarks, paid catalog data, or map images without rights.
- Event-day mobile operation matters more than decorative UI.
- Map pins, sharing, OCR, and monetization remain future phases.

## MVP Summary

### Event

- Event name
- Event date
- Venue
- Memo
- Planned budget

### Circle

- Circle name
- Space number
- X URL
- Web URL
- Memo
- Priority: 最優先 / 行きたい / 時間があれば
- Assignee
- Visit status: 未訪問 / 購入済み / 売り切れ / スキップ

### Item

- Item name
- Price
- Quantity
- Memo
- Purchased

### Budget

- Planned amount
- Purchased amount
- Remaining amount

### Event-Day Filters

- 最優先だけ
- 未訪問だけ
- 購入済み
- 担当者
- スペース番号

## Directory Structure

```text
app/                       Next.js App Router routes
components/ui/             Shared UI primitives
docs/                      Product, DB, RLS, screen, and phase docs
features/
  budget/                  Budget calculation and types
  circles/                 Circle domain
  events/                  Event domain
  items/                   Item domain
  map/                     Future map asset and pin domain
  offline/                 Connectivity and offline Event-day snapshots
lib/                       Cross-feature utilities
supabase/
  migrations/              Supabase schema and migrations
```

## Documentation

- [MVP specification](docs/product-spec.md)
- [Screen plan](docs/screens.md)
- [Database design](docs/database.md)
- [RLS policy](docs/rls.md)
- [Phase plan](docs/phases.md)
- [Repository decisions](docs/repository-decisions.md)

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The service worker is disabled in development so that stale caches do not
interfere with debugging. Use `npm run build` followed by `npm run start` to
verify production PWA behavior.

## Supabase Setup

Create a Supabase project, then copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Apply all migrations to the linked project:

```bash
npx supabase db push
```

In Supabase Auth, enable Email/Password sign-in. Add these local redirect URLs:

```text
http://localhost:3000/auth/confirm
http://localhost:3000/**
http://localhost:3100/auth/confirm
http://localhost:3100/**
http://127.0.0.1:3100/auth/confirm
http://127.0.0.1:3100/**
```

The origin used to open the app must be present under Authentication > URL
Configuration > Redirect URLs. Supabase falls back to the configured Site URL
when `emailRedirectTo` is not allow-listed, so add the exact hostname and port
used during development. Set Site URL to the production origin before release.
The callback accepts both PKCE `code` links and customized `token_hash` email
templates.

Validation commands:

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
```

## PWA / Offline

The production build runs Next.js and then Serwist Configurator mode to create
`public/sw.js`. The generated file is ignored by Git and rebuilt in CI and on
deployment.

The service worker precaches the public offline fallback, manifest, icons, and
build assets. Runtime caching is limited to `/_next/static/` and `/icons/`.
Navigation, RSC, API, Supabase, user images, and authentication responses use
the network and are not stored in runtime caches.

Opening an Event online saves a minimal read-only Event-day snapshot to
IndexedDB. Snapshots contain Event/Circle/Item display data and calculated
budget/progress summaries, but no credentials, tokens, cookies, or Supabase
responses. Storage is separated by `userId + eventId`, limited to five recent
Events per user, and expires after 30 days. Logout clears all local snapshots
before the server logout action runs. The unauthenticated login screen also
clears local snapshots before enabling authentication controls, preventing a
snapshot from carrying over after session expiry and a user switch. Offline
mutation queues and background sync are intentionally not implemented; write
controls are disabled when the connectivity probe fails.

Production PWA verification uses a dedicated server and the same normal-user
Supabase credentials as the other E2E tests:

```bash
E2E_ALLOW_REMOTE_TESTS=true npm run test:e2e:pwa
```

## E2E / Accessibility

Playwright E2E must use a dedicated test Supabase project and a normal Auth
user. Never configure these values with a production project or a service role
key.

```bash
E2E_SUPABASE_URL=...
E2E_SUPABASE_PUBLISHABLE_KEY=...
E2E_USER_EMAIL=...
E2E_USER_PASSWORD=...
E2E_ALLOW_REMOTE_TESTS=true
npm run test:e2e
```

Local runs may use `TEST_USER_A_EMAIL` and `TEST_USER_A_PASSWORD` as credential
fallbacks. Test events use a unique `E2E-*` prefix and are deleted through RLS
as the same normal user after each test.

GitHub Actions requires these repository secrets:

- `E2E_SUPABASE_URL`
- `E2E_SUPABASE_PUBLISHABLE_KEY`
- `E2E_USER_EMAIL`
- `E2E_USER_PASSWORD`

The Quality Gate runs lint, typecheck, unit tests, production build, Chromium
E2E, mobile E2E, production PWA/offline E2E, and axe checks. Failed CI runs
retain reports and screenshots for seven days. CI traces are disabled because
authenticated traces can contain test credentials or session tokens; local
traces stay under ignored test output.

## Auth Check

Expected MVP auth flow:

- Unauthenticated users visiting `/` or `/events/**` are redirected to `/login`.
- `/login` supports sign up and login with email/password.
- Successful email confirmation shows `/auth/complete` before the event list.
- Logged-in users visiting `/login` are redirected to the event list.
- Event list shows an empty state when the user owns no events.

Do not expose the Service Role Key to the browser.

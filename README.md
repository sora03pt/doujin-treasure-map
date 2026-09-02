# Doujin Treasure Map

自分で作る、同人誌即売会当日のための宝の地図。

コミケ、赤ブー、COMITIAなど、任意の同人イベントで使える個人用Webアプリとして設計します。特定イベント専用にはせず、ユーザーが公式PDFや画像、Webカタログ、Xなどを自分で参照しながら、行きたいサークル・欲しい頒布物・優先度・予算・訪問状態を登録する方式を基本にします。

## Current Status

Phase 1 branch: `codex/phase-1-auth-db`

This repository currently contains the Next.js scaffold, product documentation, feature-based directory skeleton, Supabase Auth wiring, the initial database schema, and repository-specific AI development instructions.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Auth
- Vercel

Supabase uses cookie-based SSR helpers and the browser-safe publishable key. Do not put a Service Role Key or secret key in this repository or in browser code.

## Product Principles

- Any doujin event can be registered by the user.
- Do not hardcode specific event names into product logic.
- Do not scrape event catalog services unless an official API and permission are confirmed.
- Do not commit official event logos, trademarks, paid catalog data, or map images without rights.
- Event-day mobile operation matters more than decorative UI.
- Offline/PWA, map pins, sharing, OCR, and monetization are future phases, not MVP setup work.

## MVP Summary

### Event

- Event name
- Event date
- Venue
- Memo
- Planned budget is deferred to Phase 5 database work

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
lib/                       Cross-feature utilities
supabase/
  migrations/              Supabase schema and migrations
.codex/skills/             Repository-specific Codex skill
```

## Documentation

- [MVP specification](docs/product-spec.md)
- [Screen plan](docs/screens.md)
- [Database design](docs/database.md)
- [RLS policy](docs/rls.md)
- [Phase plan](docs/phases.md)
- [Repository decisions](docs/repository-decisions.md)
- [Codex skill](.codex/skills/doujin-treasure-map/SKILL.md)

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

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
```

Validation commands:

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
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

The Quality Gate runs lint, typecheck, unit tests, build, Chromium E2E, mobile
E2E, and axe checks. Failed CI runs retain reports and screenshots for seven
days. CI traces are disabled because authenticated traces can contain test
credentials or session tokens; local traces stay under ignored test output.

## Auth Check

Expected MVP auth flow:

- Unauthenticated users visiting `/` or `/events/**` are redirected to `/login`.
- `/login` supports sign up and login with email/password.
- Logged-in users visiting `/login` are redirected to the event list.
- Event list shows an empty state when the user owns no events.

Do not expose the Service Role Key to the browser.

# Doujin Treasure Map

自分で作る、同人誌即売会当日のための宝の地図。

コミケ、赤ブー、COMITIAなど、任意の同人イベントで使える個人用Webアプリとして設計します。特定イベント専用にはせず、ユーザーが公式PDFや画像、Webカタログ、Xなどを自分で参照しながら、行きたいサークル・欲しい頒布物・優先度・予算・訪問状態を登録する方式を基本にします。

## Current Status

Initial setup branch: `codex/initial-setup`

This repository currently contains the Next.js scaffold, product documentation, feature-based directory skeleton, Supabase schema draft, and repository-specific AI development instructions. The full application UI and Supabase integration will start in Phase 1.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Auth
- Vercel

Supabase client libraries are intentionally not installed yet. Add them in Phase 1 after the Supabase project and environment variables are ready.

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
lib/                       Cross-feature utilities
supabase/
  migrations/              Supabase schema drafts and migrations
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

Validation commands:

```bash
npm run lint
npm run typecheck
npm run build
```

## Supabase Setup Needed In Phase 1

Create a Supabase project manually if the CLI or account authentication is not available to Codex. Then provide or configure:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Supabase Auth settings
- Redirect URL for local development
- Reviewed database migration from `supabase/migrations/00000000000000_initial_schema_draft.sql`

Do not expose the Service Role Key to the browser.

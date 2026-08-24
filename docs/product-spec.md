# MVP Specification

## Concept

Doujin Treasure Map is a private event-day planning app for arbitrary doujin events. The user manually registers event, circle, item, priority, budget, and visit status while referencing official maps or catalogs they are allowed to use.

The product must not depend on a specific event name, official catalog service, venue map format, trademark, or scraping flow.

## MVP Scope

### Event

- Create and manage events.
- Fields: name, event date, venue, memo, planned budget.
- The app must accept any event name supplied by the user.

### Circle

- Register target circles per event.
- Fields: circle name, space number, X URL, web URL, memo, priority, assignee, visit status.
- Priority values:
  - `must_go`: 最優先
  - `want_to_go`: 行きたい
  - `if_time`: 時間があれば
- Visit status values:
  - `not_visited`: 未訪問
  - `purchased`: 購入済み
  - `sold_out`: 売り切れ
  - `skipped`: スキップ

### Item

- Register wanted items per circle.
- Fields: item name, price, quantity, memo, purchased.

### Budget

- Event-level summary:
  - planned amount
  - purchased amount
  - remaining amount
- Purchased amount is calculated from purchased items: `price * quantity`.

### Map

- MVP does not fetch official map data, scrape catalogs, or render a complex canvas.
- Users register space numbers manually while referencing official PDFs/images outside the app or from files they are allowed to use.
- The domain model reserves future `map_assets` and `map_pins` concepts so upload, pins, drag placement, and routes can be added later.

### Filter

Minimum event-day filters:

- must-go only
- not visited only
- purchased
- assignee
- space number search

### Offline

- MVP does not implement a custom Service Worker.
- The architecture should keep event-day data local-cache friendly for future PWA/offline work.

## Explicit Non-Goals For MVP

- Payment or subscription logic
- Scraping COMIC MARKET Web Catalog, Akaboo NAVIO, COMITIA services, or any third-party event service
- Official map image redistribution
- Map pin canvas
- Route optimization
- Friend sharing
- OCR
- CSV/PDF import/export
- Event templates

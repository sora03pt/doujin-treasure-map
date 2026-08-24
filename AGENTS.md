<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Doujin Treasure Map Agent Instructions

このリポジトリは、任意の同人誌即売会で使える「自分専用の宝の地図」Webアプリです。特定イベント専用のコード、商標・ロゴ・公式配置図の無断転載、外部イベントサービスの無断スクレイピングは行わないでください。

## Architecture

- Next.js App Routerを使い、ルーティングは`app/`、機能単位の型・ロジック・UIは`features/`へ置く。
- 共通UIは`components/ui/`、横断的なユーティリティは`lib/`、Supabase SQLやmigration案は`supabase/`へ置く。
- Event、Circle、Item、Budget、Mapの境界を混ぜない。共有が必要な型は最小限にする。

## Naming

- DB table、SQL column、storage pathはsnake_case。
- TypeScriptの型、React componentはPascalCase。関数と変数はcamelCase。
- UI上のイベント例は汎用名にし、特定イベント名をコードへハードコードしない。

## UI

- スマートフォン当日利用を優先し、主要操作は44px以上のtap targetにする。
- 優先度、訪問状態、購入済み状態は色だけに依存せずテキストでも判別できるようにする。
- Event詳細/当日画面を中心に、画面数を増やしすぎない。

## Accessibility

- semantic HTML、label付きnative control、keyboard operation、focus-visibleを最初から維持する。
- WCAG 2.2 AA相当のコントラストを意識する。
- 状態変更buttonは現在状態と変更結果が分かる名前にする。

## Supabase / RLS

- User所有の全tableに`user_id uuid not null references auth.users(id)`を持たせる。
- RLSを有効化し、`auth.uid() = user_id`をselect/insert/update/deleteの基本条件にする。
- 子tableは親所有者と一致することをFKまたはpolicyで保証し、cascade deleteを設計する。
- Service Role Keyをクライアントへ出さない。

## Testing

- 変更後は最低限`npm run lint`、`npm run typecheck`、`npm run build`を実行する。
- 重要なUI状態、RLS、フィルタ、予算計算はPhaseに応じてテストを追加する。

## Branch / PR

- `main`へ直接commit/pushしない。作業ブランチは原則`codex/` prefixを使う。
- PR作成やmergeはユーザーが明示した場合のみ行う。

## Dependencies

- 新規libraryは必要性、代替案、bundle/保守コストを確認してから追加する。
- shadcn/uiやRadix系はUIの一貫性に寄与する場合だけ導入する。

## Prohibited Actions

- 無断スクレイピング、非公開API利用、規約が確認できない自動取得を実装しない。
- 公式画像、公式ロゴ、イベント固有の有料/限定データをリポジトリへ入れない。
- ユーザーの指示なしに大規模リファクタ、課金ロジック、共有機能、OCR、自動ルート最適化を実装しない。

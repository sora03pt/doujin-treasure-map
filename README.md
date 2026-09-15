# Doujin Treasure Map

自分で作る、同人誌即売会当日のための宝の地図。

コミケ、赤ブー、COMITIAなど、任意の同人イベントで使える個人用Webアプリとして設計します。特定イベント専用にはせず、ユーザーが公式PDFや画像、Webカタログ、Xなどを自分で参照しながら、行きたいサークル・欲しい頒布物・優先度・予算・訪問状態を登録する方式を基本にします。

## 現在の状況

Phase 7までのMVP機能を実装済みです。認証、Event・Circle・ItemのCRUD、イベント当日画面、予算サマリー、自動Quality Gate、読み取り専用のオフラインスナップショットに対応しています。

## 技術スタック

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Auth
- Serwist PWA
- IndexedDBによるオフラインスナップショット
- Vercel

SupabaseはCookieベースのSSRヘルパーと、ブラウザで安全に利用できるPublishable keyを使用します。Service Role KeyやSecret keyを、このリポジトリやブラウザコードへ含めないでください。

## プロダクト方針

- ユーザーが任意の同人イベントを登録できるようにする。
- 特定のイベント名をプロダクトロジックへハードコードしない。
- 公式APIと利用許可を確認できないイベントカタログサービスをスクレイピングしない。
- 公式ロゴ、商標、有料カタログデータ、権利のない地図画像をcommitしない。
- 装飾性よりもイベント当日のスマートフォン操作を優先する。
- 地図へのpin配置、共有、OCR、収益化は将来フェーズとして扱う。

## MVP概要

### イベント（Event）

- イベント名
- 開催日
- 会場
- メモ
- 予定予算

### サークル（Circle）

- サークル名
- スペース番号
- X URL
- Web URL
- メモ
- 優先度: 最優先 / 行きたい / 時間があれば
- 担当者
- 訪問状態: 未訪問 / 購入済み / 売り切れ / スキップ

### 頒布物（Item）

- 頒布物名
- 価格
- 数量
- メモ
- 購入済み状態

### 予算（Budget）

- 予定金額
- 購入済み金額
- 残り予算

### イベント当日フィルター

- 最優先だけ
- 未訪問だけ
- 購入済み
- 担当者
- スペース番号

## ディレクトリ構成

```text
app/                       Next.js App RouterのRoute
components/ui/             共通UI primitive
docs/                      プロダクト、DB、RLS、画面、Phaseの設計資料
features/
  budget/                  予算計算と型
  circles/                 Circleドメイン
  events/                  Eventドメイン
  items/                   Itemドメイン
  map/                     将来の地図画像・pinドメイン
  offline/                 接続状態とイベント当日スナップショット
lib/                       機能横断のユーティリティ
supabase/
  migrations/              Supabase schemaとmigration
```

## ドキュメント

- [MVP仕様](docs/product-spec.md)
- [画面設計](docs/screens.md)
- [データベース設計](docs/database.md)
- [RLS方針](docs/rls.md)
- [Phase計画](docs/phases.md)
- [リポジトリ設計判断](docs/repository-decisions.md)

## 開発環境

```bash
npm install
npm run dev
```

`http://localhost:3000` を開きます。

古いキャッシュがデバッグへ影響しないよう、開発環境ではService Workerを無効にしています。本番環境のPWA動作を確認する場合は、`npm run build`の後に`npm run start`を実行してください。

## Supabaseセットアップ

Supabaseプロジェクトを作成し、`.env.example`を`.env.local`へコピーして以下を設定します。

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

リンク済みプロジェクトへすべてのmigrationを適用します。

```bash
npx supabase db push
```

Supabase AuthでEmail/Password認証を有効にし、次のローカルRedirect URLを追加します。

```text
http://localhost:3000/auth/confirm
http://localhost:3000/**
http://localhost:3100/auth/confirm
http://localhost:3100/**
http://127.0.0.1:3100/auth/confirm
http://127.0.0.1:3100/**
```

アプリを開く際に使用するオリジンを、Supabase Dashboardの「Authentication > URL Configuration > Redirect URLs」へ登録する必要があります。`emailRedirectTo`が許可されていない場合、Supabaseは設定済みのSite URLへフォールバックするため、開発時に使用するホスト名とポートを正確に追加してください。リリース前にはSite URLを本番環境のオリジンへ変更します。認証コールバックは、PKCEの`code`とカスタマイズされたメールテンプレートの`token_hash`の両方に対応しています。

検証コマンド:

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
```

## PWA / オフライン

本番ビルドではNext.jsのbuild後にSerwist Configurator modeを実行し、`public/sw.js`を生成します。生成ファイルはGitの管理対象外であり、CIとデプロイ時に再生成します。

Service Workerは、公開オフラインフォールバック、manifest、icon、build assetをプリキャッシュします。ランタイムキャッシュの対象は`/_next/static/`と`/icons/`だけです。Navigation、RSC、API、Supabase、ユーザー画像、認証レスポンスはネットワークを使用し、ランタイムキャッシュへ保存しません。

オンライン中にEventを開くと、イベント当日画面に必要な最小限の読み取り専用スナップショットをIndexedDBへ保存します。スナップショットにはEvent・Circle・Itemの表示データと、計算済みの予算・進捗サマリーを含めます。資格情報、トークン、Cookie、Supabaseレスポンスは保存しません。

保存領域は`userId + eventId`で分離し、ユーザーごとに直近5Event、保存期間30日を上限とします。ログアウト時はserver logout actionの実行前にローカルスナップショットをすべて削除します。未認証のログイン画面でも、認証操作を有効にする前にローカルスナップショットを削除し、session期限切れやユーザー切り替え後のデータ持ち越しを防ぎます。

オフラインmutation queueとbackground syncは実装していません。接続確認に失敗している間は更新操作を無効にします。

本番PWA検証では専用サーバーと、他のE2Eテストと同じ通常Supabaseユーザーを使用します。

```bash
E2E_ALLOW_REMOTE_TESTS=true npm run test:e2e:pwa
```

## E2E / アクセシビリティ

Playwright E2Eでは、専用のテスト用Supabaseプロジェクトと通常Authユーザーを使用してください。本番プロジェクトやService Role Keyを設定してはいけません。

```bash
E2E_SUPABASE_URL=...
E2E_SUPABASE_PUBLISHABLE_KEY=...
E2E_USER_EMAIL=...
E2E_USER_PASSWORD=...
E2E_ALLOW_REMOTE_TESTS=true
npm run test:e2e
```

ローカル実行では、資格情報のfallbackとして`TEST_USER_A_EMAIL`と`TEST_USER_A_PASSWORD`も使用できます。テストEventには一意な`E2E-*` prefixを付け、各テスト後に同じ通常ユーザーがRLSを通して削除します。

GitHub Actionsには次のRepository secretsが必要です。

- `E2E_SUPABASE_URL`
- `E2E_SUPABASE_PUBLISHABLE_KEY`
- `E2E_USER_EMAIL`
- `E2E_USER_PASSWORD`

Quality Gateではlint、typecheck、unit test、本番ビルド、Chromium E2E、mobile E2E、本番PWA・offline E2E、axe検査を実行します。CI失敗時のレポートとscreenshotは7日間保存します。認証済みtraceにはテスト資格情報やsession tokenが含まれる可能性があるため、CIではtraceを無効にしています。ローカルのtraceはGit管理対象外のテスト出力へ保存します。

## 認証フロー

MVPの認証フローは次のとおりです。

- 未認証ユーザーが`/`または`/events/**`へアクセスすると、`/login`へredirectする。
- `/login`でメールアドレスとパスワードによる新規登録・ログインができる。
- メール確認に成功すると、Event一覧の前に`/auth/complete`を表示する。
- ログイン済みユーザーが`/login`へアクセスすると、Event一覧へredirectする。
- 所有するEventがない場合、Event一覧にEmpty Stateを表示する。

Service Role Keyをブラウザへ公開しないでください。

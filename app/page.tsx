const priorities = [
  { label: "最優先", count: 6, tone: "border-red-200 bg-red-50 text-red-800" },
  { label: "未訪問", count: 14, tone: "border-blue-200 bg-blue-50 text-blue-800" },
  { label: "購入済み", count: 5, tone: "border-emerald-200 bg-emerald-50 text-emerald-800" },
];

const routePreview = [
  { space: "A-12a", name: "サークル名", priority: "最優先" },
  { space: "B-04b", name: "サークル名", priority: "行きたい" },
  { space: "C-18a", name: "サークル名", priority: "時間があれば" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-950 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Initial MVP scaffold
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
                Doujin Treasure Map
              </h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-slate-700 dark:text-slate-300">
                自分で作る、同人誌即売会当日のための宝の地図。
              </p>
            </div>
            <span className="inline-flex min-h-12 items-center justify-center rounded-lg bg-slate-950 px-5 text-base font-semibold text-white dark:bg-white dark:text-slate-950">
              MVP設計中
            </span>
          </div>
        </header>

        <section
          aria-labelledby="event-preview"
          className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"
        >
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="event-preview" className="text-xl font-semibold">
                  当日画面の中心イメージ
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  イベント詳細に、地図参照用のスペース一覧、優先度、訪問状態、予算を集約します。
                </p>
              </div>
              <span className="rounded-md border border-slate-200 px-2.5 py-1 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200">
                Mobile first
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {priorities.map((item) => (
                <div
                  className={`rounded-lg border p-3 ${item.tone}`}
                  key={item.label}
                >
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{item.count}</p>
                </div>
              ))}
            </div>

            <ol className="mt-5 space-y-3" aria-label="巡回リストの例">
              {routePreview.map((circle) => (
                <li
                  className="flex min-h-16 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                  key={circle.space}
                >
                  <span className="w-20 shrink-0 font-mono text-base font-semibold">
                    {circle.space}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {circle.name}
                    </span>
                    <span className="block text-sm text-slate-600 dark:text-slate-300">
                      {circle.priority}
                    </span>
                  </span>
                  <button className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-semibold dark:border-slate-700">
                    状態変更
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold">初期セットアップ範囲</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
              <li>Next.js / React / TypeScript / Tailwind CSS</li>
              <li>feature-based architecture の入口</li>
              <li>Supabase / PostgreSQL / RLS の設計案</li>
              <li>MVP仕様、画面一覧、Phase計画</li>
              <li>リポジトリ専用AI開発ルール</li>
            </ul>
          </aside>
        </section>
      </section>
      </main>
  );
}

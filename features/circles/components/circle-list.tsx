import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import {
  createCircle,
  deleteCircle,
  updateCircle,
} from "@/features/circles/actions";
import {
  CircleForm,
  emptyCircleFormValues,
} from "@/features/circles/components/circle-form";
import type {
  Circle,
  CirclePriority,
  VisitStatus,
} from "@/features/circles/types";
import { ItemList } from "@/features/items/components/item-list";
import type { Item } from "@/features/items/types";

type CircleListProps = {
  eventId: string;
  circles: Circle[];
  items: Item[];
};

const priorityLabels: Record<CirclePriority, string> = {
  must: "最優先",
  want: "行きたい",
  if_time: "時間があれば",
};

const priorityClassNames: Record<CirclePriority, string> = {
  must: "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
  want: "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
  if_time: "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

const visitStatusLabels: Record<VisitStatus, string> = {
  unvisited: "未訪問",
  purchased: "購入済み",
  sold_out: "売り切れ",
  skipped: "スキップ",
};

export function CircleList({ eventId, circles, items }: CircleListProps) {
  const createCircleForEvent = createCircle.bind(null, eventId);

  return (
    <section aria-labelledby="circles-title" id="circles">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Circle
          </p>
          <h2 className="mt-1 text-2xl font-semibold" id="circles-title">
            行きたいサークル
          </h2>
        </div>
        <span className="shrink-0 text-sm text-slate-600 dark:text-slate-300">
          {circles.length}件
        </span>
      </div>

      <details className="group mt-4">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-center rounded-lg bg-slate-950 px-5 text-base font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 [&::-webkit-details-marker]:hidden">
          サークルを追加
        </summary>
        <div className="mt-4 border-l-2 border-blue-500 pl-3 sm:pl-4">
          <CircleForm
            action={createCircleForEvent}
            initialValues={emptyCircleFormValues}
            submitLabel="サークルを保存"
          />
        </div>
      </details>

      {circles.length === 0 ? (
        <div className="mt-5 border-y border-slate-200 py-8 text-center dark:border-slate-800">
          <h3 className="font-semibold">サークルはまだ登録されていません</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            公式配置図を参照しながら、行きたいサークルを登録できます。
          </p>
        </div>
      ) : (
        <ol className="mt-5 space-y-4">
          {circles.map((circle) => {
            const circleItems = items.filter(
              (item) => item.circleId === circle.id,
            );
            const updateCircleWithIds = updateCircle.bind(
              null,
              eventId,
              circle.id,
            );
            const deleteCircleWithIds = deleteCircle.bind(
              null,
              eventId,
              circle.id,
            );

            return (
              <li
                className="scroll-mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                id={`circle-${circle.id}`}
                key={circle.id}
              >
                <article>
                  <header className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                          スペース {circle.spaceNumber ?? "未設定"}
                        </p>
                        <h3 className="mt-1 break-words text-xl font-semibold">
                          {circle.name}
                        </h3>
                      </div>
                      <span className="shrink-0 text-sm font-medium text-slate-600 dark:text-slate-300">
                        頒布物 {circleItems.length}件
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`rounded-md border px-2.5 py-1 text-sm font-semibold ${priorityClassNames[circle.priority]}`}>
                        優先度: {priorityLabels[circle.priority]}
                      </span>
                      <span className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                        訪問状態: {visitStatusLabels[circle.visitStatus]}
                      </span>
                    </div>

                    {circle.assignee ? (
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                        担当者: {circle.assignee}
                      </p>
                    ) : null}
                    {circle.memo ? (
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {circle.memo}
                      </p>
                    ) : null}

                    <details className="group mt-3">
                      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 [&::-webkit-details-marker]:hidden">
                        サークル情報を編集
                      </summary>
                      <div className="mt-4 border-l-2 border-slate-300 pl-3 dark:border-slate-700">
                        <CircleForm
                          action={updateCircleWithIds}
                          initialValues={{
                            name: circle.name,
                            spaceNumber: circle.spaceNumber ?? "",
                            priority: circle.priority,
                            visitStatus: circle.visitStatus,
                            memo: circle.memo ?? "",
                            assignee: circle.assignee ?? "",
                          }}
                          submitLabel="サークルを更新"
                        />
                      </div>
                    </details>
                  </header>

                  <ItemList
                    circleId={circle.id}
                    eventId={eventId}
                    items={circleItems}
                  />

                  <footer className="flex justify-end border-t border-slate-200 px-3 py-2 dark:border-slate-800">
                    <DeleteConfirmationDialog
                      action={deleteCircleWithIds}
                      description={`「${circle.name}」と登録済みの頒布物を削除します。この操作は元に戻せません。`}
                      title="サークルを削除しますか？"
                      triggerLabel="サークルを削除"
                    />
                  </footer>
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

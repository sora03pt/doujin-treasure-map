import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { ImagePreviewDialog } from "@/components/ui/image-preview-dialog";
import {
  deleteCircleImage,
  deleteCircle,
  quickUpdateCircleVisitStatus,
  updateCircle,
  uploadCircleImage,
} from "@/features/circles/actions";
import { CircleForm } from "@/features/circles/components/circle-form";
import { QuickVisitStatus } from "@/features/circles/components/quick-visit-status";
import {
  priorityLabels,
  visitStatusLabels,
} from "@/features/circles/display";
import { summarizeCircleItems } from "@/features/circles/event-day";
import type {
  Circle,
  CirclePriority,
  VisitStatus,
} from "@/features/circles/types";
import { ItemList } from "@/features/items/components/item-list";
import type { Item } from "@/features/items/types";
import { ReferenceImageManager } from "@/features/images/components/reference-image-manager";

type EventDayCircleCardProps = {
  eventId: string;
  eventHalls: string[];
  circle: Circle;
  items: Item[];
};

const priorityClassNames: Record<CirclePriority, string> = {
  must: "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
  want: "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
  if_time:
    "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

const visitStatusClassNames: Record<VisitStatus, string> = {
  unvisited:
    "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100",
  purchased:
    "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100",
  sold_out:
    "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
  skipped:
    "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

const yenFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

export function EventDayCircleCard({
  eventId,
  eventHalls,
  circle,
  items,
}: EventDayCircleCardProps) {
  const itemSummary = summarizeCircleItems(items);
  const updateCircleWithIds = updateCircle.bind(null, eventId, circle.id);
  const quickUpdateVisitStatusWithIds = quickUpdateCircleVisitStatus.bind(
    null,
    eventId,
    circle.id,
  );
  const deleteCircleWithIds = deleteCircle.bind(null, eventId, circle.id);
  const uploadCircleImageWithIds = uploadCircleImage.bind(null, eventId, circle.id);
  const deleteCircleImageWithIds = deleteCircleImage.bind(null, eventId, circle.id);

  return (
    <li
      className="scroll-mt-4 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
      id={`circle-${circle.id}`}
    >
      <article>
        <header className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-20 shrink-0 border-r border-slate-200 pr-3 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {circle.hall ?? "未分類"} / SPACE
              </p>
              <p className="mt-1 break-words text-lg font-bold">
                {circle.spaceNumber ?? "未設定"}
              </p>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="break-words text-lg font-semibold">{circle.name}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                担当: {circle.assignee ?? "未設定"}
              </p>
            </div>
            {circle.imageUrl ? (
              <ImagePreviewDialog
                alt={`${circle.name}の参照画像`}
                src={circle.imageUrl}
                thumbnailClassName="h-16 w-16 sm:h-20 sm:w-20"
              />
            ) : null}
          </div>

          {circle.distributionPostUrl ? (
            <a
              aria-label={`${circle.name}の頒布情報をXで見る（外部サイト、新しいタブ）`}
              className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-blue-700 underline-offset-4 hover:underline dark:text-blue-300"
              href={circle.distributionPostUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Xで頒布情報を見る（外部）
            </a>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`rounded-md border px-2.5 py-1 text-sm font-semibold ${priorityClassNames[circle.priority]}`}
            >
              優先度: {priorityLabels[circle.priority]}
            </span>
            <span
              className={`rounded-md border px-2.5 py-1 text-sm font-semibold ${visitStatusClassNames[circle.visitStatus]}`}
            >
              訪問状態: {visitStatusLabels[circle.visitStatus]}
            </span>
          </div>

          <div className="mt-3 border-y border-slate-200 py-3 text-sm dark:border-slate-700">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">頒布物 {itemSummary.itemCount}件</p>
              <p className="font-semibold">
                合計 {yenFormatter.format(itemSummary.totalAmount)}
              </p>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              価格入力済み {itemSummary.pricedItemCount} / {itemSummary.itemCount}件
            </p>
            <p className="mt-2 break-words text-slate-700 dark:text-slate-200">
              {itemSummary.names.length > 0
                ? `${itemSummary.names.join(" / ")}${
                    itemSummary.remainingCount > 0
                      ? ` / ほか${itemSummary.remainingCount}件`
                      : ""
                  }`
                : "頒布物は未登録です"}
            </p>
          </div>

          <div className="mt-3">
            <QuickVisitStatus
              action={quickUpdateVisitStatusWithIds}
              circleName={circle.name}
              initialVisitStatus={circle.visitStatus}
            />
          </div>

          <details className="group mt-3">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 [&::-webkit-details-marker]:hidden">
              編集・頒布物管理
            </summary>
            <div className="mt-4 border-l-2 border-slate-300 pl-3 dark:border-slate-700">
              <section aria-labelledby={`edit-circle-${circle.id}`}>
                <h4 className="text-base font-semibold" id={`edit-circle-${circle.id}`}>
                  サークル情報
                </h4>
                <div className="mt-3">
                  <CircleForm
                    action={updateCircleWithIds}
                    availableHalls={eventHalls}
                    initialValues={{
                      name: circle.name,
                      hall: circle.hall ?? "",
                      spaceNumber: circle.spaceNumber ?? "",
                      priority: circle.priority,
                      visitStatus: circle.visitStatus,
                      memo: circle.memo ?? "",
                      assignee: circle.assignee ?? "",
                      distributionPostUrl: circle.distributionPostUrl ?? "",
                    }}
                    submitLabel="サークルを更新"
                  />
                  <ReferenceImageManager
                    alt={`${circle.name}の参照画像`}
                    deleteAction={deleteCircleImageWithIds}
                    imageUrl={circle.imageUrl}
                    uploadAction={uploadCircleImageWithIds}
                  />
                </div>
              </section>

              <ItemList circleId={circle.id} eventId={eventId} items={items} />

              <div className="mt-3 flex justify-end border-t border-slate-200 pt-2 dark:border-slate-700">
                <DeleteConfirmationDialog
                  action={deleteCircleWithIds}
                  description={`「${circle.name}」と登録済みの頒布物を削除します。この操作は元に戻せません。`}
                  title="サークルを削除しますか？"
                  triggerLabel="サークルを削除"
                />
              </div>
            </div>
          </details>
        </header>
      </article>
    </li>
  );
}

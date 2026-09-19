import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { ImagePreviewDialog } from "@/components/ui/image-preview-dialog";
import { ReferenceImageManager } from "@/features/images/components/reference-image-manager";
import {
  createItem,
  deleteItem,
  deleteItemImage,
  updateItem,
  uploadItemImage,
} from "@/features/items/actions";
import {
  emptyItemFormValues,
  ItemForm,
} from "@/features/items/components/item-form";
import type { Item } from "@/features/items/types";

type ItemListProps = {
  eventId: string;
  circleId: string;
  items: Item[];
};

const yenFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

export function ItemList({ eventId, circleId, items }: ItemListProps) {
  const createItemForCircle = createItem.bind(null, eventId, circleId);

  return (
    <section aria-labelledby={`items-${circleId}`} className="border-t border-slate-200 px-4 py-4 dark:border-slate-800 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold" id={`items-${circleId}`}>
          頒布物
        </h4>
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {items.length}件
        </span>
      </div>

      {items.length > 0 ? (
        <ul className="mt-3 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {items.map((item) => {
            const updateItemWithIds = updateItem.bind(
              null,
              eventId,
              circleId,
              item.id,
            );
            const deleteItemWithIds = deleteItem.bind(
              null,
              eventId,
              circleId,
              item.id,
            );
            const uploadItemImageWithIds = uploadItemImage.bind(
              null,
              eventId,
              circleId,
              item.id,
            );
            const deleteItemImageWithIds = deleteItemImage.bind(
              null,
              eventId,
              circleId,
              item.id,
            );

            return (
              <li className="py-3" id={`item-${item.id}`} key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words font-semibold">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {item.price === null
                        ? "価格未設定"
                        : yenFormatter.format(item.price)}
                      <span aria-hidden="true"> ・ </span>
                      数量 {item.quantity}
                    </p>
                    {item.memo ? (
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {item.memo}
                      </p>
                    ) : null}
                  </div>
                  {item.imageUrl ? (
                    <ImagePreviewDialog
                      alt={`${item.name}の参照画像`}
                      src={item.imageUrl}
                      thumbnailClassName="h-14 w-14"
                    />
                  ) : null}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1">
                  <details className="group min-w-full sm:min-w-0 sm:flex-1">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center rounded-lg px-3 text-sm font-semibold text-blue-700 underline-offset-4 hover:bg-blue-50 hover:underline dark:text-blue-300 dark:hover:bg-blue-950 [&::-webkit-details-marker]:hidden">
                      頒布物を編集
                    </summary>
                    <div className="mt-3 border-l-2 border-slate-300 pl-3 dark:border-slate-700">
                      <ItemForm
                        action={updateItemWithIds}
                        initialValues={{
                          name: item.name,
                          price: item.price === null ? "" : String(item.price),
                          quantity: String(item.quantity),
                          memo: item.memo ?? "",
                        }}
                        submitLabel="頒布物を更新"
                      />
                      <ReferenceImageManager
                        alt={`${item.name}の参照画像`}
                        deleteAction={deleteItemImageWithIds}
                        imageUrl={item.imageUrl}
                        uploadAction={uploadItemImageWithIds}
                      />
                    </div>
                  </details>
                  <DeleteConfirmationDialog
                    action={deleteItemWithIds}
                    description={`「${item.name}」を削除します。この操作は元に戻せません。`}
                    title="頒布物を削除しますか？"
                    triggerLabel="頒布物を削除"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          欲しい頒布物はまだ登録されていません。
        </p>
      )}

      <details className="group mt-3">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-800 [&::-webkit-details-marker]:hidden">
          頒布物を追加
        </summary>
        <div className="mt-4 border-l-2 border-blue-500 pl-3">
          <ItemForm
            action={createItemForCircle}
            initialValues={emptyItemFormValues}
            submitLabel="頒布物を保存"
          />
        </div>
      </details>
    </section>
  );
}

"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ImagePreviewDialog } from "@/components/ui/image-preview-dialog";
import { processReferenceImage } from "@/features/images/client-processing";
import { REFERENCE_IMAGE_MAX_BYTES } from "@/features/images/constants";
import { useConnectivity } from "@/features/offline/components/connectivity-provider";

type ImageActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

type ReferenceImageManagerProps = {
  alt: string;
  deleteAction: (state: ImageActionState) => Promise<ImageActionState>;
  imageUrl: string | null;
  uploadAction: (
    state: ImageActionState,
    formData: FormData,
  ) => Promise<ImageActionState>;
};

const initialState: ImageActionState = { status: "idle", message: "" };

export function ReferenceImageManager({
  alt,
  deleteAction,
  imageUrl,
  uploadAction,
}: ReferenceImageManagerProps) {
  const id = useId();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const [processing, setProcessing] = useState(false);
  const [clientError, setClientError] = useState("");
  const [uploadState, uploadFormAction, uploadPending] = useActionState(
    uploadAction,
    initialState,
  );
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteAction,
    initialState,
  );
  const { isOnline } = useConnectivity();

  useEffect(() => {
    if (uploadState.status === "success" || deleteState.status === "success") {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      router.refresh();
    }
  }, [deleteState, router, uploadState]);

  useEffect(() => {
    if (
      clientError ||
      uploadState.status === "error" ||
      deleteState.status === "error"
    ) {
      messageRef.current?.focus();
    }
  }, [clientError, deleteState.status, uploadState.status]);

  async function processFile(file: File | undefined) {
    setClientError("");

    if (!file || !inputRef.current) {
      return;
    }

    setProcessing(true);

    try {
      const processed = await processReferenceImage(file);

      if (processed.size > REFERENCE_IMAGE_MAX_BYTES) {
        throw new Error("圧縮後の画像が5MBを超えています。別の画像を選択してください。");
      }

      const transfer = new DataTransfer();
      transfer.items.add(processed);
      inputRef.current.files = transfer.files;
    } catch (error) {
      inputRef.current.value = "";
      setClientError(
        error instanceof Error ? error.message : "画像を処理できませんでした。",
      );
    } finally {
      setProcessing(false);
    }
  }

  const uploadError = Boolean(clientError) || uploadState.status === "error";
  const isError = uploadError || deleteState.status === "error";
  const message =
    clientError ||
    (uploadState.status === "error" ? uploadState.message : "") ||
    (deleteState.status === "error" ? deleteState.message : "") ||
    (deleteState.status === "success" ? deleteState.message : "") ||
    uploadState.message;
  const disabled = !isOnline || processing || uploadPending || deletePending;

  return (
    <section aria-labelledby={`${id}-title`} className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
      <h5 className="text-sm font-semibold" id={`${id}-title`}>
        参照画像
      </h5>
      {imageUrl ? (
        <div className="mt-3 flex items-center gap-3">
          <ImagePreviewDialog alt={alt} src={imageUrl} />
          <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
            画像を押すと全体を確認できます。
          </p>
        </div>
      ) : null}

      {message ? (
        <p
          className={`mt-3 text-sm ${isError ? "text-red-700 dark:text-red-300" : "text-emerald-800 dark:text-emerald-200"}`}
          id={`${id}-message`}
          ref={messageRef}
          role={isError ? "alert" : "status"}
          tabIndex={isError ? -1 : undefined}
        >
          {message}
        </p>
      ) : null}

      <form action={uploadFormAction} className="mt-3 space-y-3">
        <div className="space-y-2">
          <label className="block text-sm font-semibold" htmlFor={`${id}-file`}>
            {imageUrl ? "画像を差し替える" : "画像を登録する"}
          </label>
          <input
            accept="image/jpeg,image/png,image/webp"
            aria-describedby={`${id}-help${uploadError ? ` ${id}-message` : ""}`}
            aria-invalid={uploadError}
            className="block min-h-11 w-full text-sm file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:font-semibold hover:file:bg-slate-200 dark:file:bg-slate-800 dark:hover:file:bg-slate-700"
            disabled={disabled}
            id={`${id}-file`}
            name="image"
            onChange={(event) => void processFile(event.currentTarget.files?.[0])}
            ref={inputRef}
            required
            type="file"
          />
          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400" id={`${id}-help`}>
            JPEG・PNG・WebP。選択後に最大1600pxのWebPへ圧縮します。
          </p>
        </div>
        <button
          className="min-h-11 w-full rounded-lg border border-slate-400 px-4 text-sm font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:hover:bg-slate-800"
          disabled={disabled}
          type="submit"
        >
          {processing ? "画像を処理中..." : uploadPending ? "保存中..." : imageUrl ? "画像を差し替える" : "画像を保存"}
        </button>
      </form>

      {imageUrl ? (
        <form action={deleteFormAction} className="mt-2">
          <button
            className="min-h-11 w-full rounded-lg px-4 text-sm font-semibold text-red-800 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-300 dark:hover:bg-red-950"
            disabled={disabled}
            type="submit"
          >
            {deletePending ? "削除中..." : "登録画像を削除"}
          </button>
        </form>
      ) : null}
    </section>
  );
}

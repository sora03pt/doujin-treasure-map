"use client";

import { useEffect, useId, useRef } from "react";

type ImagePreviewDialogProps = {
  alt: string;
  src: string;
  thumbnailClassName?: string;
};

export function ImagePreviewDialog({
  alt,
  src,
  thumbnailClassName = "h-16 w-16",
}: ImagePreviewDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const observer = new MutationObserver(() => {
      document.body.style.overflow = dialog.open ? "hidden" : "";
    });
    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });

    return () => {
      observer.disconnect();
      document.body.style.overflow = "";
    };
  }, []);

  function openDialog() {
    dialogRef.current?.showModal();
    closeRef.current?.focus();
  }

  return (
    <>
      <button
        aria-haspopup="dialog"
        aria-label={`${alt}を拡大表示`}
        className={`shrink-0 overflow-hidden rounded-md border border-slate-300 bg-white p-1 transition hover:border-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:bg-slate-950 ${thumbnailClassName}`}
        onClick={openDialog}
        ref={triggerRef}
        type="button"
      >
        {/* Private signed URLs are intentionally rendered without image optimization. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={alt} className="h-full w-full object-contain" src={src} />
      </button>

      <dialog
        aria-labelledby={titleId}
        className="m-auto h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-4xl rounded-lg border border-slate-300 bg-white p-0 text-slate-950 shadow-xl backdrop:bg-slate-950/70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
        onClose={() => triggerRef.current?.focus()}
        ref={dialogRef}
      >
        <div className="flex h-full min-h-0 flex-col p-3 sm:p-4">
          <div className="flex min-h-11 items-center justify-between gap-3">
            <h2 className="truncate text-base font-semibold" id={titleId}>
              {alt}
            </h2>
            <button
              className="min-h-11 shrink-0 rounded-lg px-4 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:hover:bg-slate-800"
              onClick={() => dialogRef.current?.close()}
              ref={closeRef}
              type="button"
            >
              閉じる
            </button>
          </div>
          <div className="mt-2 min-h-0 flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={alt} className="h-full w-full object-contain" src={src} />
          </div>
        </div>
      </dialog>
    </>
  );
}

import {
  getRecordsToDelete,
  getSnapshotKey,
  restoreSnapshot,
  serializeSnapshot,
} from "./snapshot.ts";
import type {
  EventDaySnapshot,
  StoredSnapshotRecord,
} from "./types.ts";

const DATABASE_NAME = "doujin-treasure-map-offline";
const DATABASE_VERSION = 1;
const SNAPSHOT_STORE = "event_snapshots";
const ACTIVE_USER_KEY = "doujin-treasure-map:offline-user";

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.addEventListener("complete", () => resolve());
    transaction.addEventListener("abort", () => reject(transaction.error));
    transaction.addEventListener("error", () => reject(transaction.error));
  });
}

async function openDatabase(): Promise<IDBDatabase> {
  const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

  request.addEventListener("upgradeneeded", () => {
    if (!request.result.objectStoreNames.contains(SNAPSHOT_STORE)) {
      request.result.createObjectStore(SNAPSHOT_STORE, { keyPath: "key" });
    }
  });

  return requestToPromise(request);
}

export function setActiveOfflineUser(userId: string) {
  localStorage.setItem(ACTIVE_USER_KEY, userId);
}

export function getActiveOfflineUser() {
  return localStorage.getItem(ACTIVE_USER_KEY);
}

export async function saveEventDaySnapshot(snapshot: EventDaySnapshot) {
  if (!("indexedDB" in globalThis)) {
    return;
  }

  setActiveOfflineUser(snapshot.userId);
  const database = await openDatabase();

  try {
    const readTransaction = database.transaction(SNAPSHOT_STORE, "readonly");
    const readComplete = transactionToPromise(readTransaction);
    const records = await requestToPromise(
      readTransaction.objectStore(SNAPSHOT_STORE).getAll(),
    );
    await readComplete;

    const record: StoredSnapshotRecord = {
      key: getSnapshotKey(snapshot.userId, snapshot.event.id),
      userId: snapshot.userId,
      eventId: snapshot.event.id,
      savedAt: snapshot.savedAt,
      serialized: serializeSnapshot(snapshot),
    };
    const recordsAfterSave = [
      ...records.filter((existing) => existing.key !== record.key),
      record,
    ] as StoredSnapshotRecord[];
    const keysToDelete = getRecordsToDelete(
      recordsAfterSave,
      snapshot.userId,
    );
    const writeTransaction = database.transaction(
      SNAPSHOT_STORE,
      "readwrite",
    );
    const writeComplete = transactionToPromise(writeTransaction);
    const store = writeTransaction.objectStore(SNAPSHOT_STORE);
    store.put(record);
    keysToDelete.forEach((key) => store.delete(key));
    await writeComplete;
  } finally {
    database.close();
  }
}

export async function loadEventDaySnapshot(userId: string, eventId: string) {
  if (!("indexedDB" in globalThis)) {
    return null;
  }

  const database = await openDatabase();

  try {
    const transaction = database.transaction(SNAPSHOT_STORE, "readonly");
    const readComplete = transactionToPromise(transaction);
    const record = (await requestToPromise(
      transaction
        .objectStore(SNAPSHOT_STORE)
        .get(getSnapshotKey(userId, eventId)),
    )) as StoredSnapshotRecord | undefined;
    await readComplete;

    if (!record) {
      return null;
    }

    const snapshot = restoreSnapshot(record.serialized, userId, eventId);

    if (!snapshot) {
      const deleteTransaction = database.transaction(
        SNAPSHOT_STORE,
        "readwrite",
      );
      const deleteComplete = transactionToPromise(deleteTransaction);
      deleteTransaction.objectStore(SNAPSHOT_STORE).delete(record.key);
      await deleteComplete;
    }

    return snapshot;
  } finally {
    database.close();
  }
}

export async function clearOfflineData() {
  localStorage.removeItem(ACTIVE_USER_KEY);

  if (!("indexedDB" in globalThis)) {
    return;
  }

  const database = await openDatabase();

  try {
    const transaction = database.transaction(SNAPSHOT_STORE, "readwrite");
    const clearComplete = transactionToPromise(transaction);
    transaction.objectStore(SNAPSHOT_STORE).clear();
    await clearComplete;
  } finally {
    database.close();
  }
}

import type {
  CircleFieldErrors,
  CircleFormValues,
  CirclePriority,
  ValidatedCircleInput,
  VisitStatus,
} from "@/features/circles/types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PRIORITIES: CirclePriority[] = ["must", "want", "if_time"];
const VISIT_STATUSES: VisitStatus[] = [
  "unvisited",
  "purchased",
  "sold_out",
  "skipped",
];

const NAME_MAX_LENGTH = 120;
const SPACE_NUMBER_MAX_LENGTH = 50;
const ASSIGNEE_MAX_LENGTH = 100;
const MEMO_MAX_LENGTH = 2000;
const DISTRIBUTION_POST_URL_MAX_LENGTH = 500;
const X_HOSTNAMES = new Set(["x.com", "www.x.com", "twitter.com", "www.twitter.com"]);

type CircleValidationResult =
  | {
      ok: true;
      input: ValidatedCircleInput;
      values: CircleFormValues;
    }
  | {
      ok: false;
      fieldErrors: CircleFieldErrors;
      values: CircleFormValues;
    };

function readText(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function isPriority(value: string): value is CirclePriority {
  return PRIORITIES.includes(value as CirclePriority);
}

export function isVisitStatus(value: string): value is VisitStatus {
  return VISIT_STATUSES.includes(value as VisitStatus);
}

export function isCircleId(value: string) {
  return UUID_PATTERN.test(value);
}

export function normalizeDistributionPostUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return { ok: true as const, value: null };
  }

  if (trimmed.length > DISTRIBUTION_POST_URL_MAX_LENGTH) {
    return { ok: false as const };
  }

  try {
    const url = new URL(trimmed);

    if (
      !["http:", "https:"].includes(url.protocol) ||
      !X_HOSTNAMES.has(url.hostname.toLowerCase()) ||
      Boolean(url.username || url.password || url.port) ||
      !/^\/[A-Za-z0-9_]{1,15}\/status\/\d+\/?$/.test(url.pathname)
    ) {
      return { ok: false as const };
    }

    url.protocol = "https:";
    url.hash = "";
    url.search = "";

    return { ok: true as const, value: url.toString().replace(/\/$/, "") };
  } catch {
    return { ok: false as const };
  }
}

export function validateCircleForm(
  formData: FormData,
): CircleValidationResult {
  const rawPriority = readText(formData, "priority");
  const rawVisitStatus = readText(formData, "visit_status");
  const values: CircleFormValues = {
    name: readText(formData, "name"),
    spaceNumber: readText(formData, "space_number"),
    priority: isPriority(rawPriority) ? rawPriority : "want",
    visitStatus: isVisitStatus(rawVisitStatus) ? rawVisitStatus : "unvisited",
    memo: readText(formData, "memo"),
    assignee: readText(formData, "assignee"),
    distributionPostUrl: readText(formData, "distribution_post_url"),
  };
  const fieldErrors: CircleFieldErrors = {};

  if (!values.name) {
    fieldErrors.name = "サークル名を入力してください。";
  } else if (values.name.length > NAME_MAX_LENGTH) {
    fieldErrors.name = `サークル名は${NAME_MAX_LENGTH}文字以内で入力してください。`;
  }

  if (values.spaceNumber.length > SPACE_NUMBER_MAX_LENGTH) {
    fieldErrors.spaceNumber = `スペース番号は${SPACE_NUMBER_MAX_LENGTH}文字以内で入力してください。`;
  }

  if (!isPriority(rawPriority)) {
    fieldErrors.priority = "優先度を選択してください。";
  }

  if (!isVisitStatus(rawVisitStatus)) {
    fieldErrors.visitStatus = "訪問状態を選択してください。";
  }

  if (values.assignee.length > ASSIGNEE_MAX_LENGTH) {
    fieldErrors.assignee = `担当者は${ASSIGNEE_MAX_LENGTH}文字以内で入力してください。`;
  }

  if (values.memo.length > MEMO_MAX_LENGTH) {
    fieldErrors.memo = `メモは${MEMO_MAX_LENGTH}文字以内で入力してください。`;
  }

  const distributionPostUrl = normalizeDistributionPostUrl(
    values.distributionPostUrl,
  );

  if (!distributionPostUrl.ok) {
    fieldErrors.distributionPostUrl =
      "x.comまたはtwitter.comの投稿URL（/ユーザー名/status/投稿ID）を入力してください。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, values };
  }

  return {
    ok: true,
    input: {
      name: values.name,
      spaceNumber: values.spaceNumber || null,
      priority: values.priority,
      visitStatus: values.visitStatus,
      memo: values.memo || null,
      assignee: values.assignee || null,
      distributionPostUrl: distributionPostUrl.ok
        ? distributionPostUrl.value
        : null,
    },
    values,
  };
}

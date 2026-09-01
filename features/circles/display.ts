import type {
  CirclePriority,
  VisitStatus,
} from "@/features/circles/types";

export const priorityOptions: Array<{
  value: CirclePriority;
  label: string;
}> = [
  { value: "must", label: "最優先" },
  { value: "want", label: "行きたい" },
  { value: "if_time", label: "時間があれば" },
];

export const visitStatusOptions: Array<{
  value: VisitStatus;
  label: string;
}> = [
  { value: "unvisited", label: "未訪問" },
  { value: "purchased", label: "購入済み" },
  { value: "sold_out", label: "売り切れ" },
  { value: "skipped", label: "スキップ" },
];

export const priorityLabels = Object.fromEntries(
  priorityOptions.map(({ value, label }) => [value, label]),
) as Record<CirclePriority, string>;

export const visitStatusLabels = Object.fromEntries(
  visitStatusOptions.map(({ value, label }) => [value, label]),
) as Record<VisitStatus, string>;

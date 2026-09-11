const yenFormatter = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 0,
});

export function formatYen(amount: number) {
  const sign = amount < 0 ? "-" : "";
  return `${sign}¥${yenFormatter.format(Math.abs(amount))}`;
}

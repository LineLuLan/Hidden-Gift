/**
 * @file lib/utils/format.ts
 * @description Vietnamese-friendly formatters (date, currency, relative time).
 */

const VN_TIMEZONE = "Asia/Ho_Chi_Minh";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: VN_TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: VN_TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const relativeFormatter = new Intl.RelativeTimeFormat("vi-VN", { numeric: "auto" });

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return dateFormatter.format(date);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return dateTimeFormatter.format(date);
}

export function formatVND(value: number | null | undefined): string {
  if (value == null) return "";
  return currencyFormatter.format(value);
}

/** "2 giờ trước", "3 ngày nữa", etc. */
export function formatRelative(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const diffMs = date.getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60_000);

  if (Math.abs(diffMin) < 60) return relativeFormatter.format(diffMin, "minute");
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) return relativeFormatter.format(diffHour, "hour");
  const diffDay = Math.round(diffHour / 24);
  if (Math.abs(diffDay) < 30) return relativeFormatter.format(diffDay, "day");
  const diffMonth = Math.round(diffDay / 30);
  if (Math.abs(diffMonth) < 12) return relativeFormatter.format(diffMonth, "month");
  return relativeFormatter.format(Math.round(diffMonth / 12), "year");
}

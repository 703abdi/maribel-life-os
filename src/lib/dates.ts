import { BRAND } from "@/lib/brand";
export const DAY = 86_400_000;
function parts(d: Date, timezone: string = BRAND.timezone) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  });
  const p = fmt.formatToParts(d);
  const n = (t: string) => Number(p.find((x) => x.type === t)?.value);
  return {
    y: n("year"),
    m: n("month"),
    d: n("day"),
    h: n("hour"),
    min: n("minute"),
    s: n("second"),
  };
}
function offsetMin(d: Date, timezone: string = BRAND.timezone) {
  const p = parts(d, timezone);
  return Math.round(
    (Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - d.getTime()) / 60000,
  );
}
export function zoned(
  y: number,
  m: number,
  d: number,
  h = 0,
  min = 0,
  timezone: string = BRAND.timezone,
) {
  const guess = Date.UTC(y, m - 1, d, h, min);
  const first = guess - offsetMin(new Date(guess), timezone) * 60000;
  return new Date(guess - offsetMin(new Date(first), timezone) * 60000);
}
export function localParts(d: Date, timezone: string = BRAND.timezone) {
  return parts(d, timezone);
}
export function startOfDay(d = new Date(), timezone: string = BRAND.timezone) {
  const p = parts(d, timezone);
  return zoned(p.y, p.m, p.d, 0, 0, timezone);
}
export function addDays(d: Date, n: number, timezone: string = BRAND.timezone) {
  const p = parts(d, timezone);
  return zoned(p.y, p.m, p.d + n, p.h, p.min, timezone);
}
export function startOfWeek(
  d = new Date(),
  timezone: string = BRAND.timezone,
  weekStartsOn = 1,
) {
  const p = parts(d, timezone);
  const dow = new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay();
  return zoned(p.y, p.m, p.d - ((dow - weekStartsOn + 7) % 7), 0, 0, timezone);
}
export function ymd(d: Date, timezone: string = BRAND.timezone) {
  const p = parts(d, timezone);
  return `${p.y}-${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;
}
export function parseYmd(v: string, timezone: string = BRAND.timezone) {
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? zoned(+m[1], +m[2], +m[3], 0, 0, timezone) : null;
}
export const fmtDay = (d: Date) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: BRAND.timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
export const fmtTime = (d: Date) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: BRAND.timezone,
    hour: "numeric",
    minute: "2-digit",
  }).format(d);

export const str = (fd: FormData, key: string, max = 2000) =>
  String(fd.get(key) ?? "")
    .trim()
    .slice(0, max);
export const int = (fd: FormData, key: string, fallback = 0) => {
  const n = Number(str(fd, key).replace(/[$,\s]/g, ""));
  return Number.isFinite(n) && str(fd, key) ? Math.round(n) : fallback;
};
export const bool = (fd: FormData, key: string) =>
  ["on", "true", "1", "yes"].includes(str(fd, key));

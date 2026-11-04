export const PRISMA_SCHEMA = "life";
export function rawDatabaseUrl(env: NodeJS.ProcessEnv = process.env) {
  return (
    env.DATABASE_URL ||
    env.POSTGRES_PRISMA_URL ||
    env.POSTGRES_URL ||
    env.POSTGRES_URL_NON_POOLING ||
    env.DATABASE_URL_UNPOOLED ||
    undefined
  );
}
export function withPrismaParams(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("pooler.supabase.com") && u.port === "6543")
      u.searchParams.set("pgbouncer", "true");
    if (!u.searchParams.has("schema"))
      u.searchParams.set("schema", PRISMA_SCHEMA);
    return u.toString();
  } catch {
    return url;
  }
}
export function runtimeDatabaseUrl(env: NodeJS.ProcessEnv = process.env) {
  const url = rawDatabaseUrl(env);
  return url ? withPrismaParams(url) : undefined;
}

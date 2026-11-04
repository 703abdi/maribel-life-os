import { describe, expect, it } from "vitest";
import { rawDatabaseUrl, withPrismaParams } from "@/lib/database-url";
import {
  canClearSampleData,
  SAMPLE_CLEAR_CONFIRMATION,
} from "@/lib/sample-data";

describe("seed URL and clear sample guard", () => {
  it("uses the life schema with every supported runtime URL source", () => {
    expect(
      rawDatabaseUrl({
        POSTGRES_URL: "postgresql://example.test/db",
      } as unknown as NodeJS.ProcessEnv),
    ).toBe("postgresql://example.test/db");
    expect(withPrismaParams("postgresql://example.test/db")).toContain(
      "schema=life",
    );
    expect(
      withPrismaParams(
        "postgresql://user:password@x.pooler.supabase.com:6543/db",
      ),
    ).toContain("pgbouncer=true");
  });

  it("only accepts the explicit clear-sample confirmation", () => {
    expect(canClearSampleData(SAMPLE_CLEAR_CONFIRMATION)).toBe(true);
    expect(canClearSampleData("clear sample data")).toBe(false);
  });
});

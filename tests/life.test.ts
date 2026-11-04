import { describe, expect, it } from "vitest";
import { capacityLoad, todayTaskBuckets } from "@/modules/life";
import { startOfDay, ymd, zoned } from "@/lib/dates";

describe("dates and capacity", () => {
  it("counts planned work and time-blocks together", () => {
    expect(
      capacityLoad(
        [{ estimateMinutes: 90 }, { estimateMinutes: 30 }] as never,
        2,
      ),
    ).toBe(4);
  });

  it("keeps a task in only its highest-priority Today section", () => {
    const today = zoned(2026, 11, 3);
    const buckets = todayTaskBuckets(
      [
        {
          id: "overdue",
          status: "TODO",
          dueDate: zoned(2026, 11, 2),
          plannedDate: today,
        },
        { id: "due", status: "TODO", dueDate: today, plannedDate: today },
        { id: "planned", status: "TODO", dueDate: null, plannedDate: today },
      ] as never,
      today,
    );
    expect(buckets.overdue.map((task) => task.id)).toEqual(["overdue"]);
    expect(buckets.due.map((task) => task.id)).toEqual(["due"]);
    expect(buckets.planned.map((task) => task.id)).toEqual(["planned"]);
    expect(
      ymd(startOfDay(new Date("2026-11-03T03:00:00Z"), "America/New_York")),
    ).toBe("2026-11-02");
  });
});

import { describe, expect, it } from "vitest";
import { setupChecklist } from "@/lib/setup-checklist";

const settings = {
  setupAreasDone: false,
  setupClassesDone: false,
  setupJobDone: false,
  setupTimezoneDone: false,
  setupPrioritiesDone: false,
  setupRemindersDone: false,
};

describe("setupChecklist", () => {
  it("uses the same automatic completion rules for every caller", () => {
    const checklist = setupChecklist(settings, {
      areaCount: 7,
      classCount: 1,
      jobScheduleCount: 1,
    });

    expect(
      checklist.filter((item) => item.done).map((item) => item.key),
    ).toEqual(["setupAreasDone", "setupClassesDone", "setupJobDone"]);
  });

  it("keeps saved preferences complete even without auto-detected records", () => {
    const checklist = setupChecklist(
      { ...settings, setupTimezoneDone: true, setupRemindersDone: true },
      { areaCount: 0, classCount: 0, jobScheduleCount: 0 },
    );

    expect(checklist.every((item) => item.done)).toBe(false);
    expect(
      checklist.filter((item) => item.done).map((item) => item.key),
    ).toEqual(["setupTimezoneDone", "setupRemindersDone"]);
  });
});

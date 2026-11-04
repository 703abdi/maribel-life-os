export type SetupSettings = {
  setupAreasDone: boolean;
  setupClassesDone: boolean;
  setupJobDone: boolean;
  setupTimezoneDone: boolean;
  setupPrioritiesDone: boolean;
  setupRemindersDone: boolean;
};

export type SetupSignals = {
  areaCount: number;
  classCount: number;
  jobScheduleCount: number;
};

export const SETUP_CHECKLIST_ITEMS = [
  { key: "setupAreasDone", label: "Name categories / areas" },
  { key: "setupClassesDone", label: "Add classes" },
  { key: "setupJobDone", label: "Add job & schedule" },
  { key: "setupTimezoneDone", label: "Set timezone & capacity" },
  { key: "setupPrioritiesDone", label: "Choose prioritization method" },
  { key: "setupRemindersDone", label: "Set reminders" },
] as const satisfies readonly { key: keyof SetupSettings; label: string }[];

/**
 * Returns the one canonical first-run checklist state. Areas, classes, and job
 * schedules are completed automatically once the corresponding records exist;
 * the other items are explicit preferences saved in Settings.
 */
export function setupChecklist(settings: SetupSettings, signals: SetupSignals) {
  const automaticallyCompleted: Partial<Record<keyof SetupSettings, boolean>> =
    {
      setupAreasDone: signals.areaCount >= 7,
      setupClassesDone: signals.classCount > 0,
      setupJobDone: signals.jobScheduleCount > 0,
    };

  return SETUP_CHECKLIST_ITEMS.map((item) => ({
    ...item,
    done: settings[item.key] || automaticallyCompleted[item.key] === true,
  }));
}

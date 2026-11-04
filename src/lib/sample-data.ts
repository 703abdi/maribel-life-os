export const SAMPLE_CLEAR_CONFIRMATION = "CLEAR SAMPLE DATA";

export function canClearSampleData(value: string) {
  return value === SAMPLE_CLEAR_CONFIRMATION;
}

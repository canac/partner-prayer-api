/*
 * Implement selected date-fns methods, but make them operate on UTC time
 */
export function startOfMonth(dirtyDate: Date): Date {
  const date: Date = new Date(dirtyDate);
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export function endOfMonth(dirtyDate: Date): Date {
  const date: Date = startOfMonth(dirtyDate);
  date.setUTCFullYear(date.getUTCFullYear(), date.getUTCMonth() + 1, 0);
  date.setUTCHours(23, 59, 59, 999);
  return date;
}

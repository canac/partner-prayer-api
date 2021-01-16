/*
 * Implement selected date-fns methods, but make them operate on UTC time
 */

type Interval = {
  start: Date;
  end: Date;
}

export function eachDayOfInterval(interval: Interval) {
  const startDate = new Date(interval.start);
  const endDate = new Date(interval.end);
  const endTime = endDate.getTime();

  // Throw an exception if start date is after end date or if any date is `Invalid Date`
  if (!(startDate.getTime() <= endTime)) {
    throw new RangeError('Invalid interval');
  }

  const currentDate = startDate;
  currentDate.setUTCHours(0, 0, 0, 0);

  const dates = [];
  while (currentDate.getTime() <= endTime) {
    dates.push(new Date(currentDate)); // clone currentDate
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    currentDate.setUTCHours(0, 0, 0, 0)
  }

  return dates;
}

export function endOfMonth(dirtyDate: Date) {
  const date: Date = startOfMonth(dirtyDate);
  date.setUTCFullYear(date.getUTCFullYear(), date.getUTCMonth() + 1, 0);
  date.setUTCHours(23, 59, 59, 999);
  return date;
}

export function isSameDay(left: Date, right: Date) {
  return startOfDay(left).getTime() === startOfDay(right).getTime();
}

export function startOfDay(dirtyDate: Date) {
  const date: Date = new Date(dirtyDate);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export function startOfMonth(dirtyDate: Date) {
  const date: Date = startOfDay(dirtyDate);
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

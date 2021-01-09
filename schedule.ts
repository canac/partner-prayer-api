import { eachDayOfInterval, endOfMonth, isSameDay, startOfMonth } from 'https://cdn.skypack.dev/date-fns@2.16.1';

export type Schedule = {
  month: Date;
  partnersByDay: string[][];
}

// Return a boolean indicating whether the array of dates contains the specified dates
function arrayHasDate(haystack: Date[], needle: Date) {
  return haystack.some((date: Date) => isSameDay(date, needle));
}

// Calculate the prayer partner schedule for the specified date
export function generateSchedule(month: Date, skippedDays: Date[], partners: string[]): Schedule {
  const daysInMonth: Date[] = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }, {});

  // Count the number of days that are not skipped and will contain partners
  const numDays: number = daysInMonth.filter(day => !arrayHasDate(skippedDays, day)).length;

  let dayIndex: number = 0;
  const partnersByDay: string[][] = daysInMonth.map((day: Date): string[] => {
    if (arrayHasDate(skippedDays, day)) {
      // This day is skipped, so it gets no partners scheduled
      return [];
    }

    const startIndex = Math.floor(dayIndex * partners.length / numDays);
    const endIndex = Math.floor((dayIndex + 1) * partners.length / numDays);
    ++dayIndex;

    return partners.slice(startIndex, endIndex);
  });

  return { month, partnersByDay };
}

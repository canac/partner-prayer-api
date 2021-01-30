import { range } from 'lodash';
import { endOfMonth, startOfMonth } from '../date-fns-utc';
import { ScheduleModel } from '../generated/graphql';
import { getDb } from './db';

// Return an array of the day indexes in the month that are skipped
export async function getSkippedDays(dirtyMonth: Date): Promise<number[]> {
  const db = await getDb();
  const month = startOfMonth(dirtyMonth);

  // Calculate the weekends in the month
  const numDaysInMonth = endOfMonth(month).getUTCDate();
  const firstDayOfMonth = month.getUTCDay();
  const weekends = range(numDaysInMonth).filter((dayId) => [0, 6].includes((dayId + firstDayOfMonth) % 7));

  const schedule = await db.collection<ScheduleModel>('schedule').findOne({ month });
  const scheduleDays = schedule?.days ?? [];
  const skippedDays: Set<number> = new Set(weekends); // weekends are skipped by default
  scheduleDays.forEach((day, index) => {
    if (day.isSkipped) {
      skippedDays.add(index);
    } else {
      skippedDays.delete(index);
    }
  });

  return [...skippedDays];
}

// Update the skipped status of the given date
export async function setSkippedDayStatus(month: Date, dayId: number, isSkipped: boolean): Promise<void> {
  const db = await getDb();
  await db.collection<ScheduleModel>('schedule').updateOne(
    { month: startOfMonth(month) },
    { $set: { [`days.${dayId}.isSkipped`]: isSkipped } },
  );
}

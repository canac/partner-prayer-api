import { range } from 'lodash';
import { endOfMonth, startOfMonth } from '../date-fns-utc';
import { getDb } from './db';
import { SkippedDayModel } from './models';

// Return an array of the day indexes in the month that are skipped
export async function getSkippedDays(dirtyMonth: Date): Promise<number[]> {
  const db = await getDb();
  const month = startOfMonth(dirtyMonth);
  const skippedDayDocs = await db.collection<SkippedDayModel>('skippedDays').find({ month }).toArray();

  // Calculate the weekends in the month
  const numDaysInMonth = endOfMonth(month).getUTCDate();
  const firstDayOfMonth = month.getUTCDay();
  const weekends = range(numDaysInMonth).filter((dayId) => [0, 6].includes((dayId + firstDayOfMonth) % 7));

  // Weekends are skipped by default
  const skippedDays: Set<number> = new Set(weekends);
  skippedDayDocs.forEach((doc) => {
    if (doc.isSkipped) {
      skippedDays.add(doc.dayId);
    } else {
      skippedDays.delete(doc.dayId);
    }
  });

  return [...skippedDays];
}

// Update the skipped status of the given date
export async function setSkippedDayStatus(month: Date, dayId: number, isSkipped: boolean): Promise<void> {
  const db = await getDb();
  await db.collection<SkippedDayModel>('skippedDays').updateOne(
    { month: startOfMonth(month), dayId },
    { $set: { isSkipped } },
    { upsert: true },
  );
}

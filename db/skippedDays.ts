import { endOfMonth, startOfDay, startOfMonth } from 'https://cdn.skypack.dev/date-fns@2.16.1';
import { getDb } from './db.ts';
import { SkippedDay } from './types.ts';

// Return an array of the dates in the month that are skipped
export async function getMonthSkippedDays(month: Date): Promise<Date[]> {
  const db = await getDb();
  const skippedDayDocs = await db.collection<SkippedDay>('skippedDays').find({
    date: {
      $gte: startOfMonth(month),
      $lte: endOfMonth(month),
    },
    isSkipped: true,
  }).toArray();

  return skippedDayDocs.map(day => day.date);
}

// Update the skipped status of the given date
export async function setSkippedDayStatus(date: Date, isSkipped: boolean): Promise<void> {
  const db = await getDb();
  await db.collection<SkippedDay>('skippedDays').updateOne(
    { date: startOfDay(date) },
    { $set: { isSkipped } },
    { upsert: true }
  );
}

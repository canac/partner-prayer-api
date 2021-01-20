import { startOfMonth } from '../date-fns-utc';
import { getDb } from './db';
import { SkippedDayModel } from './types';

// Return an array of the day indexes in the month that are skipped
export async function getSkippedDays(month: Date): Promise<number[]> {
  const db = await getDb();
  const skippedDayDocs = await db.collection<SkippedDayModel>('skippedDays').find({
    month: startOfMonth(month),
    isSkipped: true,
  }, { projection: { dayId: 1 } }).toArray();
  return skippedDayDocs.map((day) => day.dayId);
}

// Update the skipped status of the given date
export async function setSkippedDayStatus(date: Date, isSkipped: boolean): Promise<void> {
  const db = await getDb();
  await db.collection<SkippedDayModel>('skippedDays').updateOne(
    { month: startOfMonth(date), dayId: date.getUTCDate() - 1 },
    { $set: { isSkipped } },
    { upsert: true },
  );
}

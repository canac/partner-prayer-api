import { getDb } from './db';
import { CompletedDay } from './types';

export async function getLastCompletedDay(): Promise<Date> {
  const db = await getDb();
  const completedDayDoc = await db.collection<CompletedDay>('completedDays').findOne({});
  return completedDayDoc?.lastCompletedDay || new Date(0);
}

export async function setLastCompletedDay(lastCompletedDay: Date): Promise<void> {
  const db = await getDb();
  await db.collection<CompletedDay>('completedDays').updateOne(
    {},
    { $set: { lastCompletedDay } },
    { upsert: true }
  );
}

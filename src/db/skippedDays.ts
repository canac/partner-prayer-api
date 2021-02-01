import { range } from 'lodash';
import { endOfMonth, startOfMonth } from '../date-fns-utc';
import { getDb } from './db';
import { ScheduleDayModel, ScheduleModel } from './models';

// Return an array of the day indexes in the month that are skipped
export async function getSkippedDays(dirtyMonth: Date): Promise<number[]> {
  const db = await getDb();
  const month = startOfMonth(dirtyMonth);

  // Calculate the weekends in the month
  const numDaysInMonth = endOfMonth(month).getUTCDate();
  const firstDayOfMonth = month.getUTCDay();
  const weekends = range(numDaysInMonth).filter((dayId) => [0, 6].includes((dayId + firstDayOfMonth) % 7));

  const schedule = await db.collection<ScheduleModel>('schedule').findOne({ month }, { projection: { _id: 1 } });
  const scheduleDays = await db.collection<ScheduleDayModel>('scheduleDay')
    .find({ scheduleId: schedule?._id }).toArray();
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
  const schedule = await db.collection<ScheduleModel>('schedule').findOne({ month }, { projection: { _id: 1 } });
  if (schedule) {
    await db.collection<ScheduleDayModel>('scheduleDay').updateOne(
      { scheduleId: schedule._id, dayId },
      { $set: { isSkipped } },
    );
  }
}

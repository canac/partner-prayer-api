import { getDb } from './db';
import { ScheduleDayModel, ScheduleModel } from './models';
import { updateScheduleDays } from './schedule';

// Update the skipped status of the given date
// eslint-disable-next-line import/prefer-default-export
export async function setSkippedDayStatus(month: Date, dayId: number, isSkipped: boolean): Promise<void> {
  const db = await getDb();
  const schedule = await db.collection<ScheduleModel>('schedule').findOne({ month }, { projection: { _id: 1 } });
  if (schedule) {
    await db.collection<ScheduleDayModel>('scheduleDay').updateOne(
      { scheduleId: schedule._id, dayId },
      { $set: { isSkipped } },
    );
    await updateScheduleDays(schedule);
  }
}

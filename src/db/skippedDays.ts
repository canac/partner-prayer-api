import { getDb } from './db';
import { ObjectId, ScheduleDayModel, ScheduleModel } from './models';
import { updateScheduleDays } from './schedule';

// Update the skipped status of the given date
// eslint-disable-next-line import/prefer-default-export
export async function setSkippedDayStatus(scheduleId: ObjectId, dayId: number, isSkipped: boolean):
  Promise<ScheduleModel> {
  const db = await getDb();

  // Make sure the schedule exists before doing anything
  const schedule = await db.collection<ScheduleModel>('schedule').findOne({ _id: scheduleId });
  if (!schedule) {
    throw new Error('Schedule does not exist');
  }

  // Update the schedule model
  await db.collection<ScheduleDayModel>('scheduleDay').updateOne(
    { scheduleId, dayId },
    { $set: { isSkipped } },
  );
  await updateScheduleDays(schedule);

  // Return the referenced schedule
  return schedule;
}

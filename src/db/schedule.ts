import { range } from 'lodash';
import { endOfMonth, startOfMonth } from '../date-fns-utc';
import { getDb } from './db';
import {
  ObjectId, ScheduleDayModel, ScheduleModel, WithoutId,
} from './models';
import { getPartners } from './partners';
import { getSkippedDays } from './skippedDays';

// Return the days for the specified schedule
export async function getScheduleDays(scheduleId: ObjectId): Promise<ScheduleDayModel[]> {
  const db = await getDb();
  return db.collection<ScheduleDayModel>('scheduleDay').find({ scheduleId }).toArray();
}

// Calculate the days in the prayer partner schedule for the specified month
function calculateScheduleDays(
  schedule: ScheduleModel,
  skippedDays: number[],
  partnerIds: ObjectId[],
): WithoutId<ScheduleDayModel>[] {
  const skippedDaysSet = new Set(skippedDays);

  const numDaysInMonth = endOfMonth(schedule.month).getUTCDate();
  const incompleteDays: number[] = range(schedule.completedDays, numDaysInMonth);

  // Count the number of days that are not skipped and will contain partners
  const numDays: number = incompleteDays.filter((day) => !skippedDaysSet.has(day)).length;
  const partnersPerDay: number = Math.floor(partnerIds.length / numDays);
  const remainderPartners: number = partnerIds.length % numDays;

  let numDistributedPartners = 0;
  let dayIndex = 0;
  return incompleteDays.map((day: number): WithoutId<ScheduleDayModel> => {
    const isSkipped = skippedDaysSet.has(day);
    let partners: ObjectId[] = [];
    if (!isSkipped) {
      // Assign partnersPerDay to each day and give the remaining partners to the earlier days
      const startIndex = numDistributedPartners;
      const endIndex = numDistributedPartners + partnersPerDay + (dayIndex < remainderPartners ? 1 : 0);
      numDistributedPartners = endIndex;
      dayIndex += 1;
      partners = partnerIds.slice(startIndex, endIndex);
    }

    return {
      scheduleId: schedule._id,
      dayId: day,
      partners,
      isSkipped,
    };
  });
}

// Create or update the schedule for the specified month
export async function generateSchedule(dirtyMonth: Date): Promise<ScheduleModel> {
  const month = startOfMonth(dirtyMonth);
  const db = await getDb();

  const partners = await getPartners();
  const partnerIds = partners.map(({ _id }) => _id);
  let schedule = await db.collection<ScheduleModel>('schedule').findOne({ month });
  if (!schedule) {
    // Create the schedule since it doesn't exist yet
    const newScheduleFields: WithoutId<ScheduleModel> = { month, completedDays: 0 };
    const { insertedId } = await db.collection<ScheduleModel>('schedule').insertOne(newScheduleFields);
    schedule = { _id: insertedId, ...newScheduleFields };
  }

  // Count how many partners exist in the already completed days
  const scheduleDays = await getScheduleDays(schedule._id);
  const numCompletedDays = schedule.completedDays;
  const numCompletedPartners = scheduleDays
    .slice(0, numCompletedDays)
    .reduce((total, day) => total + day.partners.length, 0);

  // Keep the completed days the same and only update the remaining days
  const skippedDays = await getSkippedDays(month);
  const days = calculateScheduleDays(schedule, skippedDays, partnerIds.slice(numCompletedPartners));

  // eslint-disable-next-line no-restricted-syntax
  for await (const day of days) {
    await db.collection<ScheduleDayModel>('scheduleDay').updateOne(
      { scheduleId: schedule._id, dayId: day.dayId },
      { $set: { partners: day.partners, isSkipped: day.isSkipped } },
      { upsert: true },
    );
  }

  return schedule;
}

// Return the schedule for the specified month
export async function getSchedule(dirtyMonth: Date): Promise<ScheduleModel> {
  const month = startOfMonth(dirtyMonth);
  const db = await getDb();
  return await db.collection<ScheduleModel>('schedule').findOne({ month }) || generateSchedule(month);
}

// Mark the specified day as completed
export async function completeDay(month: Date, completedDays: number): Promise<void> {
  const db = await getDb();
  await db.collection<ScheduleModel>('schedule').updateOne(
    { month: startOfMonth(month) },
    { $set: { completedDays } },
  );
}

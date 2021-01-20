import {
  eachDayOfInterval, endOfMonth, startOfDay, startOfMonth,
} from '../date-fns-utc';
import { getDb } from './db';
import { getPartners } from './partners';
import { getSkippedDays } from './skippedDays';
import { ObjectId, ScheduleModel } from './types';

// Calculate the prayer partner schedule for the specified date
function calculatePartnersByDay(
  month: Date,
  firstDay: number,
  skippedDays: number[],
  partnerIds: ObjectId[],
): ObjectId[][] {
  const skippedDaysSet = new Set(skippedDays);

  const daysInMonth: number[] = eachDayOfInterval({
    start: startOfDay(month),
    end: endOfMonth(month),
  }).slice(firstDay).map((day) => day.getUTCDate() - 1);

  // Count the number of days that are not skipped and will contain partners
  const numDays: number = daysInMonth.filter((day) => !skippedDaysSet.has(day)).length;

  let dayIndex = 0;
  return daysInMonth.map((day: number): ObjectId[] => {
    if (skippedDaysSet.has(day)) {
      // This day is skipped, so it gets no partners scheduled
      return [];
    }

    const startIndex = Math.floor((dayIndex * partnerIds.length) / numDays);
    const endIndex = Math.floor(((dayIndex + 1) * partnerIds.length) / numDays);
    dayIndex += 1;

    return partnerIds.slice(startIndex, endIndex);
  });
}

// Create or update the schedule for the specified month
export async function generateSchedule(dirtyMonth: Date): Promise<ScheduleModel> {
  const month = startOfMonth(dirtyMonth);
  const db = await getDb();

  const existingSchedule = await db.collection<ScheduleModel>('schedule').findOne({ month });
  const existingPartnersByDay = existingSchedule?.partnersByDay || [];
  const numCompletedDays = existingSchedule?.completedDays || 0;
  const numCompletedPartners = existingPartnersByDay
    .slice(0, numCompletedDays)
    .reduce((total, partners) => total + partners.length, 0);

  const newFields: Partial<ScheduleModel> = {};
  if (!existingSchedule) {
    newFields.completedDays = 0;
  }

  // Create the new schedule
  const skippedDays = await getSkippedDays(month);
  const partners = await getPartners();
  const partnerIds = partners.map(({ _id }) => _id);
  const partnersByDay = [
    ...existingPartnersByDay.slice(0, numCompletedDays),
    ...calculatePartnersByDay(month, numCompletedDays, skippedDays, partnerIds.slice(numCompletedPartners)),
  ];
  const { _id } = (await db.collection<ScheduleModel>('schedule').findOneAndUpdate(
    { month },
    { $set: { partnersByDay, skippedDays, ...newFields } },
    { projection: { _id: 1 }, upsert: true, returnOriginal: false },
  )).value || {};
  if (!_id) {
    throw new Error('Could not find generated schedule');
  }
  return {
    _id,
    month,
    completedDays: numCompletedDays,
    partnersByDay,
    skippedDays,
  };
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

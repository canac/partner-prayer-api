import { eachDayOfInterval, endOfMonth, isSameDay, startOfMonth } from '../date-fns-utc';
import { getDb } from './db';
import { ObjectId, Schedule } from './types';
import { getPartners } from './partners';
import { getMonthSkippedDays } from './skippedDays';

// Return a boolean indicating whether the array of dates contains the specified dates
function arrayHasDate(haystack: Date[], needle: Date) {
  return haystack.some((date: Date) => isSameDay(date, needle));
}

// Calculate the prayer partner schedule for the specified date
function calculatePartnersByDay(month: Date, skippedDays: Date[], partnerIds: ObjectId[]): ObjectId[][] {
  const daysInMonth: Date[] = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });

  // Count the number of days that are not skipped and will contain partners
  const numDays: number = daysInMonth.filter(day => !arrayHasDate(skippedDays, day)).length;

  let dayIndex: number = 0;
  return daysInMonth.map((day: Date): ObjectId[] => {
    if (arrayHasDate(skippedDays, day)) {
      // This day is skipped, so it gets no partners scheduled
      return [];
    }

    const startIndex = Math.floor(dayIndex * partnerIds.length / numDays);
    const endIndex = Math.floor((dayIndex + 1) * partnerIds.length / numDays);
    ++dayIndex;

    return partnerIds.slice(startIndex, endIndex);
  });
}

// Create or update the schedule for the specified month
export async function generateSchedule(dirtyMonth: Date): Promise<Schedule> {
  const month = startOfMonth(dirtyMonth);
  const db = await getDb();

  // Create the new schedule
  const skippedDays = await getMonthSkippedDays(month);
  const partners = await getPartners();
  const partnerIds = partners.map(({ _id }) => _id);
  const partnersByDay = calculatePartnersByDay(month, skippedDays, partnerIds);
  const skippedDayIds = skippedDays.map(day => day.getUTCDate() - 1);
  const { _id } = (await db.collection<Schedule>('schedule').findOneAndUpdate(
    { month },
    { $set: { partnersByDay, skippedDayIds } },
    { projection: { _id: 1 }, upsert: true, returnOriginal: false }
  )).value || {};
  if (!_id) {
    throw new Error('Could not find generated schedule');
  }
  return {
    _id,
    month,
    partnersByDay,
    skippedDayIds,
  };
}

// Return the schedule for the specified month
export async function getSchedule(dirtyMonth: Date): Promise<Schedule> {
  const month = startOfMonth(dirtyMonth);
  const db = await getDb();
  return await db.collection<Schedule>('schedule').findOne({ month }) || await generateSchedule(month);
}

import { eachDayOfInterval, endOfMonth, isSameDay, startOfMonth } from 'https://cdn.skypack.dev/date-fns@2.16.1';
import { getDb } from './db.ts';
import { ObjectId, Schedule } from './types.ts';
import { getPartners } from './partners.ts';
import { getMonthSkippedDays } from './skippedDays.ts';

// Return a boolean indicating whether the array of dates contains the specified dates
function arrayHasDate(haystack: Date[], needle: Date) {
  return haystack.some((date: Date) => isSameDay(date, needle));
}

// Calculate the prayer partner schedule for the specified date
function calculatePartnersByDay(month: Date, skippedDays: Date[], partnerIds: ObjectId[]): ObjectId[][] {
  const daysInMonth: Date[] = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }, {});

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
async function generateSchedule(dirtyMonth: Date): Promise<Schedule> {
  const month = startOfMonth(dirtyMonth);
  const db = await getDb();

  // Create the new schedule
  const skippedDays = await getMonthSkippedDays(month);
  const partners = await getPartners();
  const partnerIds = partners.map(({ _id }) => _id);
  const partnersByDay = calculatePartnersByDay(month, skippedDays, partnerIds);
  const { upsertedId } = await db.collection<Schedule>('schedule').updateOne(
    { month },
    { $set: { partnersByDay } },
    { upsert: true }
  );

  if (!upsertedId) {
    throw new Error('No schedule was created or updated');
  }

  return {
    _id: upsertedId,
    month,
    partnersByDay,
  }
}

// Return the schedule for the specified month
export async function getSchedule(dirtyMonth: Date): Promise<Schedule> {
  const month = startOfMonth(dirtyMonth);
  const db = await getDb();
  return await db.collection<Schedule>('schedule').findOne({ month }) || await generateSchedule(month);
}
import { range } from 'lodash';
import { endOfMonth, startOfMonth } from '../date-fns-utc';
import { getDb } from './db';
import { ObjectId, ScheduleDayModel, ScheduleModel } from './models';
import { getPartners } from './partners';

// Return the days for the specified schedule
export async function getScheduleDays(scheduleId: ObjectId): Promise<ScheduleDayModel[]> {
  const db = await getDb();
  return db.collection<ScheduleDayModel>('scheduleDay').find({ scheduleId }).toArray();
}

// Calculate the days in the prayer partner schedule for the specified month
export async function updateScheduleDays(schedule: ScheduleModel): Promise<void> {
  const db = await getDb();

  // Find all of the partners
  const partners = await getPartners();
  const partnerIds = partners.map(({ _id }) => _id);

  // Find the days that are unskipped and incomplete
  const scheduleDays = await db.collection<ScheduleDayModel>('scheduleDay').find({
    scheduleId: schedule._id, isSkipped: false, dayId: { $gte: schedule.completedDays },
  }).toArray();

  // Count the number of partners that have already been completed because they are assigned to completed days
  const aggregateResult = await db.collection<{ completedPartners: number }>('scheduleDay').aggregate([
    { $match: { scheduleId: schedule._id, dayId: { $lt: schedule.completedDays } } },
    { $project: { _id: 0, numPartners: { $size: '$partners' } } },
    { $group: { _id: null, completedPartners: { $sum: '$numPartners' } } },
  ]).toArray();
  const numCompletedPartners = aggregateResult[0]?.completedPartners ?? 0;
  const incompletePartners = partnerIds.slice(numCompletedPartners);

  // Count the number of days that are not skipped and will contain partners
  const numDays: number = scheduleDays.length;
  const partnersPerDay: number = Math.floor(incompletePartners.length / numDays);
  const remainderPartners: number = incompletePartners.length % numDays;

  let numDistributedPartners = 0;

  // eslint-disable-next-line no-restricted-syntax
  for await (const [index, day] of scheduleDays.entries()) {
    // Assign partnersPerDay to each day and give the remaining partners to the earlier days
    const startIndex = numDistributedPartners;
    const endIndex = numDistributedPartners + partnersPerDay + (index < remainderPartners ? 1 : 0);
    numDistributedPartners = endIndex;

    await db.collection<ScheduleDayModel>('scheduleDay').updateOne(
      { scheduleId: schedule._id, dayId: day.dayId },
      { $set: { partners: incompletePartners.slice(startIndex, endIndex) } },
    );
  }

  await db.collection<ScheduleDayModel>('scheduleDay').updateMany(
    { scheduleId: schedule._id, dayId: { $gte: schedule.completedDays }, isSkipped: true },
    { $set: { partners: [] } },
  );
}

// Create a new schedule for the specified month
async function createSchedule(dirtyMonth: Date): Promise<ScheduleModel> {
  const month = startOfMonth(dirtyMonth);
  const db = await getDb();

  // Create the schedule
  const scheduleFields = { month, completedDays: 0 };
  const { insertedId } = await db.collection<ScheduleModel>('schedule').insertOne(scheduleFields);

  // Create the schedule days
  const numDaysInMonth = endOfMonth(month).getUTCDate();
  const firstDayOfMonth = month.getUTCDay();
  await db.collection<ScheduleDayModel>('scheduleDay').insertMany(range(numDaysInMonth).map((dayId) => {
    const isWeekend = [0, 6].includes((dayId + firstDayOfMonth) % 7);
    return {
      scheduleId: insertedId,
      dayId,
      partners: [],
      isSkipped: isWeekend,
    };
  }));

  // Populate the schedule days
  const schedule: ScheduleModel = { _id: insertedId, ...scheduleFields };
  await updateScheduleDays(schedule);

  return schedule;
}

// Return the schedule for the specified month
export async function getSchedule(dirtyMonth: Date): Promise<ScheduleModel> {
  const month = startOfMonth(dirtyMonth);
  const db = await getDb();
  return await db.collection<ScheduleModel>('schedule').findOne({ month }) || createSchedule(month);
}

// Mark the specified day as completed
export async function completeDay(scheduleId: ObjectId, completedDays: number): Promise<ScheduleModel> {
  const db = await getDb();

  const { value: schedule } = await db.collection<ScheduleModel>('schedule').findOneAndUpdate(
    { _id: scheduleId },
    { $set: { completedDays } },
    { returnOriginal: false },
  );
  if (!schedule) {
    throw new Error('Schedule does not exist');
  }

  await updateScheduleDays(schedule);

  // Return the updated schedule
  return schedule;
}

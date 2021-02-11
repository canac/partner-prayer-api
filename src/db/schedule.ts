import { range } from 'lodash';
import { ObjectId } from 'mongodb';
import { endOfMonth, startOfMonth } from '../date-fns-utc';
import { ScheduleDayModel, ScheduleModel } from '../generated/graphql';
import { getCollection, getDb } from './db';
import { getPartners } from './partners';

// Return the days for the specified schedule
export async function getScheduleDays(scheduleId: ObjectId): Promise<ScheduleDayModel[]> {
  return (await getCollection('scheduleDay')).find({ scheduleId }).toArray();
}

// Calculate the days in the prayer partner schedule for the specified month
export async function updateScheduleDays(schedule: ScheduleModel): Promise<void> {
  const db = await getDb();

  // Find all of the partners
  const partners = await getPartners();
  const partnerIds = partners.map(({ _id }) => _id);

  // Find the days that are unskipped and incomplete
  const scheduleDays = await (await getCollection('scheduleDay')).find({
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

    await (await getCollection('scheduleDay')).updateOne(
      { scheduleId: schedule._id, dayId: day.dayId },
      { $set: { partners: incompletePartners.slice(startIndex, endIndex) } },
    );
  }

  // Incomplete skipped days receive no partners
  await (await getCollection('scheduleDay')).updateMany(
    { scheduleId: schedule._id, dayId: { $gte: schedule.completedDays }, isSkipped: true },
    { $set: { partners: [] } },
  );
}

// Create a new schedule for the specified month
async function createSchedule(dirtyMonth: Date): Promise<ScheduleModel> {
  const month = startOfMonth(dirtyMonth);

  // Create the schedule
  const scheduleFields = { month, completedDays: 0 };
  const { insertedId } = await (await getCollection('schedule')).insertOne(scheduleFields);

  // Create the schedule days
  const numDaysInMonth = endOfMonth(month).getUTCDate();
  const firstDayOfMonth = month.getUTCDay();
  await (await getCollection('scheduleDay')).insertMany(range(numDaysInMonth).map((dayId) => {
    const isWeekend = [0, 6].includes((dayId + firstDayOfMonth) % 7);
    return {
      scheduleId: insertedId,
      dayId,
      partners: [],
      // Weekends are initially skipped
      isSkipped: isWeekend,
    };
  }));

  // Populate the schedule days
  const schedule: ScheduleModel = { _id: insertedId, ...scheduleFields };
  await updateScheduleDays(schedule);

  return schedule;
}

// Return the schedule for the specified month, creating it if necessary
export async function getOrCreateSchedule(dirtyMonth: Date): Promise<ScheduleModel> {
  const month = startOfMonth(dirtyMonth);
  return await (await getCollection('schedule')).findOne({ month }) || createSchedule(month);
}

// Mark the specified day as completed
export async function completeDay(scheduleId: ObjectId, completedDays: number): Promise<ScheduleModel> {
  // Set the schedule's number of completed days
  const { value: schedule } = await (await getCollection('schedule')).findOneAndUpdate(
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

// Update the skipped status of the given day
export async function setSkippedDayStatus(scheduleId: ObjectId, dayId: number, isSkipped: boolean):
  Promise<ScheduleModel> {
  // Make sure the schedule exists before doing anything
  const schedule = await (await getCollection('schedule')).findOne({ _id: scheduleId });
  if (!schedule) {
    throw new Error('Schedule does not exist');
  }

  // Update the schedule day
  const { modifiedCount } = await (await getCollection('scheduleDay')).updateOne(
    { scheduleId, dayId },
    { $set: { isSkipped } },
  );
  if (modifiedCount === 0) {
    throw new Error('Schedule day does not exist');
  }

  await updateScheduleDays(schedule);

  // Return the referenced schedule
  return schedule;
}

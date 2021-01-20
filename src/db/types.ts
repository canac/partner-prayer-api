import { ObjectId } from 'mongodb';

export { PartnerModel, ScheduleModel } from '../generated/graphql';

export { ObjectId };

export interface CompletedDayModel {
  _id: ObjectId;
  lastCompletedDay: Date;
}

export interface SkippedDayModel {
  _id: ObjectId;
  month: Date;
  dayId: number; // zero-based index of the day from the start of the month
  isSkipped: boolean;
}

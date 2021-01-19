import { ObjectId } from 'mongodb';

export { PartnerModel, ScheduleModel } from '../generated/graphql';

export { ObjectId };

export interface CompletedDayModel {
  _id: ObjectId;
  lastCompletedDay: Date;
}

export interface SkippedDayModel {
  _id: ObjectId;
  date: Date;
  isSkipped: boolean;
}

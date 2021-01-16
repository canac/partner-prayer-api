export { PartnerModel, ScheduleModel } from '../generated/graphql';

import { ObjectId } from 'mongodb';

export { ObjectId };

export interface CompletedDayModel {
  _id: ObjectId;
  lastCompletedDay: Date;
};

export interface SkippedDayModel {
  _id: ObjectId;
  date: Date;
  isSkipped: boolean;
}

import { PartnerModel, ScheduleModel } from '../generated/graphql';

import { ObjectId } from 'mongodb';

export { ObjectId };

export interface CompletedDay {
  _id: ObjectId;
  lastCompletedDay: Date;
};

export interface SkippedDay {
  _id: ObjectId;
  date: Date;
  isSkipped: boolean;
}

export type Partner = PartnerModel;
export type Schedule = ScheduleModel;

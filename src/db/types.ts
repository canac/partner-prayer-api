import { ObjectId } from 'mongodb';

export { ObjectId };

export interface CompletedDay {
  _id: ObjectId;
  lastCompletedDay: Date;
};

export interface Partner {
  _id: ObjectId;
  firstName: string;
  lastName: string;
}

export interface Settings {
  _id: ObjectId;
  lastCompletedDay: Date;
}

export interface SkippedDay {
  _id: ObjectId;
  date: Date;
  isSkipped: boolean;
}

export type Schedule = {
  _id: ObjectId;
  month: Date;
  partnersByDay: ObjectId[][];
  skippedDayIds: number[];
}

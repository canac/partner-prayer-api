import { Bson } from 'https://deno.land/x/mongo@v0.20.1/mod.ts';

export type ObjectId = Bson.ObjectId;

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
}

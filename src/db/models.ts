export { ObjectId } from 'mongodb';
export { PartnerModel, ScheduleDayModel, ScheduleModel } from '../generated/graphql';

export type WithoutId<Model> = Omit<Model, '_id'>;

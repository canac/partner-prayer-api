import { readFileSync } from 'fs';
import { gql } from 'apollo-server';
import { GraphQLDate } from 'graphql-iso-date';
import { ObjectId, PartnerModel, ScheduleModel } from './db/models';
import { getPartners } from './db/partners';
import {
  completeDay, getSchedule, getScheduleDays, setSkippedDayStatus,
} from './db/schedule';
import {
  MutationCompleteDayArgs, MutationSkipDayArgs, QueryScheduleArgs, Resolvers, ResolversTypes,
} from './generated/graphql';

// Construct the GraphQL schema
const typeDefs = gql(readFileSync('schema.graphql', 'utf8'));

// Provide resolver functions for the schema fields
const resolvers: Resolvers = {
  Date: GraphQLDate,
  Mutation: {
    completeDay(_: unknown, { input: { scheduleId, completedDays } }: MutationCompleteDayArgs): Promise<ScheduleModel> {
      return completeDay(new ObjectId(scheduleId), completedDays);
    },

    skipDay(_: unknown, { input: { scheduleId, dayId, isSkipped } }: MutationSkipDayArgs): Promise<ScheduleModel> {
      return setSkippedDayStatus(new ObjectId(scheduleId), dayId, isSkipped);
    },
  },
  Schedule: {
    async days(schedule: ScheduleModel): Promise<Array<ResolversTypes['ScheduleDay']>> {
      const allPartners = await getPartners();

      // Index the partners by their id
      const partnersById = new Map<string, PartnerModel>(allPartners
        .map((partner) => ([partner._id.toHexString(), partner])));

      const days = await getScheduleDays(schedule._id);
      return days.map((day) => ({
        ...day,

        _id: day._id.toHexString(),
        schedule,

        // Convert the partner ids to full partner models
        partners: day.partners.map((id) => partnersById.get(id.toHexString()) || []).flat(),
      }));
    },
  },
  Query: {
    async partners(): Promise<PartnerModel[]> {
      return getPartners();
    },

    async schedule(_: unknown, { month }: QueryScheduleArgs): Promise<ScheduleModel> {
      return getSchedule(month);
    },
  },
};

export { typeDefs, resolvers };

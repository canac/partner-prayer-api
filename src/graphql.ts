import { readFileSync } from 'fs';
import { gql } from 'apollo-server';
import { GraphQLDate } from 'graphql-iso-date';
import { getLastCompletedDay, setLastCompletedDay } from './db/completedDays';
import { getPartners } from './db/partners';
import { generateSchedule, getSchedule } from './db/schedule';
import { setSkippedDayStatus } from './db/skippedDays';
import { ObjectId, PartnerModel, ScheduleModel } from './db/types';
import {
  MutationCompleteDayArgs, MutationSkipDayArgs, QueryScheduleArgs, Resolvers,
} from './generated/graphql';

// Construct the GraphQL schema
const typeDefs = gql(readFileSync('schema.graphql', 'utf8'));

// Provide resolver functions for the schema fields
const resolvers: Resolvers = {
  Date: GraphQLDate,
  Mutation: {
    async completeDay(_: unknown, { day }: MutationCompleteDayArgs): Promise<Date> {
      await setLastCompletedDay(day);
      return day;
    },

    async skipDay(_: unknown, { day, isSkipped }: MutationSkipDayArgs): Promise<ScheduleModel> {
      await setSkippedDayStatus(day, isSkipped);
      return generateSchedule(day);
    },
  },
  Schedule: {
    async partnersByDay(context: ScheduleModel): Promise<PartnerModel[][]> {
      const partners = await getPartners();

      // Index the partners by their id
      const partnersById = new Map<string, PartnerModel>(partners
        .map((partner) => ([partner._id.toHexString(), partner])));

      // Convert the partner ids to full partner models
      return context.partnersByDay
        .map((partnerIds) => partnerIds.map((id: ObjectId) => partnersById.get(id.toHexString()) || [])
          .flat());
    },
  },
  Query: {
    async lastCompletedDay(): Promise<Date> {
      return getLastCompletedDay();
    },

    async partners(): Promise<PartnerModel[]> {
      return getPartners();
    },

    async schedule(_: unknown, { month }: QueryScheduleArgs): Promise<ScheduleModel> {
      return getSchedule(month);
    },
  },
};

export { typeDefs, resolvers };

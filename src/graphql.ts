import { readFileSync } from 'fs';
import { gql } from 'apollo-server';
import { GraphQLDate } from 'graphql-iso-date';
import { getLastCompletedDay, setLastCompletedDay } from './db/completedDays';
import { getPartners } from './db/partners';
import { generateSchedule, getSchedule } from './db/schedule';
import { setSkippedDayStatus } from './db/skippedDays';
import { ObjectId, Partner, Schedule } from './db/types';

// Construct the GraphQL schema
const typeDefs = gql(readFileSync('schema.graphql', 'utf8'));

type CompleteDayMutationParams = {
  day: Date;
}

type SkipDayMutationParams = {
  day: Date;
  isSkipped: boolean;
}

type ScheduleQueryParams = {
  month: Date;
};

// Provide resolver functions for the schema fields
const resolvers = {
  Date: GraphQLDate,
  Mutation: {
    async completeDay(_: any, { day }: CompleteDayMutationParams): Promise<Date> {
      await setLastCompletedDay(day);
      return day;
    },

    async skipDay(_: any, { day, isSkipped}: SkipDayMutationParams): Promise<Schedule> {
      await setSkippedDayStatus(day, isSkipped);
      return await generateSchedule(day);
    }
  },
  Schedule: {
    async partnersByDay(context: Schedule): Promise<Partner[][]> {
      const partners = await getPartners();

      // Index the partners by their id
      const partnersById = new Map<string, Partner>(partners.map(partner => ([ partner._id.toHexString(), partner ])));

      // Convert the partner ids to full partner models
      return context.partnersByDay.map(partnerIds => partnerIds.map((id: ObjectId) => partnersById.get(id.toHexString()) || []).flat());
    }
  },
  Query: {
    async lastCompletedDay(): Promise<Date> {
      return await getLastCompletedDay();
    },

    async partners(): Promise<Partner[]> {
      return await getPartners();
    },

    async schedule(_: any, { month }: ScheduleQueryParams): Promise<Schedule> {
      return await getSchedule(month);
    },
  },
};

export { typeDefs, resolvers };

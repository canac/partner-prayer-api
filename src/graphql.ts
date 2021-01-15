import { gql } from 'apollo-server';
import { GraphQLDate } from 'graphql-iso-date';
import { getLastCompletedDay, setLastCompletedDay } from './db/completedDays';
import { getPartners } from './db/partners';
import { generateSchedule, getSchedule } from './db/schedule';
import { setSkippedDayStatus } from './db/skippedDays';
import { Partner, Schedule } from './db/types';

// Construct the GraphQL schema
const typeDefs = gql`
  scalar Date

  type Partner {
    _id: ID!
    firstName: String!
    lastName: String!
  }

  type Schedule {
    month: Date!
    partnersByDay: [[ID!]]
    skippedDayIds: [Int!]
  }

  type Query {
    lastCompletedDay: Date
    partners: [Partner]
    schedule(month: Date!): Schedule
  }

  type Mutation {
    completeDay(day: Date!): Date
    skipDay(day: Date!, isSkipped: Boolean!): Schedule
  }
`;

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

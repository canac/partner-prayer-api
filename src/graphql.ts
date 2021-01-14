import { ApolloServer, gql } from 'apollo-server';
import { GraphQLDate } from 'graphql-iso-date';
import { getLastCompletedDay } from './db/completedDays';
import { getPartners } from './db/partners';
import { getSchedule } from './db/schedule';
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
`;

type ScheduleQueryParams = {
  month: Date;
};

// Provide resolver functions for the schema fields
const resolvers = {
  Date: GraphQLDate,
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

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
  console.log(`Server running at ${url}`);
});

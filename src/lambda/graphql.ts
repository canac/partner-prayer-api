import { DIRECTIVES } from '@graphql-codegen/typescript-mongodb';
import { ApolloServer } from 'apollo-server-lambda';
import { resolvers, typeDefs } from '../graphql';

const server = new ApolloServer({
  typeDefs: [DIRECTIVES, typeDefs],
  resolvers,
});

// eslint-disable-next-line import/prefer-default-export
export const handler = server.createHandler({
  cors: {
    origin: [
      process.env.FRONTEND_ORIGIN ?? '',
      'https://studio.apollographql.com',
    ],
    allowedHeaders: 'Origin, Content-Type, Accept, Authorization',
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
  },
});

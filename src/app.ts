import 'dotenv/config';
import { DIRECTIVES } from '@graphql-codegen/typescript-mongodb';
import { ApolloServer } from 'apollo-server';
import { resolvers, typeDefs } from './graphql';

const server = new ApolloServer({
  typeDefs: [DIRECTIVES, typeDefs],
  resolvers,
  cors: {
    origin: [process.env.FRONTEND_ORIGIN ?? '', 'https://studio.apollographql.com'],
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
  },
});
const port = process.env.PORT;
server.listen({ port: port ? parseInt(port, 10) : 8081 }).then(({ url }) => {
  // eslint-disable-next-line no-console
  console.log(`Server running at ${url}`);
}).catch((err: Error) => {
  // eslint-disable-next-line no-console
  console.error(err);
});

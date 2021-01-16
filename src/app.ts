import 'dotenv/config';
import { ApolloServer } from 'apollo-server';
import { DIRECTIVES } from '@graphql-codegen/typescript-mongodb';
import { resolvers, typeDefs } from './graphql';

const server = new ApolloServer({
  typeDefs: [DIRECTIVES, typeDefs],
  resolvers,
  cors: {
    origin: process.env.FRONTEND_ORIGIN,
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
  }
});
const port = process.env.PORT;
server.listen({ port: port ? parseInt(port, 10) : 8081 }).then(({ url }) => {
  console.log(`Server running at ${url}`);
});

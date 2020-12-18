import dotenv from 'dotenv';
dotenv.config();
import { ApolloServer } from 'apollo-server';
import { importSchema } from 'graphql-import';
import { dataStore } from './dataStore';
import resolvers from './resolvers';

export const typeDefs = importSchema('./src/schema.graphql');

const server = new ApolloServer({ typeDefs, resolvers, context: { dataStore } });

server.listen().then(({ url }: { url: string }) => {
  console.log(url);
  console.log(`🚀 Server ready at ${url} 🚀`);
  console.log(`Visit ${url}graphiql to load the playground`);
});

import dotenv from 'dotenv';
dotenv.config();
import { ApolloServer, gql } from 'apollo-server';
import { dataStore } from './dataStore';
import resolvers from './resolvers';

const typeDefs = gql`
  enum State {
    COMPLETE
    INCOMPLETE
    IN_PROGRESS
  }
  type Todo {
    id: ID!
    title: String
    state: State
  }
  type Query {
    todos: [Todo]
    todo(id: ID!): Todo
  }
  type Mutation {
    createTodo(title: String!, state: State!): Todo
  }
`;

const server = new ApolloServer({ typeDefs, resolvers, context: { dataStore } });
server.listen().then(({ url }: { url: string }) => {
  console.log(url);
  console.log(`🚀 Server ready at ${url} 🚀`);
  console.log(`Visit ${url}graphiql to load the playground`);
});

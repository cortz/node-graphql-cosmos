import { Resolvers } from './generated/graphql';
const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient({
  endpoint: process.env.ENDPOINT,
  key: process.env.KEY,
});

const container = client.database(process.env.DATABASE).container(process.env.CONTAINER);

const resolvers: Resolvers = {
  Query: {
    async todos(root, __, { dataStore }) {
      return dataStore.getTodos(); // container.items.query('SELECT * from c').fetchAll()
    },
    async todo(root, { id }, { dataStore }) {
      return dataStore.getTodoById(id);
    },
  },
  Mutation: {
    createTodo: async (root, args) => {
      const response = await container.items.create(args);
      return response.resource;
    },
  },
  Todo: {
    id(todo) {
      return todo.id;
    },
    title(todo) {
      return todo.title;
    },
    state(todo) {
      return todo.state;
    },
  },
};

export default resolvers;

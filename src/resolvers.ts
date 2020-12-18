import { Privilege, Resolvers, State } from './generated/graphql';
import { CosmosClient } from '@azure/cosmos';

export type TodoModel = {
  id: string;
  title: string;
  state: State;
  userId: string;
};

export type UserModel = {
  id: string;
  email: string;
  privilege: Privilege;
};

const client = new CosmosClient(process.env.CosmosConnectionString || '');

const container = client.database(process.env.DATABASE || '').container(process.env.CONTAINER || '');

const resolvers: Resolvers = {
  Query: {
    todos: (_root, __, { dataStore }) => dataStore.getTodos(),
    todo: async (_root, { id }, { dataStore }): Promise<TodoModel> => await dataStore.getTodoById(id),

    user: (root, { id }, { dataStore }) => dataStore.getUserById(id),
    users: (root, __, { dataStore }) => dataStore.getUsers(),
  },
  Mutation: {
    createTodo: async (_root, args, { dataStore }): Promise<TodoModel> => {
      const response = await container.items.create(args);
      if (!response.resource) throw Error('An error occurred creating the user.');

      return {
        id: response.resource.id,
        title: response.resource.title,
        state: response.resource.state,
        userId: response.resource.userId,
      };
    },
    createUser: async (_root, args): Promise<UserModel> => {
      const response = await container.items.create(args);
      if (!response.resource) throw Error('An error occurred creating the todo');

      return {
        id: response.resource.id,
        email: response.resource.email,
        privilege: response.resource.privilege,
      };
    },
  },
  Todo: {
    id: ({ id }) => id,
    title: ({ title }) => title,
    state: ({ state }) => state,
    user: ({ userId }, _, { dataStore }) => dataStore.getUserById(userId),
  },
  User: {
    id: ({ id }) => id,
    email: ({ email }) => email,
    privilege: ({ privilege }) => privilege || Privilege.Contributer,
    todos: ({ id }, _, { dataStore }) => dataStore.getTodosByUserId(id),
  },
};

export default resolvers;

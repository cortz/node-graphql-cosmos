import { CosmosClient } from '@azure/cosmos';
import { State, Privilege } from './generated/graphql';

interface Todo {
  id: string;
  title: string;
  state: State;
  userId: string;
}

interface User {
  id: string;
  email: string;
  privilege: Privilege;
}

interface DataStore {
  getTodosByUserId(userId: any): Promise<Todo[]>;
  getTodoById(id: string): Promise<Todo>;
  getTodos(): Promise<Todo[]>;

  getUserById(id: string): Promise<User>;
  getUsers(): Promise<User[]>;
}

class CosmosDataStore implements DataStore {
  private client: CosmosClient;
  private databaseName = process.env.DATABASE;
  private containerName = process.env.CONTAINER;

  private getContainer = () => {
    if (!this.databaseName || !this.containerName) {
      throw Error('Database or container not set');
    }

    return this.client.database(this.databaseName).container(this.containerName);
  };

  constructor(client: CosmosClient) {
    this.client = client;
  }
  async getUserById(id: string): Promise<User> {
    const container = this.getContainer();

    const user = await container.items
      .query<User>({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: id }],
      })
      .fetchAll();

    return user.resources[0];
  }

  async getUsers(): Promise<User[]> {
    const container = this.getContainer();
    const users = await container.items
      .query<User>({
        query: 'SELECT * FROM c',
      })
      .fetchAll();

    return users.resources;
  }

  async getTodoById(id: string): Promise<Todo> {
    const container = this.getContainer();

    const todo = await container.items
      .query<Todo>({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: id }],
      })
      .fetchAll();

    return todo.resources[0];
  }

  async getTodos(): Promise<Todo[]> {
    const container = this.getContainer();
    const todos = await container.items
      .query<Todo>({
        query: 'SELECT * FROM c',
      })
      .fetchAll();

    return todos.resources;
  }

  async getTodosByUserId(id: string): Promise<Todo[]> {
    const container = this.getContainer();

    const todos = await container.items
      .query<Todo>({
        query: 'SELECT * FROM c where c.userId = @id',
        parameters: [{ name: '@id', value: id }],
      })
      .fetchAll();

    return todos.resources;
  }
}

export const dataStore = new CosmosDataStore(new CosmosClient(process.env.CosmosConnectionString || ''));

export type Context = {
  dataStore: DataStore;
};

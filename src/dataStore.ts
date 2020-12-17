import { CosmosClient } from '@azure/cosmos';
import { State } from './generated/graphql';

export type TodoModel = {
  id: string;
  title: string;
  state: State;
};

interface DataStore {
  getTodoById(id: string): Promise<TodoModel>;
  getTodos(): Promise<TodoModel[]>;
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

  async getTodoById(id: string): Promise<TodoModel> {
    const container = this.getContainer();

    const todo = await container.items
      .query<TodoModel>({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: id }],
      })
      .fetchAll();

    return todo.resources[0];
  }

  async getTodos(): Promise<TodoModel[]> {
    const container = this.getContainer();
    const todos = await container.items
      .query<TodoModel>({
        query: 'SELECT * FROM c',
      })
      .fetchAll();

    return todos.resources;
  }
}

export const dataStore = new CosmosDataStore(
  new CosmosClient({
    endpoint: process.env.ENDPOINT ?? '',
    key: process.env.KEY ?? '',
  }),
);

export type Context = {
  dataStore: DataStore;
};

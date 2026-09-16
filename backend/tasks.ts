export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

export interface TaskRepository {
  list(): Promise<Task[]>;
  create(title: string): Promise<Task>;
  updateCompleted(id: string, completed: boolean): Promise<Task | null>;
}

export type TaskRequest = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
};

export type TaskResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): TaskResponse;
  json(body: unknown): void;
  end(): void;
};

export function createTasksHandler(repository: TaskRepository) {
  return async function tasksHandler(request: TaskRequest, response: TaskResponse) {
    setCors(response);

    if (request.method === 'OPTIONS') {
      response.status(204).end();
      return;
    }

    try {
      if (request.method === 'GET') {
        response.status(200).json(await repository.list());
        return;
      }

      if (request.method === 'POST') {
        const body = parseBody(request.body);
        const title = normalizeTitle(body.title);
        if (!title) {
          response.status(400).json({ error: 'Task title cannot be empty.' });
          return;
        }
        if (title.length > 160) {
          response.status(400).json({ error: 'Task title must be 160 characters or fewer.' });
          return;
        }

        response.status(201).json(await repository.create(title));
        return;
      }

      if (request.method === 'PATCH') {
        const id = firstQueryValue(request.query?.id);
        const body = parseBody(request.body);
        if (!id) {
          response.status(400).json({ error: 'Task id is required.' });
          return;
        }
        if (typeof body.completed !== 'boolean') {
          response.status(400).json({ error: 'completed must be a boolean.' });
          return;
        }

        const task = await repository.updateCompleted(id, body.completed);
        if (!task) {
          response.status(404).json({ error: 'Task not found.' });
          return;
        }

        response.status(200).json(task);
        return;
      }

      response.setHeader('Allow', 'GET, POST, PATCH, OPTIONS');
      response.status(405).json({ error: 'Method not allowed.' });
    } catch (error) {
      console.error('Task API error', error);
      response.status(500).json({ error: 'The task service is temporarily unavailable.' });
    }
  };
}

export function normalizeTitle(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseBody(value: unknown): Record<string, unknown> {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function setCors(response: TaskResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

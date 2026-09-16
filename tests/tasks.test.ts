import { beforeEach, describe, expect, it } from 'vitest';

import {
  createTasksHandler,
  type Task,
  type TaskRepository,
  type TaskResponse,
} from '../backend/tasks';

class MemoryTaskRepository implements TaskRepository {
  tasks: Task[] = [];

  async list() {
    return this.tasks;
  }

  async create(title: string) {
    const task = {
      id: String(this.tasks.length + 1),
      title,
      completed: false,
      createdAt: new Date(0).toISOString(),
    };
    this.tasks.unshift(task);
    return task;
  }

  async updateCompleted(id: string, completed: boolean) {
    const task = this.tasks.find((candidate) => candidate.id === id);
    if (!task) return null;
    task.completed = completed;
    return task;
  }
}

function createResponse() {
  const result = { statusCode: 0, body: undefined as unknown, headers: {} as Record<string, string> };
  const response: TaskResponse = {
    setHeader(name, value) {
      result.headers[name] = value;
    },
    status(code) {
      result.statusCode = code;
      return response;
    },
    json(body) {
      result.body = body;
    },
    end() {},
  };
  return { response, result };
}

describe('Tiny Tasks API', () => {
  let repository: MemoryTaskRepository;
  let handler: ReturnType<typeof createTasksHandler>;

  beforeEach(() => {
    repository = new MemoryTaskRepository();
    handler = createTasksHandler(repository);
  });

  it('rejects an empty task', async () => {
    const { response, result } = createResponse();
    await handler({ method: 'POST', body: { title: '   ' } }, response);
    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual({ error: 'Task title cannot be empty.' });
  });

  it('creates and retrieves a trimmed task', async () => {
    const created = createResponse();
    await handler({ method: 'POST', body: { title: '  Submit project  ' } }, created.response);
    expect(created.result.statusCode).toBe(201);
    expect(created.result.body).toMatchObject({ title: 'Submit project', completed: false });

    const listed = createResponse();
    await handler({ method: 'GET' }, listed.response);
    expect(listed.result.body).toHaveLength(1);
  });

  it('marks an existing task complete', async () => {
    const task = await repository.create('Test on phone');
    const updated = createResponse();
    await handler(
      { method: 'PATCH', query: { id: task.id }, body: { completed: true } },
      updated.response,
    );
    expect(updated.result.statusCode).toBe(200);
    expect(updated.result.body).toMatchObject({ id: task.id, completed: true });
  });

  it('returns 404 for a missing task', async () => {
    const { response, result } = createResponse();
    await handler(
      { method: 'PATCH', query: { id: 'missing' }, body: { completed: true } },
      response,
    );
    expect(result.statusCode).toBe(404);
  });
});

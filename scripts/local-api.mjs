import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, resolve } from 'node:path';

import { createTasksHandler } from '../backend/tasks.ts';

const port = Number(process.env.PORT || 3001);
const dataFile = resolve('.local/tasks.json');

class FileTaskRepository {
  async list() {
    return readTasks();
  }

  async create(title) {
    const tasks = await readTasks();
    const task = {
      id: randomUUID(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    tasks.unshift(task);
    await saveTasks(tasks);
    return task;
  }

  async updateCompleted(id, completed) {
    const tasks = await readTasks();
    const task = tasks.find((candidate) => candidate.id === id);
    if (!task) return null;
    task.completed = completed;
    await saveTasks(tasks);
    return task;
  }
}

const handleTasks = createTasksHandler(new FileTaskRepository());

createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host}`);
  if (url.pathname !== '/api/tasks') {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Not found.' }));
    return;
  }

  const body = await readBody(request);
  const adaptedResponse = {
    setHeader: (name, value) => response.setHeader(name, value),
    status(code) {
      response.statusCode = code;
      return adaptedResponse;
    },
    json(value) {
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify(value));
    },
    end: () => response.end(),
  };

  await handleTasks(
    {
      method: request.method,
      body,
      query: Object.fromEntries(url.searchParams.entries()),
    },
    adaptedResponse,
  );
}).listen(port, '0.0.0.0', () => {
  console.log(`Tiny Tasks local API: http://localhost:${port}/api/tasks`);
});

async function readTasks() {
  try {
    return JSON.parse(await readFile(dataFile, 'utf8'));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return [];
    throw error;
  }
}

async function saveTasks(tasks) {
  await mkdir(dirname(dataFile), { recursive: true });
  await writeFile(dataFile, JSON.stringify(tasks, null, 2));
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (chunks.length === 0) return undefined;
  const value = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

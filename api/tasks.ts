import type { VercelRequest, VercelResponse } from '@vercel/node';

import { NeonTaskRepository } from '../backend/neonTaskRepository';
import { createTasksHandler } from '../backend/tasks';

let handler: ReturnType<typeof createTasksHandler> | undefined;

export default async function tasks(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    response.status(503).json({ error: 'The task database is not configured.' });
    return;
  }

  handler ??= createTasksHandler(new NeonTaskRepository(databaseUrl));
  await handler(request, response);
}

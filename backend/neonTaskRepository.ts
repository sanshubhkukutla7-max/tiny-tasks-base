import { neon } from '@neondatabase/serverless';

import type { Task, TaskRepository } from './tasks';

type TaskRow = {
  id: string;
  title: string;
  completed: boolean;
  created_at: string | Date;
};

export class NeonTaskRepository implements TaskRepository {
  private readonly sql;
  private initialized = false;

  constructor(databaseUrl: string) {
    this.sql = neon(databaseUrl);
  }

  async list() {
    await this.initialize();
    const rows = await this.sql`
      SELECT id, title, completed, created_at
      FROM tasks
      ORDER BY created_at DESC
    `;
    return rows.map((row) => mapTask(row as TaskRow));
  }

  async create(title: string) {
    await this.initialize();
    const rows = await this.sql`
      INSERT INTO tasks (title)
      VALUES (${title})
      RETURNING id, title, completed, created_at
    `;
    return mapTask(rows[0] as TaskRow);
  }

  async updateCompleted(id: string, completed: boolean) {
    await this.initialize();
    const rows = await this.sql`
      UPDATE tasks
      SET completed = ${completed}
      WHERE id = ${id}
      RETURNING id, title, completed, created_at
    `;
    return rows[0] ? mapTask(rows[0] as TaskRow) : null;
  }

  private async initialize() {
    if (this.initialized) return;
    await this.sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    this.initialized = true;
  }
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

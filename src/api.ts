import type { Task } from './types';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export async function getTasks(): Promise<Task[]> {
  return request<Task[]>('/api/tasks');
}

export async function addTask(title: string): Promise<Task> {
  return request<Task>('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
}

export async function updateTask(id: string, completed: boolean): Promise<Task> {
  return request<Task>(`/api/tasks?id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new Error('API URL is missing. Set EXPO_PUBLIC_API_URL and reload Expo.');
  }

  const response = await fetch(`${API_URL}${path}`, init);
  const body = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | { error?: string }
    | null;

  if (!response.ok) {
    throw new Error(body?.error ?? `Request failed (${response.status}).`);
  }

  return body as T;
}

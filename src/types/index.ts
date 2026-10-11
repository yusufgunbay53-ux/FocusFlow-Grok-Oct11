export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: 'todo' | 'inprogress' | 'done';
  createdAt: number;
  completedAt?: number;
}

export interface PomodoroSession {
  id: string;
  type: 'work' | 'break';
  duration: number;
  completedAt: number;
}

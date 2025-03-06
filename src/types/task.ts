
export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'in_progress' | 'completed';

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  due_date: string;
  assigned_user: string;
  created_at: string;
  created_by?: string;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  created_at: string;
}

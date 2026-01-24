import { supabase } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export class StudyService {
  // TASKS
  static async getTasks(userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Task[];
  }

  static async createTask(userId: string, title: string, subject: string = 'General', priority: 'low' | 'medium' | 'high' = 'medium', due_date?: string) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ user_id: userId, title, subject, priority, due_date }])
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  }

  static async updateTask(id: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  }

  static async toggleTaskCompletion(id: string, completed: boolean) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  }

  static async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}


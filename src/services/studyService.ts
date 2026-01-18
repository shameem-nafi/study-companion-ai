import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Department {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  courses?: Course[];
}

export interface Course {
  id: string;
  department_id: string;
  user_id: string;
  name: string;
  code?: string;
  created_at: string;
  updated_at: string;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  course_id: string;
  user_id: string;
  name: string;
  description?: string;
  completed: boolean;
  completed_at?: string;
  revision_count: number;
  last_revision_at?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  resources?: Resource[];
}

export interface Resource {
  id: string;
  topic_id: string;
  user_id: string;
  type: 'pdf' | 'link' | 'note' | 'youtube';
  title?: string;
  url?: string;
  file_path?: string;
  content?: string;
  created_at: string;
  updated_at: string;
}

export class StudyService {
  // DEPARTMENTS
  static async getDepartments(userId: string) {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Department[];
  }

  static async createDepartment(userId: string, name: string) {
    const { data, error } = await supabase
      .from('departments')
      .insert([{ user_id: userId, name }])
      .select()
      .single();
    if (error) throw error;
    return data as Department;
  }

  static async updateDepartment(id: string, name: string) {
    const { data, error } = await supabase
      .from('departments')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Department;
  }

  static async deleteDepartment(id: string) {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // COURSES
  static async getCourses(departmentId: string, userId: string) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('department_id', departmentId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Course[];
  }

  static async createCourse(userId: string, departmentId: string, name: string, code?: string) {
    const { data, error } = await supabase
      .from('courses')
      .insert([{ user_id: userId, department_id: departmentId, name, code }])
      .select()
      .single();
    if (error) throw error;
    return data as Course;
  }

  static async updateCourse(id: string, name: string, code?: string) {
    const { data, error } = await supabase
      .from('courses')
      .update({ name, code, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Course;
  }

  static async deleteCourse(id: string) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // TOPICS
  static async getTopics(courseId: string, userId: string) {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Topic[];
  }

  static async createTopic(
    userId: string,
    courseId: string,
    name: string,
    description?: string,
    tags?: string[]
  ) {
    const { data, error } = await supabase
      .from('topics')
      .insert([{
        user_id: userId,
        course_id: courseId,
        name,
        description,
        tags: tags || [],
        completed: false
      }])
      .select()
      .single();
    if (error) throw error;
    return data as Topic;
  }

  static async updateTopic(
    id: string,
    updates: {
      name?: string;
      description?: string;
      completed?: boolean;
      revision_count?: number;
      last_revision_at?: string;
      tags?: string[];
    }
  ) {
    const updateData: any = { ...updates, updated_at: new Date().toISOString() };
    if (updates.completed) {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('topics')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Topic;
  }

  static async deleteTopic(id: string) {
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // RESOURCES
  static async getResources(topicId: string, userId: string) {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('topic_id', topicId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Resource[];
  }

  static async createResource(
    userId: string,
    topicId: string,
    type: 'pdf' | 'link' | 'note' | 'youtube',
    title?: string,
    url?: string,
    content?: string
  ) {
    const { data, error } = await supabase
      .from('resources')
      .insert([{
        user_id: userId,
        topic_id: topicId,
        type,
        title,
        url,
        content
      }])
      .select()
      .single();
    if (error) throw error;
    return data as Resource;
  }

  static async deleteResource(id: string) {
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // STUDY STATS
  static async getStudyStats(userId: string) {
    const { data: topics } = await supabase
      .from('topics')
      .select('completed, revision_count')
      .eq('user_id', userId);

    if (!topics) return { completed: 0, total: 0, revisions: 0 };

    const completed = topics.filter(t => t.completed).length;
    const total = topics.length;
    const revisions = topics.reduce((sum, t) => sum + (t.revision_count || 0), 0);

    return {
      completed,
      total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      revisions
    };
  }
}

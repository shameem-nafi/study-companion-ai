import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { DeveloperCredit } from '@/components/DeveloperCredit';
import { AIChatbot, AIChatbotHandle } from '@/components/AIChatbot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, Loader } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { StudyService, Task } from '@/services/studyService';

const Dashboard: React.FC = () => {
  const chatbotRef = React.useRef<AIChatbotHandle>(null);
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadTasks();
    }
  }, [user?.id]);

  const loadTasks = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await StudyService.getTasks(user.id);
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChatbot = () => {
    chatbotRef.current?.open();
  };

  const addTask = async () => {
    if (!newTask.trim() || !user?.id) return;

    try {
      setSaving(true);
      const task = await StudyService.createTask(
        user.id,
        newTask,
        subject || 'General',
        priority
      );
      setTasks([task, ...tasks]);
      setNewTask('');
      setSubject('');
      setPriority('medium');
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    try {
      await StudyService.toggleTaskCompletion(id, !completed);
      setTasks(tasks.map(task =>
        task.id === id ? { ...task, completed: !completed } : task
      ));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await StudyService.deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-700 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'low':
        return 'bg-green-500/20 text-green-700 dark:text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
    }
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <Sidebar currentPage="dashboard" onToggleChatbot={handleToggleChatbot} />
      <main className="lg:ml-64 min-h-screen pt-20 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Study To-Do List</h1>
            <p className="text-muted-foreground">Manage your study tasks and track progress</p>
          </div>

          {/* Add Task Form */}
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Task description"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  disabled={saving}
                />
                <Input
                  placeholder="Subject (optional)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={saving}
                />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  disabled={saving}
                  className="px-3 py-2 border rounded-md bg-background text-foreground disabled:opacity-50"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <Button onClick={addTask} disabled={saving || !newTask.trim()} className="w-full md:w-auto">
                {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                {saving ? 'Adding...' : 'Add Task'}
              </Button>
            </div>
          </Card>

          {loading ? (
            <Card className="p-8 text-center">
              <div className="flex items-center justify-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                <p className="text-muted-foreground">Loading tasks...</p>
              </div>
            </Card>
          ) : (
            <>
              {/* Active Tasks */}
              {activeTasks.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Active Tasks ({activeTasks.length})</h2>
                  <div className="space-y-3">
                    {activeTasks.map(task => (
                      <Card key={task.id} className="p-4">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(task.id, task.completed)}
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{task.title}</h3>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">{task.subject}</Badge>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Completed Tasks ({completedTasks.length})</h2>
                  <div className="space-y-3">
                    {completedTasks.map(task => (
                      <Card key={task.id} className="p-4 opacity-60">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(task.id, task.completed)}
                          />
                          <div className="flex-1">
                            <h3 className="font-medium line-through">{task.title}</h3>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">{task.subject}</Badge>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {tasks.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground text-lg">No tasks yet. Add your first task to get started!</p>
                </Card>
              )}
            </>
          )}

          <DeveloperCredit />
        </div>
      </main>
      <AIChatbot ref={chatbotRef} />
    </div>
  );
};

export default Dashboard;

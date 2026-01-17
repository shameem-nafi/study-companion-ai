import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  BookOpen,
  FileText,
  CheckCircle2,
  RefreshCw,
  Plus,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit3,
  Loader2,
  Circle,
  Calendar,
  Tag,
  TrendingUp,
  Link as LinkIcon,
  FileUp,
  StickyNote,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Department {
  id: string;
  name: string;
  courses?: Course[];
}

interface Course {
  id: string;
  name: string;
  code: string | null;
  department_id: string;
  topics?: Topic[];
}

interface Topic {
  id: string;
  name: string;
  description: string | null;
  completed: boolean;
  completed_at: string | null;
  revision_count: number;
  last_revision_at: string | null;
  tags: string[] | null;
  course_id: string;
  resources?: Resource[];
}

interface Resource {
  id: string;
  title: string | null;
  type: string;
  url: string | null;
  content: string | null;
  topic_id: string;
}

interface Stats {
  totalDepartments: number;
  totalCourses: number;
  totalTopics: number;
  completedTopics: number;
  pendingRevisions: number;
}

export const UnifiedDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalDepartments: 0,
    totalCourses: 0,
    totalTopics: 0,
    completedTopics: 0,
    pendingRevisions: 0,
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  // Dialog states
  const [deptDialog, setDeptDialog] = useState(false);
  const [courseDialog, setCourseDialog] = useState(false);
  const [topicDialog, setTopicDialog] = useState(false);
  const [resourceDialog, setResourceDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ type: string; id: string; name: string } | null>(null);

  // Form states
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [deptsRes, coursesRes, topicsRes, resourcesRes] = await Promise.all([
        supabase.from('departments').select('*').order('created_at', { ascending: false }),
        supabase.from('courses').select('*').order('created_at', { ascending: false }),
        supabase.from('topics').select('*').order('created_at', { ascending: false }),
        supabase.from('resources').select('*'),
      ]);

      const depts = deptsRes.data || [];
      const courses = coursesRes.data || [];
      const topics = topicsRes.data || [];
      const resources = resourcesRes.data || [];

      // Build hierarchical structure
      const topicsWithResources = topics.map((topic) => ({
        ...topic,
        resources: resources.filter((r) => r.topic_id === topic.id),
      }));

      const coursesWithTopics = courses.map((course) => ({
        ...course,
        topics: topicsWithResources.filter((t) => t.course_id === course.id),
      }));

      const deptsWithCourses = depts.map((dept) => ({
        ...dept,
        courses: coursesWithTopics.filter((c) => c.department_id === dept.id),
      }));

      setDepartments(deptsWithCourses);

      // Calculate stats
      const completedTopics = topics.filter((t) => t.completed).length;
      const now = new Date();
      const pendingRevisions = topics.filter((t) => {
        if (!t.completed) return false;
        if (!t.last_revision_at) return true;
        const lastRevision = new Date(t.last_revision_at);
        const daysSince = Math.floor((now.getTime() - lastRevision.getTime()) / (1000 * 60 * 60 * 24));
        const revisionDays = [3, 7, 21, 60];
        const nextDay = revisionDays[Math.min(t.revision_count || 0, revisionDays.length - 1)];
        return daysSince >= nextDay;
      }).length;

      setStats({
        totalDepartments: depts.length,
        totalCourses: courses.length,
        totalTopics: topics.length,
        completedTopics,
        pendingRevisions,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleDept = (id: string) => {
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCourse = (id: string) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTopic = (id: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // CRUD operations
  const saveDepartment = async () => {
    if (!formData.name?.trim()) {
      toast({ title: t('common.error'), description: t('errors.required'), variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editingItem) {
        await supabase.from('departments').update({ name: formData.name }).eq('id', editingItem.id);
      } else {
        await supabase.from('departments').insert({ name: formData.name, user_id: user?.id });
      }
      toast({ title: t('common.success'), description: editingItem ? 'Department updated!' : 'Department created!' });
      setDeptDialog(false);
      setEditingItem(null);
      setFormData({});
      fetchData();
    } catch (error) {
      toast({ title: t('common.error'), description: t('errors.saveFailed'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const saveCourse = async () => {
    if (!formData.name?.trim() || !selectedDept) {
      toast({ title: t('common.error'), description: t('errors.required'), variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editingItem) {
        await supabase.from('courses').update({ name: formData.name, code: formData.code || null }).eq('id', editingItem.id);
      } else {
        await supabase.from('courses').insert({
          name: formData.name,
          code: formData.code || null,
          department_id: selectedDept,
          user_id: user?.id,
        });
      }
      toast({ title: t('common.success'), description: editingItem ? 'Course updated!' : 'Course created!' });
      setCourseDialog(false);
      setEditingItem(null);
      setFormData({});
      setSelectedDept('');
      fetchData();
    } catch (error) {
      toast({ title: t('common.error'), description: t('errors.saveFailed'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const saveTopic = async () => {
    if (!formData.name?.trim() || !selectedCourse) {
      toast({ title: t('common.error'), description: t('errors.required'), variant: 'destructive' });
      return;
    }
    setSaving(true);
    const tagsArray = formData.tags?.split(',').map((t: string) => t.trim()).filter((t: string) => t) || [];
    try {
      if (editingItem) {
        await supabase.from('topics').update({
          name: formData.name,
          description: formData.description || null,
          tags: tagsArray,
        }).eq('id', editingItem.id);
      } else {
        await supabase.from('topics').insert({
          name: formData.name,
          description: formData.description || null,
          tags: tagsArray,
          course_id: selectedCourse,
          user_id: user?.id,
        });
      }
      toast({ title: t('common.success'), description: editingItem ? 'Topic updated!' : 'Topic created!' });
      setTopicDialog(false);
      setEditingItem(null);
      setFormData({});
      setSelectedCourse('');
      fetchData();
    } catch (error) {
      toast({ title: t('common.error'), description: t('errors.saveFailed'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const saveResource = async () => {
    if (!formData.type || !selectedTopic) {
      toast({ title: t('common.error'), description: t('errors.required'), variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editingItem) {
        await supabase.from('resources').update({
          title: formData.title || null,
          type: formData.type,
          url: formData.url || null,
          content: formData.content || null,
        }).eq('id', editingItem.id);
      } else {
        await supabase.from('resources').insert({
          title: formData.title || null,
          type: formData.type,
          url: formData.url || null,
          content: formData.content || null,
          topic_id: selectedTopic,
          user_id: user?.id,
        });
      }
      toast({ title: t('common.success'), description: editingItem ? 'Resource updated!' : 'Resource created!' });
      setResourceDialog(false);
      setEditingItem(null);
      setFormData({});
      setSelectedTopic('');
      fetchData();
    } catch (error) {
      toast({ title: t('common.error'), description: t('errors.saveFailed'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      await supabase.from(deleteDialog.type === 'department' ? 'departments' : deleteDialog.type === 'course' ? 'courses' : deleteDialog.type === 'topic' ? 'topics' : 'resources').delete().eq('id', deleteDialog.id);
      toast({ title: t('common.success'), description: `${deleteDialog.type} deleted!` });
      setDeleteDialog(null);
      fetchData();
    } catch (error) {
      toast({ title: t('common.error'), description: t('errors.deleteFailed'), variant: 'destructive' });
    }
  };

  const toggleComplete = async (topic: Topic) => {
    try {
      await supabase.from('topics').update({
        completed: !topic.completed,
        completed_at: !topic.completed ? new Date().toISOString() : null,
      }).eq('id', topic.id);
      fetchData();
    } catch (error) {
      toast({ title: t('common.error'), description: t('errors.saveFailed'), variant: 'destructive' });
    }
  };

  const handleRevision = async (topic: Topic) => {
    try {
      await supabase.from('topics').update({
        revision_count: (topic.revision_count || 0) + 1,
        last_revision_at: new Date().toISOString(),
      }).eq('id', topic.id);
      toast({ title: t('common.success'), description: 'Revision recorded!' });
      fetchData();
    } catch (error) {
      toast({ title: t('common.error'), description: t('errors.saveFailed'), variant: 'destructive' });
    }
  };

  const setRevisionCount = async (topic: Topic, count: number) => {
    try {
      await supabase.from('topics').update({
        revision_count: count,
        last_revision_at: new Date().toISOString(),
      }).eq('id', topic.id);
      fetchData();
    } catch (error) {
      toast({ title: t('common.error'), description: t('errors.saveFailed'), variant: 'destructive' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const progressPercentage = stats.totalTopics > 0 ? Math.round((stats.completedTopics / stats.totalTopics) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome & Progress */}
      <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {t('dashboard.welcome')}, {profile?.full_name || 'Student'}! 👋
            </h1>
            <p className="text-muted-foreground">{t('dashboard.title')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-3xl font-bold">{progressPercentage}%</p>
              <p className="text-xs text-muted-foreground">{t('dashboard.overallProgress')}</p>
            </div>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-3" />
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: t('departments.title'), value: stats.totalDepartments, icon: Building2, color: 'from-purple-500 to-violet-500' },
          { label: t('courses.title'), value: stats.totalCourses, icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
          { label: t('topics.title'), value: stats.totalTopics, icon: FileText, color: 'from-emerald-500 to-green-500' },
          { label: t('dashboard.topicsCompleted'), value: stats.completedTopics, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
          { label: t('dashboard.pendingRevisions'), value: stats.pendingRevisions, icon: RefreshCw, color: 'from-orange-500 to-amber-500' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02 }}
            className="glass-card p-4 rounded-xl"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
        <Button onClick={() => { setDeptDialog(true); setFormData({}); setEditingItem(null); }} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('departments.add')}
        </Button>
        <Button
          variant="outline"
          onClick={() => { setCourseDialog(true); setFormData({}); setEditingItem(null); }}
          disabled={departments.length === 0}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('courses.add')}
        </Button>
        <Button
          variant="outline"
          onClick={() => { setTopicDialog(true); setFormData({}); setEditingItem(null); }}
          disabled={departments.flatMap(d => d.courses || []).length === 0}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('topics.add')}
        </Button>
      </motion.div>

      {/* Hierarchical Content */}
      {departments.length === 0 ? (
        <motion.div variants={itemVariants} className="glass-card p-12 rounded-2xl text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('departments.empty')}</h3>
          <p className="text-muted-foreground mb-6">{t('departments.emptySubtitle')}</p>
          <Button onClick={() => setDeptDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            {t('departments.add')}
          </Button>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-4">
          {departments.map((dept) => (
            <Collapsible key={dept.id} open={expandedDepts.has(dept.id)} onOpenChange={() => toggleDept(dept.id)}>
              <motion.div layout className="glass-card rounded-2xl overflow-hidden">
                <CollapsibleTrigger asChild>
                  <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{dept.name}</h3>
                        <p className="text-xs text-muted-foreground">{dept.courses?.length || 0} {t('departments.courses')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingItem(dept); setFormData({ name: dept.name }); setDeptDialog(true); }}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteDialog({ type: 'department', id: dept.id, name: dept.name }); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {expandedDepts.has(dept.id) ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-4 pb-4 pl-8 space-y-3">
                    {dept.courses?.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">{t('courses.empty')}</p>
                    ) : (
                      dept.courses?.map((course) => {
                        const topicCount = course.topics?.length || 0;
                        const completedCount = course.topics?.filter((t) => t.completed).length || 0;
                        const progress = topicCount > 0 ? Math.round((completedCount / topicCount) * 100) : 0;

                        return (
                          <Collapsible key={course.id} open={expandedCourses.has(course.id)} onOpenChange={() => toggleCourse(course.id)}>
                            <div className="glass-card rounded-xl overflow-hidden">
                              <CollapsibleTrigger asChild>
                                <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                      <BookOpen className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium">{course.name}</h4>
                                      <div className="flex items-center gap-2">
                                        {course.code && <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{course.code}</span>}
                                        <span className="text-xs text-muted-foreground">{topicCount} {t('courses.topics')} • {progress}%</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditingItem(course); setFormData({ name: course.name, code: course.code }); setSelectedDept(course.department_id); setCourseDialog(true); }}>
                                      <Edit3 className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteDialog({ type: 'course', id: course.id, name: course.name }); }}>
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                    {expandedCourses.has(course.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  </div>
                                </div>
                              </CollapsibleTrigger>

                              <CollapsibleContent>
                                <div className="px-3 pb-3 pl-6 space-y-2">
                                  {course.topics?.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-2">{t('topics.empty')}</p>
                                  ) : (
                                    course.topics?.map((topic) => (
                                      <Collapsible key={topic.id} open={expandedTopics.has(topic.id)} onOpenChange={() => toggleTopic(topic.id)}>
                                        <div className={`rounded-lg border ${topic.completed ? 'border-l-4 border-l-green-500' : ''}`}>
                                          <div className="p-3 flex items-start gap-3">
                                            <motion.button
                                              whileTap={{ scale: 0.9 }}
                                              onClick={() => toggleComplete(topic)}
                                              className="mt-0.5"
                                            >
                                              {topic.completed ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                              ) : (
                                                <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                                              )}
                                            </motion.button>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                  <h5 className={`font-medium ${topic.completed ? 'line-through text-muted-foreground' : ''}`}>
                                                    {topic.name}
                                                  </h5>
                                                  {topic.description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-1">{topic.description}</p>
                                                  )}
                                                </div>
                                                <CollapsibleTrigger asChild>
                                                  <Button variant="ghost" size="sm">
                                                    {expandedTopics.has(topic.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                  </Button>
                                                </CollapsibleTrigger>
                                              </div>

                                              {/* Tags & Stats */}
                                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                                {topic.tags?.map((tag) => (
                                                  <Badge key={tag} variant="secondary" className="text-xs">
                                                    <Tag className="w-2.5 h-2.5 mr-1" />
                                                    {tag}
                                                  </Badge>
                                                ))}
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                  <RefreshCw className="w-3 h-3" />
                                                  {topic.revision_count || 0}
                                                </span>
                                                {topic.last_revision_at && (
                                                  <span className="text-xs text-muted-foreground">
                                                    Last: {format(new Date(topic.last_revision_at), 'MMM d')}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          <CollapsibleContent>
                                            <div className="px-3 pb-3 border-t pt-3 space-y-3">
                                              {/* Revision Controls */}
                                              <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs text-muted-foreground">Revision:</span>
                                                <Select
                                                  value={String(topic.revision_count || 0)}
                                                  onValueChange={(v) => setRevisionCount(topic, parseInt(v))}
                                                >
                                                  <SelectTrigger className="w-20 h-7 text-xs">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                                {topic.completed && (
                                                  <Button variant="outline" size="sm" onClick={() => handleRevision(topic)} className="gap-1 h-7 text-xs">
                                                    <RefreshCw className="w-3 h-3" />
                                                    {t('topics.revise')}
                                                  </Button>
                                                )}
                                                <Button variant="ghost" size="sm" onClick={() => { setEditingItem(topic); setFormData({ name: topic.name, description: topic.description, tags: topic.tags?.join(', ') }); setSelectedCourse(topic.course_id); setTopicDialog(true); }} className="h-7 text-xs">
                                                  <Edit3 className="w-3 h-3 mr-1" />
                                                  Edit
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-destructive h-7 text-xs" onClick={() => setDeleteDialog({ type: 'topic', id: topic.id, name: topic.name })}>
                                                  <Trash2 className="w-3 h-3 mr-1" />
                                                  Delete
                                                </Button>
                                              </div>

                                              {/* Resources */}
                                              <div>
                                                <div className="flex items-center justify-between mb-2">
                                                  <span className="text-xs font-medium">{t('topics.resources')}</span>
                                                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => { setSelectedTopic(topic.id); setFormData({ type: 'link' }); setEditingItem(null); setResourceDialog(true); }}>
                                                    <Plus className="w-3 h-3 mr-1" />
                                                    Add
                                                  </Button>
                                                </div>
                                                {topic.resources?.length === 0 ? (
                                                  <p className="text-xs text-muted-foreground">{t('resources.empty')}</p>
                                                ) : (
                                                  <div className="space-y-1">
                                                    {topic.resources?.map((resource) => (
                                                      <div key={resource.id} className="flex items-center justify-between p-2 rounded bg-muted/50 text-xs group">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                          {resource.type === 'pdf' && <FileUp className="w-3 h-3 text-red-500" />}
                                                          {resource.type === 'link' && <LinkIcon className="w-3 h-3 text-blue-500" />}
                                                          {resource.type === 'note' && <StickyNote className="w-3 h-3 text-yellow-500" />}
                                                          <span className="truncate">{resource.title || resource.url || 'Untitled'}</span>
                                                          {resource.url && (
                                                            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                              <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                          )}
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => { setSelectedTopic(topic.id); setEditingItem(resource); setFormData({ title: resource.title, type: resource.type, url: resource.url, content: resource.content }); setResourceDialog(true); }}>
                                                            <Edit3 className="w-2.5 h-2.5" />
                                                          </Button>
                                                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-destructive" onClick={() => setDeleteDialog({ type: 'resources', id: resource.id, name: resource.title || 'Resource' })}>
                                                            <Trash2 className="w-2.5 h-2.5" />
                                                          </Button>
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </CollapsibleContent>
                                        </div>
                                      </Collapsible>
                                    ))
                                  )}
                                  <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={() => { setSelectedCourse(course.id); setFormData({}); setEditingItem(null); setTopicDialog(true); }}>
                                    <Plus className="w-3 h-3 mr-2" />
                                    {t('topics.add')}
                                  </Button>
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        );
                      })
                    )}
                    <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={() => { setSelectedDept(dept.id); setFormData({}); setEditingItem(null); setCourseDialog(true); }}>
                      <Plus className="w-3 h-3 mr-2" />
                      {t('courses.add')}
                    </Button>
                  </div>
                </CollapsibleContent>
              </motion.div>
            </Collapsible>
          ))}
        </motion.div>
      )}

      {/* Department Dialog */}
      <Dialog open={deptDialog} onOpenChange={setDeptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? t('departments.edit') : t('departments.add')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{t('departments.name')}</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('departments.namePlaceholder')}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeptDialog(false)}>{t('common.cancel')}</Button>
              <Button onClick={saveDepartment} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('common.save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Course Dialog */}
      <Dialog open={courseDialog} onOpenChange={setCourseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? t('courses.edit') : t('courses.add')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {!editingItem && (
              <div className="space-y-2">
                <Label>{t('departments.title')}</Label>
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>{t('courses.name')}</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('courses.namePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('courses.code')} <span className="text-muted-foreground">({t('courses.optional')})</span></Label>
              <Input
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder={t('courses.codePlaceholder')}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCourseDialog(false)}>{t('common.cancel')}</Button>
              <Button onClick={saveCourse} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('common.save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Topic Dialog */}
      <Dialog open={topicDialog} onOpenChange={setTopicDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? t('topics.edit') : t('topics.add')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {!editingItem && (
              <div className="space-y-2">
                <Label>{t('courses.title')}</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.flatMap((d) =>
                      (d.courses || []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{d.name} → {c.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>{t('topics.name')}</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('topics.namePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('topics.description')}</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('topics.descriptionPlaceholder')}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('topics.tags')} (comma separated)</Label>
              <Input
                value={formData.tags || ''}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Important, Exam, Quick Revision"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setTopicDialog(false)}>{t('common.cancel')}</Button>
              <Button onClick={saveTopic} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('common.save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resource Dialog */}
      <Dialog open={resourceDialog} onOpenChange={setResourceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? t('resources.edit') : t('resources.add')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{t('resources.type')}</Label>
              <Select value={formData.type || 'link'} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">{t('resources.link')}</SelectItem>
                  <SelectItem value="pdf">{t('resources.pdf')}</SelectItem>
                  <SelectItem value="note">{t('resources.note')}</SelectItem>
                  <SelectItem value="youtube">{t('resources.youtube')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title ({t('courses.optional')})</Label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Resource title"
              />
            </div>
            {(formData.type === 'link' || formData.type === 'pdf' || formData.type === 'youtube') && (
              <div className="space-y-2">
                <Label>{t('resources.url')}</Label>
                <Input
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder={t('resources.urlPlaceholder')}
                />
              </div>
            )}
            {formData.type === 'note' && (
              <div className="space-y-2">
                <Label>{t('resources.content')}</Label>
                <Textarea
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={t('resources.contentPlaceholder')}
                  rows={5}
                />
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setResourceDialog(false)}>{t('common.cancel')}</Button>
              <Button onClick={saveResource} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('common.save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.delete')} {deleteDialog?.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

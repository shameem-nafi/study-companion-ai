import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  BookOpen,
  FileText,
  CheckCircle2,
  RefreshCw,
  Plus,
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
  Search,
  X,
  ChevronRight,
  FolderPlus,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';

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

interface SearchResult {
  type: 'course' | 'topic';
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  courseId?: string;
  courseName?: string;
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
  
  // Selection states for hierarchical navigation
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Dialog states
  const [deptDialog, setDeptDialog] = useState(false);
  const [courseDialog, setCourseDialog] = useState(false);
  const [topicDialog, setTopicDialog] = useState(false);
  const [resourceDialog, setResourceDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ type: string; id: string; name: string } | null>(null);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

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

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    departments.forEach((dept) => {
      dept.courses?.forEach((course) => {
        if (course.name.toLowerCase().includes(query) || course.code?.toLowerCase().includes(query)) {
          results.push({
            type: 'course',
            id: course.id,
            name: course.name,
            departmentId: dept.id,
            departmentName: dept.name,
          });
        }
        course.topics?.forEach((topic) => {
          if (topic.name.toLowerCase().includes(query) || topic.description?.toLowerCase().includes(query)) {
            results.push({
              type: 'topic',
              id: topic.id,
              name: topic.name,
              departmentId: dept.id,
              departmentName: dept.name,
              courseId: course.id,
              courseName: course.name,
            });
          }
        });
      });
    });

    setSearchResults(results.slice(0, 10));
    setShowSearchResults(true);
  }, [searchQuery, departments]);

  const handleSearchSelect = (result: SearchResult) => {
    setSelectedDeptId(result.departmentId);
    if (result.type === 'course') {
      setSelectedCourseId(result.id);
      setSelectedTopicId(null);
    } else {
      setSelectedCourseId(result.courseId!);
      setSelectedTopicId(result.id);
    }
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // Get selected items
  const selectedDepartment = useMemo(() => 
    departments.find(d => d.id === selectedDeptId), 
    [departments, selectedDeptId]
  );
  
  const selectedCourseData = useMemo(() => 
    selectedDepartment?.courses?.find(c => c.id === selectedCourseId),
    [selectedDepartment, selectedCourseId]
  );

  const selectedTopicData = useMemo(() =>
    selectedCourseData?.topics?.find(t => t.id === selectedTopicId),
    [selectedCourseData, selectedTopicId]
  );

  // Get revision info text
  const getRevisionInfo = (topic: Topic) => {
    const revisionDays = [3, 7, 21, 60];
    const currentRevision = topic.revision_count || 0;
    const remainingRevisions = Math.max(0, 4 - currentRevision);
    
    if (!topic.completed) {
      return { status: 'pending', text: 'Not yet completed' };
    }
    
    if (currentRevision === 0) {
      return { status: 'pending', text: 'No revisions yet' };
    }

    if (currentRevision >= 4) {
      return { status: 'complete', text: 'All revisions complete!' };
    }

    let nextRevisionText = '';
    if (topic.last_revision_at) {
      const lastRevision = new Date(topic.last_revision_at);
      const nextRevisionDays = revisionDays[currentRevision];
      const nextRevisionDate = new Date(lastRevision);
      nextRevisionDate.setDate(nextRevisionDate.getDate() + nextRevisionDays);
      const daysUntil = differenceInDays(nextRevisionDate, new Date());
      
      if (daysUntil <= 0) {
        nextRevisionText = ` • Revision due!`;
      } else {
        nextRevisionText = ` • Next in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`;
      }
    }

    return { 
      status: 'progress', 
      text: `Revised ${currentRevision} time${currentRevision > 1 ? 's' : ''} • ${remainingRevisions} remaining${nextRevisionText}`
    };
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
      
      // Reset selection if deleted item was selected
      if (deleteDialog.type === 'department' && deleteDialog.id === selectedDeptId) {
        setSelectedDeptId(null);
        setSelectedCourseId(null);
        setSelectedTopicId(null);
      } else if (deleteDialog.type === 'course' && deleteDialog.id === selectedCourseId) {
        setSelectedCourseId(null);
        setSelectedTopicId(null);
      } else if (deleteDialog.type === 'topic' && deleteDialog.id === selectedTopicId) {
        setSelectedTopicId(null);
      }
      
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

  const progressPercentage = stats.totalTopics > 0 ? Math.round((stats.completedTopics / stats.totalTopics) * 100) : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 pb-32 lg:pb-24">
      {/* Global Search Bar - Sticky on Mobile */}
      <motion.div variants={itemVariants} className="relative lg:static">
        <div className="glass-card rounded-2xl p-4 lg:rounded-2xl sticky top-16 lg:top-auto z-30 lg:z-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.search') + ' courses or topics...'}
              className="pl-12 pr-10 h-12 text-base border-0 bg-muted/50 rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showSearchResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute left-0 right-0 top-full mt-2 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
              >
                <ScrollArea className="max-h-80">
                  {searchResults.map((result, idx) => (
                    <motion.button
                      key={`${result.type}-${result.id}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      whileHover={{ x: 4 }}
                      onClick={() => handleSearchSelect(result)}
                      className="w-full p-4 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Building2 className="w-3 h-3" />
                        <span>{result.departmentName}</span>
                        {result.courseName && (
                          <>
                            <ChevronRight className="w-3 h-3" />
                            <BookOpen className="w-3 h-3" />
                            <span>{result.courseName}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {result.type === 'course' ? (
                          <BookOpen className="w-4 h-4 text-primary" />
                        ) : (
                          <FileText className="w-4 h-4 text-primary" />
                        )}
                        <span className="font-medium">{result.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {result.type}
                        </Badge>
                      </div>
                    </motion.button>
                  ))}
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

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

      {/* Stats Grid - 2x3 on mobile, 5 columns on desktop */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3">
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

      {/* Section-Based Content Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Departments Section */}
        <motion.div variants={itemVariants} className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-gradient-to-r from-purple-500/10 to-violet-500/10">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-500" />
              <h2 className="font-semibold">{t('departments.title')}</h2>
            </div>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-3 space-y-2">
              {departments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">{t('departments.empty')}</p>
                </div>
              ) : (
                departments.map((dept) => (
                  <motion.div
                    key={dept.id}
                    layout
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={() => {
                      setSelectedDeptId(dept.id);
                      setSelectedCourseId(null);
                      setSelectedTopicId(null);
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      selectedDeptId === dept.id
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-muted/50 hover:bg-muted border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{dept.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {dept.courses?.length || 0} {t('departments.courses')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem(dept);
                            setFormData({ name: dept.name });
                            setDeptDialog(true);
                          }}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteDialog({ type: 'department', id: dept.id, name: dept.name });
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </motion.div>

        {/* Courses Section */}
        <motion.div variants={itemVariants} className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <h2 className="font-semibold">{t('courses.title')}</h2>
              {selectedDepartment && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {selectedDepartment.name}
                </Badge>
              )}
            </div>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-3 space-y-2">
              {!selectedDeptId ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Select a department to view courses</p>
                </div>
              ) : selectedDepartment?.courses?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">{t('courses.empty')}</p>
                </div>
              ) : (
                selectedDepartment?.courses?.map((course) => {
                  const topicCount = course.topics?.length || 0;
                  const completedCount = course.topics?.filter((t) => t.completed).length || 0;
                  const progress = topicCount > 0 ? Math.round((completedCount / topicCount) * 100) : 0;

                  return (
                    <motion.div
                      key={course.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setSelectedTopicId(null);
                      }}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        selectedCourseId === course.id
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'bg-muted/50 hover:bg-muted border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{course.name}</p>
                            {course.code && (
                              <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                                {course.code}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingItem(course);
                              setFormData({ name: course.name, code: course.code });
                              setSelectedDept(course.department_id);
                              setCourseDialog(true);
                            }}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteDialog({ type: 'course', id: course.id, name: course.name });
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{topicCount} {t('courses.topics')}</span>
                        <span>•</span>
                        <span>{progress}% complete</span>
                      </div>
                      <Progress value={progress} className="h-1.5 mt-2" />
                    </motion.div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </motion.div>

        {/* Topics Section */}
        <motion.div variants={itemVariants} className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-gradient-to-r from-emerald-500/10 to-green-500/10">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              <h2 className="font-semibold">{t('topics.title')}</h2>
              {selectedCourseData && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {selectedCourseData.name}
                </Badge>
              )}
            </div>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-3 space-y-2">
              {!selectedCourseId ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Select a course to view topics</p>
                </div>
              ) : selectedCourseData?.topics?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">{t('topics.empty')}</p>
                </div>
              ) : (
                selectedCourseData?.topics?.map((topic) => {
                  const revisionInfo = getRevisionInfo(topic);

                  return (
                    <motion.div
                      key={topic.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedTopicId(topic.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        selectedTopicId === topic.id
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'bg-muted/50 hover:bg-muted border-2 border-transparent'
                      } ${topic.completed ? 'border-l-4 border-l-green-500' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleComplete(topic);
                          }}
                          className="mt-0.5"
                        >
                          {topic.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                          )}
                        </motion.button>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${topic.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {topic.name}
                          </p>
                          {topic.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {topic.description}
                            </p>
                          )}
                          
                          {/* Revision Info as Text */}
                          <div className={`flex items-center gap-1.5 mt-2 text-xs ${
                            revisionInfo.status === 'complete' ? 'text-green-600' :
                            revisionInfo.status === 'progress' ? 'text-blue-600' :
                            'text-muted-foreground'
                          }`}>
                            <RefreshCw className="w-3 h-3" />
                            <span>{revisionInfo.text}</span>
                          </div>

                          {/* Tags */}
                          {topic.tags && topic.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {topic.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs py-0 px-1.5">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingItem(topic);
                              setFormData({
                                name: topic.name,
                                description: topic.description,
                                tags: topic.tags?.join(', '),
                              });
                              setSelectedCourse(topic.course_id);
                              setTopicDialog(true);
                            }}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteDialog({ type: 'topic', id: topic.id, name: topic.name });
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </motion.div>
      </div>

      {/* Selected Topic Details */}
      <AnimatePresence>
        {selectedTopicData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Building2 className="w-4 h-4" />
                  <span>{selectedDepartment?.name}</span>
                  <ChevronRight className="w-4 h-4" />
                  <BookOpen className="w-4 h-4" />
                  <span>{selectedCourseData?.name}</span>
                </div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  {selectedTopicData.completed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {selectedTopicData.name}
                </h3>
                {selectedTopicData.description && (
                  <p className="text-muted-foreground mt-1">{selectedTopicData.description}</p>
                )}
              </div>
              {selectedTopicData.completed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevision(selectedTopicData)}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Mark Revised
                </Button>
              )}
            </div>

            {/* Revision Info Card */}
            <div className="bg-muted/50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium">Revision Status</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {getRevisionInfo(selectedTopicData).text}
              </p>
              {selectedTopicData.last_revision_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last revised: {format(new Date(selectedTopicData.last_revision_at), 'PPP')}
                </p>
              )}
              {selectedTopicData.completed_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  Completed: {format(new Date(selectedTopicData.completed_at), 'PPP')}
                </p>
              )}
            </div>

            {/* Resources */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  {t('topics.resources')}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTopic(selectedTopicData.id);
                    setFormData({ type: 'link' });
                    setEditingItem(null);
                    setResourceDialog(true);
                  }}
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Resource
                </Button>
              </div>
              {selectedTopicData.resources?.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('resources.empty')}</p>
              ) : (
                <div className="grid gap-2">
                  {selectedTopicData.resources?.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 group"
                    >
                      <div className="flex items-center gap-3">
                        {resource.type === 'pdf' && <FileUp className="w-4 h-4 text-red-500" />}
                        {resource.type === 'link' && <LinkIcon className="w-4 h-4 text-blue-500" />}
                        {resource.type === 'note' && <StickyNote className="w-4 h-4 text-yellow-500" />}
                        {resource.type === 'youtube' && <ExternalLink className="w-4 h-4 text-red-500" />}
                        <span className="text-sm">{resource.title || resource.url || 'Untitled'}</span>
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setSelectedTopic(selectedTopicData.id);
                            setEditingItem(resource);
                            setFormData({
                              title: resource.title,
                              type: resource.type,
                              url: resource.url,
                              content: resource.content,
                            });
                            setResourceDialog(true);
                          }}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => setDeleteDialog({ type: 'resources', id: resource.id, name: resource.title || 'Resource' })}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating bottom-right actions removed */}

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

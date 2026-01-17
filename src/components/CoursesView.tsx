import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Trash2,
  Edit3,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useToast } from '@/hooks/use-toast';
import { TopicsView } from './TopicsView';

interface Course {
  id: string;
  name: string;
  code: string | null;
  created_at: string;
  topicCount?: number;
  completedCount?: number;
}

interface CoursesViewProps {
  department: { id: string; name: string };
  onBack: () => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({ department, onBack }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const fetchCourses = async () => {
    try {
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select('*')
        .eq('department_id', department.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get topic counts
      const { data: topics } = await supabase
        .from('topics')
        .select('course_id, completed');

      const topicStats = (topics || []).reduce((acc, t) => {
        if (!acc[t.course_id]) {
          acc[t.course_id] = { total: 0, completed: 0 };
        }
        acc[t.course_id].total++;
        if (t.completed) acc[t.course_id].completed++;
        return acc;
      }, {} as Record<string, { total: number; completed: number }>);

      setCourses(
        (coursesData || []).map((c) => ({
          ...c,
          topicCount: topicStats[c.id]?.total || 0,
          completedCount: topicStats[c.id]?.completed || 0,
        }))
      );
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [department.id]);

  const handleSave = async () => {
    if (!newName.trim()) {
      toast({
        title: t('common.error'),
        description: t('errors.required'),
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      if (editingCourse) {
        const { error } = await supabase
          .from('courses')
          .update({ name: newName, code: newCode || null })
          .eq('id', editingCourse.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('courses')
          .insert({
            name: newName,
            code: newCode || null,
            department_id: department.id,
            user_id: user?.id,
          });

        if (error) throw error;
      }

      toast({
        title: t('common.success'),
        description: editingCourse ? 'Course updated!' : 'Course created!',
      });

      setDialogOpen(false);
      setEditingCourse(null);
      setNewName('');
      setNewCode('');
      fetchCourses();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('errors.saveFailed'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', deletingCourse.id);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: 'Course deleted!',
      });

      setDeletingCourse(null);
      fetchCourses();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('errors.deleteFailed'),
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setNewName(course.name);
    setNewCode(course.code || '');
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingCourse(null);
    setNewName('');
    setNewCode('');
    setDialogOpen(true);
  };

  if (selectedCourse) {
    return (
      <TopicsView
        course={selectedCourse}
        department={department}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{department.name}</h1>
            <p className="text-muted-foreground">{courses.length} {t('departments.courses')}</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              {t('courses.add')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? t('courses.edit') : t('courses.add')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('courses.name')}</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('courses.namePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {t('courses.code')} <span className="text-muted-foreground">({t('courses.optional')})</span>
                </Label>
                <Input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder={t('courses.codePlaceholder')}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t('common.save')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && courses.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="glass-card p-12 rounded-2xl text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('courses.empty')}</h3>
          <p className="text-muted-foreground mb-6">{t('courses.emptySubtitle')}</p>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            {t('courses.add')}
          </Button>
        </motion.div>
      )}

      {/* Course Grid */}
      <AnimatePresence mode="popLayout">
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => {
            const progress = course.topicCount
              ? Math.round((course.completedCount! / course.topicCount) * 100)
              : 0;

            return (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                className="glass-card p-6 rounded-2xl cursor-pointer group"
                onClick={() => setSelectedCourse(course)}
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(course);
                      }}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingCourse(course);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold mt-4 text-lg">{course.name}</h3>
                {course.code && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted/50 inline-block px-2 py-0.5 rounded">
                    {course.code}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {course.topicCount} {t('courses.topics')}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>{t('courses.progress')}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                <div className="flex items-center text-primary text-sm mt-4 font-medium">
                  View topics
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCourse} onOpenChange={() => setDeletingCourse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('courses.delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this course? All topics and resources will be deleted.
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

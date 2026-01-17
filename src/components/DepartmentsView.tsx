import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Building2,
  ChevronRight,
  Trash2,
  Edit3,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { CoursesView } from './CoursesView';

interface Department {
  id: string;
  name: string;
  created_at: string;
  courseCount?: number;
}

export const DepartmentsView: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const fetchDepartments = async () => {
    try {
      const { data: depts, error } = await supabase
        .from('departments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get course counts
      const { data: courses } = await supabase
        .from('courses')
        .select('department_id');

      const courseCounts = (courses || []).reduce((acc, c) => {
        acc[c.department_id] = (acc[c.department_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setDepartments(
        (depts || []).map((d) => ({
          ...d,
          courseCount: courseCounts[d.id] || 0,
        }))
      );
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

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
      if (editingDepartment) {
        const { error } = await supabase
          .from('departments')
          .update({ name: newName })
          .eq('id', editingDepartment.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('departments')
          .insert({ name: newName, user_id: user?.id });

        if (error) throw error;
      }

      toast({
        title: t('common.success'),
        description: editingDepartment ? 'Department updated!' : 'Department created!',
      });

      setDialogOpen(false);
      setEditingDepartment(null);
      setNewName('');
      fetchDepartments();
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
    if (!deletingDepartment) return;

    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', deletingDepartment.id);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: 'Department deleted!',
      });

      setDeletingDepartment(null);
      fetchDepartments();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('errors.deleteFailed'),
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (dept: Department) => {
    setEditingDepartment(dept);
    setNewName(dept.name);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingDepartment(null);
    setNewName('');
    setDialogOpen(true);
  };

  if (selectedDepartment) {
    return (
      <CoursesView
        department={selectedDepartment}
        onBack={() => setSelectedDepartment(null)}
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
        <div>
          <h1 className="text-3xl font-bold">{t('departments.title')}</h1>
          <p className="text-muted-foreground">{departments.length} departments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              {t('departments.add')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDepartment ? t('departments.edit') : t('departments.add')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('departments.name')}</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('departments.namePlaceholder')}
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
      {!loading && departments.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="glass-card p-12 rounded-2xl text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('departments.empty')}</h3>
          <p className="text-muted-foreground mb-6">{t('departments.emptySubtitle')}</p>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            {t('departments.add')}
          </Button>
        </motion.div>
      )}

      {/* Department Grid */}
      <AnimatePresence mode="popLayout">
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <motion.div
              key={dept.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              className="glass-card p-6 rounded-2xl cursor-pointer group"
              onClick={() => setSelectedDepartment(dept)}
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(dept);
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
                      setDeletingDepartment(dept);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold mt-4 text-lg">{dept.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {dept.courseCount} {t('departments.courses')}
              </p>
              <div className="flex items-center text-primary text-sm mt-4 font-medium">
                View courses
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingDepartment} onOpenChange={() => setDeletingDepartment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('departments.delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('departments.confirmDelete')}
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

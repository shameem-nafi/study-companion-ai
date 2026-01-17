import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  ArrowLeft,
  FileText,
  Trash2,
  Edit3,
  Loader2,
  CheckCircle2,
  Circle,
  RefreshCw,
  Calendar,
  Tag,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import { format } from 'date-fns';

interface Topic {
  id: string;
  name: string;
  description: string | null;
  completed: boolean;
  completed_at: string | null;
  revision_count: number;
  last_revision_at: string | null;
  tags: string[];
  created_at: string;
}

interface TopicsViewProps {
  course: { id: string; name: string };
  department: { id: string; name: string };
  onBack: () => void;
}

export const TopicsView: React.FC<TopicsViewProps> = ({ course, department, onBack }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<Topic | null>(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('course_id', course.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [course.id]);

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

    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);

    try {
      if (editingTopic) {
        const { error } = await supabase
          .from('topics')
          .update({
            name: newName,
            description: newDescription || null,
            tags: tagsArray,
          })
          .eq('id', editingTopic.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('topics')
          .insert({
            name: newName,
            description: newDescription || null,
            tags: tagsArray,
            course_id: course.id,
            user_id: user?.id,
          });

        if (error) throw error;
      }

      toast({
        title: t('common.success'),
        description: editingTopic ? 'Topic updated!' : 'Topic created!',
      });

      setDialogOpen(false);
      setEditingTopic(null);
      setNewName('');
      setNewDescription('');
      setNewTags('');
      fetchTopics();
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
    if (!deletingTopic) return;

    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', deletingTopic.id);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: 'Topic deleted!',
      });

      setDeletingTopic(null);
      fetchTopics();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('errors.deleteFailed'),
        variant: 'destructive',
      });
    }
  };

  const toggleComplete = async (topic: Topic) => {
    const newCompleted = !topic.completed;
    
    try {
      const { error } = await supabase
        .from('topics')
        .update({
          completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null,
        })
        .eq('id', topic.id);

      if (error) throw error;
      fetchTopics();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('errors.saveFailed'),
        variant: 'destructive',
      });
    }
  };

  const handleRevision = async (topic: Topic) => {
    try {
      const { error } = await supabase
        .from('topics')
        .update({
          revision_count: topic.revision_count + 1,
          last_revision_at: new Date().toISOString(),
        })
        .eq('id', topic.id);

      if (error) throw error;
      
      toast({
        title: t('common.success'),
        description: 'Revision recorded!',
      });
      
      fetchTopics();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('errors.saveFailed'),
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (topic: Topic) => {
    setEditingTopic(topic);
    setNewName(topic.name);
    setNewDescription(topic.description || '');
    setNewTags(topic.tags?.join(', ') || '');
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingTopic(null);
    setNewName('');
    setNewDescription('');
    setNewTags('');
    setDialogOpen(true);
  };

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
            <p className="text-sm text-muted-foreground">{department.name}</p>
            <h1 className="text-3xl font-bold">{course.name}</h1>
            <p className="text-muted-foreground">{topics.length} {t('courses.topics')}</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              {t('topics.add')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTopic ? t('topics.edit') : t('topics.add')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('topics.name')}</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('topics.namePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('topics.description')}</Label>
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder={t('topics.descriptionPlaceholder')}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('topics.tags')} (comma separated)</Label>
                <Input
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Important, Exam, Quick Revision"
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
      {!loading && topics.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="glass-card p-12 rounded-2xl text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('topics.empty')}</h3>
          <p className="text-muted-foreground mb-6">{t('topics.emptySubtitle')}</p>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            {t('topics.add')}
          </Button>
        </motion.div>
      )}

      {/* Topics List */}
      <AnimatePresence mode="popLayout">
        <motion.div variants={itemVariants} className="space-y-3">
          {topics.map((topic) => (
            <motion.div
              key={topic.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`glass-card p-4 rounded-xl group ${
                topic.completed ? 'border-l-4 border-l-green-500' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleComplete(topic)}
                  className="mt-1"
                >
                  {topic.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </motion.button>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold ${topic.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {topic.name}
                  </h3>
                  {topic.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {topic.description}
                    </p>
                  )}
                  
                  {/* Tags */}
                  {topic.tags && topic.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {topic.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Status info */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                    {topic.completed && topic.completed_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {t('topics.completedOn')}: {format(new Date(topic.completed_at), 'MMM d, yyyy')}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      {t('topics.revisionCount')}: {topic.revision_count}
                    </span>
                    {topic.last_revision_at && (
                      <span>
                        {t('topics.lastRevision')}: {format(new Date(topic.last_revision_at), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {topic.completed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevision(topic)}
                      className="gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {t('topics.revise')}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(topic)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeletingTopic(topic)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingTopic} onOpenChange={() => setDeletingTopic(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('topics.delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this topic?
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

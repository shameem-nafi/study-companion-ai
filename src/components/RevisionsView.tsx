import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Calendar,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';

interface TopicWithCourse {
  id: string;
  name: string;
  completed: boolean;
  completed_at: string | null;
  revision_count: number;
  last_revision_at: string | null;
  course: { name: string; department: { name: string } };
}

export const RevisionsView: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [topics, setTopics] = useState<TopicWithCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select(`
          id,
          name,
          completed,
          completed_at,
          revision_count,
          last_revision_at,
          courses!inner(
            name,
            departments!inner(name)
          )
        `)
        .eq('completed', true)
        .order('last_revision_at', { ascending: true, nullsFirst: true });

      if (error) throw error;

      const formattedTopics = (data || []).map((t: any) => ({
        ...t,
        course: {
          name: t.courses.name,
          department: { name: t.courses.departments.name },
        },
      }));

      setTopics(formattedTopics);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleRevision = async (topic: TopicWithCourse) => {
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

  const getRevisionStatus = (topic: TopicWithCourse) => {
    if (!topic.last_revision_at) {
      return { status: 'overdue', label: t('revisions.overdue'), color: 'destructive' };
    }

    const daysSince = differenceInDays(new Date(), new Date(topic.last_revision_at));
    const revisionDays = [3, 7, 21, 60];
    const nextRevisionDay = revisionDays[Math.min(topic.revision_count, revisionDays.length - 1)];
    const daysUntilDue = nextRevisionDay - daysSince;

    if (daysUntilDue <= 0) {
      return { status: 'overdue', label: t('revisions.overdue'), color: 'destructive' };
    } else if (daysUntilDue <= 1) {
      return { status: 'dueToday', label: t('revisions.dueToday'), color: 'warning' };
    } else {
      return { status: 'upcoming', label: `${daysUntilDue} days`, color: 'secondary' };
    }
  };

  const pendingTopics = topics.filter((t) => {
    const status = getRevisionStatus(t);
    return status.status === 'overdue' || status.status === 'dueToday';
  });

  const upcomingTopics = topics.filter((t) => {
    const status = getRevisionStatus(t);
    return status.status === 'upcoming';
  });

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
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold">{t('revisions.title')}</h1>
        <p className="text-muted-foreground">
          Track your spaced repetition progress
        </p>
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
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('revisions.noRevisions')}</h3>
          <p className="text-muted-foreground">{t('revisions.allCaughtUp')}</p>
        </motion.div>
      )}

      {/* Pending Revisions */}
      {pendingTopics.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-semibold">{t('revisions.pending')}</h2>
            <Badge variant="destructive">{pendingTopics.length}</Badge>
          </div>
          <div className="space-y-3">
            {pendingTopics.map((topic) => {
              const status = getRevisionStatus(topic);
              return (
                <motion.div
                  key={topic.id}
                  whileHover={{ scale: 1.01 }}
                  className="glass-card p-4 rounded-xl border-l-4 border-l-orange-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{topic.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {topic.course.department.name} → {topic.course.name}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          {topic.revision_count} revisions
                        </span>
                        {topic.last_revision_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Last: {format(new Date(topic.last_revision_at), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={status.color as any}>{status.label}</Badge>
                      <Button size="sm" onClick={() => handleRevision(topic)} className="gap-1">
                        <RefreshCw className="w-4 h-4" />
                        {t('topics.revise')}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Upcoming Revisions */}
      {upcomingTopics.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold">{t('revisions.upcoming')}</h2>
            <Badge variant="secondary">{upcomingTopics.length}</Badge>
          </div>
          <div className="space-y-3">
            {upcomingTopics.map((topic) => {
              const status = getRevisionStatus(topic);
              return (
                <motion.div
                  key={topic.id}
                  whileHover={{ scale: 1.01 }}
                  className="glass-card p-4 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{topic.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {topic.course.department.name} → {topic.course.name}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          {topic.revision_count} revisions
                        </span>
                        {topic.last_revision_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Last: {format(new Date(topic.last_revision_at), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">Due in {status.label}</Badge>
                      <Button variant="outline" size="sm" onClick={() => handleRevision(topic)} className="gap-1">
                        <RefreshCw className="w-4 h-4" />
                        {t('topics.revise')}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

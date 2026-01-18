import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  CheckCircle2,
  RefreshCw,
  GraduationCap,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface DashboardStats {
  totalCourses: number;
  totalTopics: number;
  completedTopics: number;
  pendingRevisions: number;
}

interface DashboardViewProps {
  onNavigate: (page: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalTopics: 0,
    completedTopics: 0,
    pendingRevisions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [coursesRes, topicsRes] = await Promise.all([
          supabase.from('courses').select('id', { count: 'exact' }),
          supabase.from('topics').select('id, completed, revision_count, last_revision_at'),
        ]);

        const topics = topicsRes.data || [];
        const completedTopics = topics.filter((t) => t.completed).length;
        
        // Calculate pending revisions (topics completed but need revision)
        const now = new Date();
        const pendingRevisions = topics.filter((t) => {
          if (!t.completed) return false;
          if (!t.last_revision_at) return true;
          const lastRevision = new Date(t.last_revision_at);
          const daysSince = Math.floor((now.getTime() - lastRevision.getTime()) / (1000 * 60 * 60 * 24));
          // Spaced repetition: 3, 7, 21 days
          const revisionDays = [3, 7, 21, 60];
          const nextRevisionDay = revisionDays[Math.min(t.revision_count || 0, revisionDays.length - 1)];
          return daysSince >= nextRevisionDay;
        }).length;

        setStats({
          totalCourses: coursesRes.count || 0,
          totalTopics: topics.length,
          completedTopics,
          pendingRevisions,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const progressPercentage = stats.totalTopics > 0 
    ? Math.round((stats.completedTopics / stats.totalTopics) * 100) 
    : 0;

  const statCards = [
    {
      label: t('dashboard.topicsCompleted'),
      value: `${stats.completedTopics}/${stats.totalTopics}`,
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: t('dashboard.pendingRevisions'),
      value: stats.pendingRevisions,
      icon: RefreshCw,
      color: 'from-orange-500 to-amber-500',
    },
    {
      label: t('dashboard.totalCourses'),
      value: stats.totalCourses,
      icon: GraduationCap,
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {t('dashboard.welcome')}, {profile?.full_name || 'Student'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('dashboard.title')}
          </p>
        </div>
        <Button onClick={() => onNavigate('departments')} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('dashboard.addDepartment')}
        </Button>
      </motion.div>

      {/* Overall Progress */}
      <motion.div
        variants={itemVariants}
        className="glass-card p-6 rounded-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">{t('dashboard.overallProgress')}</h3>
              <p className="text-sm text-muted-foreground">
                {stats.completedTopics} of {stats.totalTopics} topics completed
              </p>
            </div>
          </div>
          <span className="text-3xl font-bold">{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-3" />
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1, type: 'spring', damping: 25, stiffness: 300 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card p-6 rounded-2xl cursor-pointer"
          >
            <motion.div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}
              whileHover={{ rotate: 12, scale: 1.1 }}
            >
              <stat.icon className="w-6 h-6 text-white" />
            </motion.div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl">
        <h3 className="font-semibold mb-4">{t('dashboard.quickActions')}</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => onNavigate('departments')} className="gap-2">
            <BookOpen className="w-4 h-4" />
            {t('dashboard.addDepartment')}
          </Button>
          <Button variant="outline" onClick={() => onNavigate('revisions')} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {t('dashboard.viewRevisions')}
          </Button>
        </div>
      </motion.div>

      {/* Empty State */}
      {stats.totalTopics === 0 && !loading && (
        <motion.div
          variants={itemVariants}
          className="glass-card p-12 rounded-2xl text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('dashboard.noActivity')}</h3>
          <p className="text-muted-foreground mb-6">{t('dashboard.getStarted')}</p>
          <Button onClick={() => onNavigate('departments')} className="gap-2">
            <Plus className="w-4 h-4" />
            {t('departments.add')}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

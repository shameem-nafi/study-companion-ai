import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw,
  BookOpen,
  Clock,
  Zap,
  Target,
  TrendingUp,
  Download,
  Share2,
  Plus,
  Search,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Sidebar } from '@/components/Sidebar';

const Revisions: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const chatbotRef = React.useRef<AIChatbotHandle>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const handleToggleChatbot = () => {
    chatbotRef.current?.open();
  };

  const handleNavigate = (page: string) => {
    if (page === 'dashboard') navigate('/dashboard');
    else if (page === 'departments') navigate('/departments');
    else if (page === 'revisions') navigate('/revisions');
  };

  const revisions = [
    {
      id: 1,
      title: 'Python Data Types & Variables',
      subject: 'Python Programming',
      lastRevised: '2 days ago',
      nextReview: 'Today',
      priority: 'high',
      topics: ['Variables', 'Data Types', 'Type Conversion'],
      completionRate: 85,
      type: 'notes'
    },
    {
      id: 2,
      title: 'Web Development Fundamentals',
      subject: 'Web Development',
      lastRevised: '5 days ago',
      nextReview: '1 day left',
      priority: 'medium',
      topics: ['HTML', 'CSS', 'JavaScript'],
      completionRate: 60,
      type: 'flashcard'
    },
    {
      id: 3,
      title: 'Database Concepts & Design',
      subject: 'Database Design',
      lastRevised: '1 week ago',
      nextReview: '3 days left',
      priority: 'medium',
      topics: ['SQL', 'Normalization', 'Relationships'],
      completionRate: 70,
      type: 'quiz'
    },
    {
      id: 4,
      title: 'Machine Learning Algorithms',
      subject: 'Machine Learning',
      lastRevised: '3 days ago',
      nextReview: 'Today',
      priority: 'high',
      topics: ['Supervised Learning', 'Clustering', 'Neural Networks'],
      completionRate: 55,
      type: 'notes'
    },
    {
      id: 5,
      title: 'Cloud Computing Essentials',
      subject: 'AWS',
      lastRevised: '1 day ago',
      nextReview: '2 days left',
      priority: 'low',
      topics: ['EC2', 'S3', 'Lambda'],
      completionRate: 90,
      type: 'flashcard'
    },
    {
      id: 6,
      title: 'Advanced OOP Concepts',
      subject: 'Object-Oriented Programming',
      lastRevised: '4 days ago',
      nextReview: 'Tomorrow',
      priority: 'high',
      topics: ['Design Patterns', 'SOLID Principles', 'Polymorphism'],
      completionRate: 75,
      type: 'quiz'
    }
  ];

  const filteredRevisions = revisions.filter(revision => {
    const matchesSearch = revision.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         revision.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || revision.type === selectedType;
    return matchesSearch && matchesType;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'notes': return '📝';
      case 'flashcard': return '🎴';
      case 'quiz': return '📊';
      default: return '📖';
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <Sidebar currentPage="revisions" onNavigate={handleNavigate} onToggleChatbot={handleToggleChatbot} />

      <main className="lg:ml-64 min-h-screen pt-20 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Page Header */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-4xl font-bold mb-3 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              <RefreshCw className="w-10 h-10 text-purple-600" />
              {t('revisions.title')}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              Organize and revise your study materials using spaced repetition
            </motion.p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            className="grid md:grid-cols-4 gap-6 mb-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[
              { icon: Target, label: 'To Review Today', value: '3', color: 'from-red-500 to-pink-600' },
              { icon: TrendingUp, label: 'Completion Rate', value: '74%', color: 'from-green-500 to-emerald-600' },
              { icon: BookOpen, label: 'Total Materials', value: '24', color: 'from-blue-500 to-cyan-600' },
              { icon: Zap, label: 'Study Streak', value: '7 days', color: 'from-purple-500 to-indigo-600' }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`p-6 rounded-2xl ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/50 border-white/50'} border`}
              >
                <motion.div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}
                  whileHover={{ rotate: 12, scale: 1.1 }}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </motion.div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  {stat.label}
                </p>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Search and Filters */}
          <motion.div 
            className="mb-8 space-y-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex gap-4 flex-wrap items-center">
              <div className={`flex-1 min-w-[250px] relative rounded-2xl overflow-hidden shadow-lg ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                <Input
                  placeholder="Search revisions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-12 py-3 text-lg border-0 focus:ring-2 focus:ring-purple-500 ${
                    isDark 
                      ? 'bg-slate-800 text-white placeholder-gray-400' 
                      : 'bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all gap-2"
              >
                <Plus className="w-5 h-5" />
                New Revision
              </Button>
            </div>

            {/* Type Filter */}
            <div className="flex gap-3 flex-wrap">
              {['all', 'notes', 'flashcard', 'quiz'].map(type => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
                    selectedType === type
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : isDark 
                        ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'all' ? 'All Types' : type}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Revisions List */}
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredRevisions.map((revision) => (
              <motion.div
                key={revision.id}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className={`group p-6 rounded-2xl backdrop-blur-xl border shadow-lg hover:shadow-xl transition-all ${
                  isDark
                    ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'
                    : 'bg-white/50 border-white/50 hover:bg-white/80'
                }`}
              >
                <div className="flex gap-6 items-start">
                  {/* Type Icon */}
                  <div className={`text-4xl flex-shrink-0`}>
                    {getTypeIcon(revision.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3 flex-wrap">
                      <h3 className={`text-xl font-bold flex-1 min-w-0 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {revision.title}
                      </h3>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${getPriorityColor(revision.priority)}`}>
                        {revision.priority.toUpperCase()}
                      </span>
                    </div>

                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {revision.subject}
                    </p>

                    {/* Topics */}
                    <div className="flex gap-2 flex-wrap mb-4">
                      {revision.topics.map((topic) => (
                        <span 
                          key={topic}
                          className={`text-xs px-3 py-1 rounded-lg ${
                            isDark 
                              ? 'bg-slate-700 text-gray-300' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Progress
                        </span>
                        <span className={`text-xs font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                          {revision.completionRate}%
                        </span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${revision.completionRate}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex gap-6 mb-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Last revised: {revision.lastRevised}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Next review: {revision.nextReview}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-3 rounded-lg transition-all ${
                        isDark ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
                      }`}
                    >
                      <RefreshCw className="w-5 h-5 text-blue-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-3 rounded-lg transition-all ${
                        isDark ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
                      }`}
                    >
                      <Download className="w-5 h-5 text-green-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-3 rounded-lg transition-all ${
                        isDark ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
                      }`}
                    >
                      <Share2 className="w-5 h-5 text-purple-600" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* No Results */}
          {filteredRevisions.length === 0 && (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <RefreshCw className={`w-16 h-16 mx-auto mb-4 opacity-50 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No revisions found matching your search
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <AIChatbot ref={chatbotRef} />
    </div>
  );
};

export default Revisions;

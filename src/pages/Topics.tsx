import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  User,
  MessageCircle,
  ThumbsUp,
  Share2,
  Download,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Sidebar } from '@/components/Sidebar';

const Topics: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { isDark } = useTheme();
  
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const handleToggleChatbot = () => {
    // Chatbot removed
  };

  const handleNavigate = (page: string) => {
    if (page === 'dashboard') navigate('/dashboard');
    else if (page === 'departments') navigate('/departments');
    else if (page === 'revisions') navigate('/revisions');
  };

  const courseNames: Record<string, string> = {
    '1': 'Introduction to Python',
    '2': 'Data Structures & Algorithms',
    '3': 'Web Development Bootcamp',
    '4': 'Database Design',
    '5': 'Machine Learning Basics',
    '6': 'Cloud Computing with AWS'
  };

  const topics = [
    {
      id: 1,
      title: 'Python Basics & Syntax',
      duration: '4 hours',
      lessons: [
        { id: 11, title: 'Introduction & Setup', duration: '25 min', type: 'video' },
        { id: 12, title: 'Variables and Data Types', duration: '35 min', type: 'video' },
        { id: 13, title: 'Operators & Expressions', duration: '30 min', type: 'video' },
        { id: 14, title: 'Python Basics Quiz', duration: '20 min', type: 'quiz' }
      ]
    },
    {
      id: 2,
      title: 'Control Flow & Functions',
      duration: '5 hours',
      lessons: [
        { id: 21, title: 'If-Else Statements', duration: '28 min', type: 'video' },
        { id: 22, title: 'Loops (For & While)', duration: '40 min', type: 'video' },
        { id: 23, title: 'Function Definitions', duration: '35 min', type: 'video' },
        { id: 24, title: 'Lambda & Map/Filter', duration: '30 min', type: 'video' },
        { id: 25, title: 'Control Flow Quiz', duration: '25 min', type: 'quiz' }
      ]
    },
    {
      id: 3,
      title: 'Data Structures',
      duration: '6 hours',
      lessons: [
        { id: 31, title: 'Lists & Tuples', duration: '38 min', type: 'video' },
        { id: 32, title: 'Dictionaries & Sets', duration: '35 min', type: 'video' },
        { id: 33, title: 'List Comprehension', duration: '25 min', type: 'video' },
        { id: 34, title: 'Data Structures Assignment', duration: '60 min', type: 'assignment' }
      ]
    },
    {
      id: 4,
      title: 'Object-Oriented Programming',
      duration: '7 hours',
      lessons: [
        { id: 41, title: 'Classes & Objects', duration: '45 min', type: 'video' },
        { id: 42, title: 'Inheritance & Polymorphism', duration: '40 min', type: 'video' },
        { id: 43, title: 'Encapsulation', duration: '30 min', type: 'video' },
        { id: 44, title: 'OOP Project', duration: '90 min', type: 'project' }
      ]
    },
    {
      id: 5,
      title: 'File Handling & Modules',
      duration: '4 hours',
      lessons: [
        { id: 51, title: 'Reading & Writing Files', duration: '32 min', type: 'video' },
        { id: 52, title: 'CSV & JSON Handling', duration: '38 min', type: 'video' },
        { id: 53, title: 'Importing Modules', duration: '25 min', type: 'video' },
        { id: 54, title: 'File Handling Practice', duration: '45 min', type: 'assignment' }
      ]
    }
  ];

  const getLessonIcon = (type: string) => {
    switch(type) {
      case 'video': return '🎥';
      case 'quiz': return '📝';
      case 'assignment': return '✏️';
      case 'project': return '🚀';
      default: return '📖';
    }
  };

  const toggleComplete = (lessonId: number) => {
    setCompletedLessons(prev => 
      prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    }
  };

  const totalLessons = topics.reduce((sum, topic) => sum + topic.lessons.length, 0);
  const progress = Math.round((completedLessons.length / totalLessons) * 100);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <Sidebar currentPage="dashboard" onNavigate={handleNavigate} onToggleChatbot={handleToggleChatbot} />

      <main className="lg:ml-64 min-h-screen pt-20 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.button
              whileHover={{ x: -4 }}
              onClick={() => navigate('/departments')}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </motion.button>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              {courseNames[courseId || '1']}
            </motion.h1>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-12 p-6 rounded-2xl ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/50 border-white/50'} border`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Your Progress
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {completedLessons.length} of {totalLessons} lessons completed
                </p>
              </div>
              <div className={`text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent`}>
                {progress}%
              </div>
            </div>
            <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </motion.div>

          {/* Topics */}
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {topics.map((topic, topicIdx) => (
              <motion.div
                key={topic.id}
                variants={itemVariants}
                className={`rounded-2xl overflow-hidden shadow-lg transition-all ${
                  isDark
                    ? 'bg-slate-800/50 border-slate-700/50'
                    : 'bg-white/50 border-white/50'
                } border`}
              >
                {/* Topic Header */}
                <motion.button
                  onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                  className={`w-full p-6 flex items-center justify-between hover:opacity-80 transition-opacity ${
                    expandedTopic === topic.id && (isDark ? 'bg-slate-700/50' : 'bg-white/80')
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <motion.div
                      animate={{ rotate: expandedTopic === topic.id ? 180 : 0 }}
                      className={`w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0`}
                    >
                      <BookOpen className="w-4 h-4 text-white" />
                    </motion.div>
                    <div className="text-left">
                      <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {topic.title}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {topic.lessons.length} lessons • {topic.duration}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold px-4 py-2 rounded-lg ${
                    isDark ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-900'
                  }`}>
                    {topic.lessons.filter(l => completedLessons.includes(l.id)).length}/{topic.lessons.length}
                  </span>
                </motion.button>

                {/* Lessons */}
                <AnimatePresence>
                  {expandedTopic === topic.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                      className={`border-t ${isDark ? 'border-slate-700/50' : 'border-white/50'}`}
                    >
                      {topic.lessons.map((lesson, lessonIdx) => (
                        <motion.div
                          key={lesson.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: lessonIdx * 0.05 }}
                          className={`p-6 flex items-center gap-4 border-b last:border-b-0 ${
                            isDark ? 'border-slate-700/50 hover:bg-slate-700/30' : 'border-white/50 hover:bg-white/50'
                          } transition-colors group`}
                        >
                          {/* Complete Button */}
                          <motion.button
                            onClick={() => toggleComplete(lesson.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex-shrink-0"
                          >
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                              completedLessons.includes(lesson.id)
                                ? 'bg-green-500 border-green-600'
                                : isDark ? 'border-gray-600 hover:border-purple-500' : 'border-gray-300 hover:border-purple-500'
                            }`}>
                              {completedLessons.includes(lesson.id) && (
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              )}
                            </div>
                          </motion.button>

                          {/* Lesson Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-xl">{getLessonIcon(lesson.type)}</span>
                              <h4 className={`font-bold ${completedLessons.includes(lesson.id) ? 'line-through opacity-60' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {lesson.title}
                              </h4>
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {lesson.duration}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-3 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                              isDark ? 'hover:bg-slate-600' : 'hover:bg-gray-200'
                            }`}
                          >
                            <Play className="w-5 h-5 text-purple-600" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          {progress === 100 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-12 p-8 rounded-2xl text-center ${isDark ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-700/50' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'} border`}
            >
              <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                🎉 Course Completed!
              </h3>
              <p className={isDark ? 'text-green-300' : 'text-green-600'}>
                Congratulations! You've completed all lessons. Download your certificate.
              </p>
              <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold">
                Download Certificate
              </Button>
            </motion.div>
          )}
        </div>
      </main>

    </div>
  );
};

export default Topics;
export default Topics;

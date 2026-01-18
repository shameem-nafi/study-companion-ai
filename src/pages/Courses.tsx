import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Search, 
  ArrowLeft,
  BookOpen,
  Clock,
  Star,
  Users,
  X,
  Filter,
  Zap
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Sidebar } from '@/components/Sidebar';
import { AIChatbot, AIChatbotHandle } from '@/components/AIChatbot';

const Courses: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { departmentId } = useParams();
  const { isDark } = useTheme();
  const chatbotRef = React.useRef<AIChatbotHandle>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const handleToggleChatbot = () => {
    chatbotRef.current?.open();
  };

  const departmentNames: Record<string, string> = {
    '1': 'Computer Science',
    '2': 'Mathematics',
    '3': 'Physics',
    '4': 'Chemistry',
    '5': 'Biology',
    '6': 'English Literature'
  };

  const courses = [
    {
      id: 1,
      title: 'Introduction to Python',
      description: 'Learn Python fundamentals and start your programming journey',
      duration: '8 weeks',
      level: 'Beginner',
      students: 2500,
      rating: 4.8,
      lessons: 48,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 2,
      title: 'Data Structures & Algorithms',
      description: 'Master essential DSA concepts for coding interviews',
      duration: '12 weeks',
      level: 'Intermediate',
      students: 1800,
      rating: 4.9,
      lessons: 72,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 3,
      title: 'Web Development Bootcamp',
      description: 'Complete guide to building modern web applications',
      duration: '16 weeks',
      level: 'Intermediate',
      students: 3200,
      rating: 4.7,
      lessons: 96,
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 4,
      title: 'Database Design',
      description: 'Learn SQL and database optimization techniques',
      duration: '6 weeks',
      level: 'Beginner',
      students: 1200,
      rating: 4.6,
      lessons: 36,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 5,
      title: 'Machine Learning Basics',
      description: 'Introduction to ML algorithms and practical applications',
      duration: '10 weeks',
      level: 'Advanced',
      students: 1500,
      rating: 4.9,
      lessons: 60,
      color: 'from-red-500 to-rose-600'
    },
    {
      id: 6,
      title: 'Cloud Computing with AWS',
      description: 'Deploy and manage applications on AWS platform',
      duration: '8 weeks',
      level: 'Intermediate',
      students: 900,
      rating: 4.8,
      lessons: 48,
      color: 'from-indigo-500 to-blue-600'
    }
  ];

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'popular') return b.students - a.students;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return b.id - a.id;
    return 0;
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

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <Sidebar currentPage="departments" onNavigate={() => {}} onToggleChatbot={handleToggleChatbot} />

      <main className="lg:ml-64 min-h-screen pt-20 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.button
              whileHover={{ x: -4 }}
              onClick={() => navigate('/departments')}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Departments
            </motion.button>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              {departmentNames[departmentId || '1']}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              {courses.length} courses available to master your skills
            </motion.p>
          </motion.div>

          {/* Search and Sort */}
          <motion.div 
            className="mb-8 space-y-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex gap-4 flex-wrap">
              <div className={`flex-1 min-w-[250px] relative rounded-2xl overflow-hidden shadow-lg ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-12 py-3 text-lg border-0 focus:ring-2 focus:ring-purple-500 ${
                    isDark 
                      ? 'bg-slate-800 text-white placeholder-gray-400' 
                      : 'bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-4 py-3 rounded-xl font-semibold border ${
                  isDark
                    ? 'bg-slate-800 text-white border-slate-700'
                    : 'bg-white text-gray-900 border-gray-200'
                }`}
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </motion.div>

          {/* Courses Grid */}
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                onClick={() => navigate(`/topics/${course.id}`)}
                className={`group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all backdrop-blur-xl border h-full flex flex-col ${
                  isDark
                    ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'
                    : 'bg-white/50 border-white/50 hover:bg-white/80'
                }`}
              >
                {/* Header Image */}
                <div className={`h-32 bg-gradient-to-br ${course.color} relative overflow-hidden`}>
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ scale: 0.8, rotate: -45 }}
                    whileHover={{ scale: 1.2, rotate: 0 }}
                  >
                    <Zap className="w-16 h-16 text-white/20" />
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Level Badge */}
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      course.level === 'Beginner' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : course.level === 'Intermediate'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {course.level}
                    </span>
                    <motion.div 
                      className="flex items-center gap-1"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {course.rating}
                      </span>
                    </motion.div>
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'} flex-1`}>
                    {course.description}
                  </p>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200/20">
                    <div className="flex items-center gap-2">
                      <Clock className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {course.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {course.students}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {course.lessons} lessons
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button 
                    className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                    onClick={() => navigate(`/topics/${course.id}`)}
                  >
                    View Topics
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* No Results */}
          {filteredCourses.length === 0 && (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No courses found matching "{searchQuery}"
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <AIChatbot ref={chatbotRef} />
    </div>
  );
};

export default Courses;

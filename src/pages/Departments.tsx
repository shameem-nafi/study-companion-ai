import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Building2, 
  Users, 
  BookOpen,
  Zap,
  ArrowRight,
  Filter,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Sidebar } from '@/components/Sidebar';
import { AIChatbot, AIChatbotHandle } from '@/components/AIChatbot';

const Departments: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { isDark } = useTheme();
  const chatbotRef = React.useRef<AIChatbotHandle>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const handleToggleChatbot = () => {
    chatbotRef.current?.open();
  };

  const departments = [
    {
      id: 1,
      name: 'Computer Science',
      icon: Zap,
      courses: 24,
      students: 1200,
      color: 'from-blue-500 to-cyan-600',
      description: 'Programming, Algorithms, Data Structures, Databases'
    },
    {
      id: 2,
      name: 'Mathematics',
      icon: BookOpen,
      courses: 18,
      students: 950,
      color: 'from-purple-500 to-pink-600',
      description: 'Calculus, Algebra, Geometry, Statistics'
    },
    {
      id: 3,
      name: 'Physics',
      icon: Zap,
      courses: 16,
      students: 850,
      color: 'from-amber-500 to-orange-600',
      description: 'Mechanics, Thermodynamics, Electromagnetism'
    },
    {
      id: 4,
      name: 'Chemistry',
      icon: BookOpen,
      courses: 14,
      students: 720,
      color: 'from-green-500 to-emerald-600',
      description: 'Organic, Inorganic, Physical Chemistry'
    },
    {
      id: 5,
      name: 'Biology',
      icon: Users,
      courses: 12,
      students: 680,
      color: 'from-red-500 to-rose-600',
      description: 'Cell Biology, Genetics, Ecology, Evolution'
    },
    {
      id: 6,
      name: 'English Literature',
      icon: BookOpen,
      courses: 10,
      students: 520,
      color: 'from-indigo-500 to-blue-600',
      description: 'Shakespeare, Poetry, Prose, Modern Literature'
    },
  ];

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          {/* Page Header */}
          <motion.div
            className="mb-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 
              variants={itemVariants}
              className={`text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              {t('departments.title')}
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              Explore and master subjects across multiple disciplines
            </motion.p>
          </motion.div>

          {/* Search and Filter Section */}
          <motion.div 
            className="mb-12 space-y-4"
            variants={itemVariants}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={`relative rounded-2xl overflow-hidden shadow-lg ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
              <Input
                placeholder="Search departments, courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-12 py-3 text-lg border-0 focus:ring-2 focus:ring-purple-500 ${
                  isDark 
                    ? 'bg-slate-800 text-white placeholder-gray-400' 
                    : 'bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Departments Grid */}
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredDepartments.map((dept, idx) => (
              <motion.div
                key={dept.id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/courses/${dept.id}`)}
                className={`group cursor-pointer rounded-2xl p-6 transition-all backdrop-blur-xl border ${
                  isDark
                    ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'
                    : 'bg-white/50 border-white/50 hover:bg-white/80'
                } shadow-lg hover:shadow-2xl`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <motion.div 
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${dept.color} flex items-center justify-center shadow-lg`}
                    whileHover={{ rotate: 12, scale: 1.1 }}
                  >
                    <dept.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <motion.div whileHover={{ rotate: 45 }}>
                    <ArrowRight className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'} group-hover:text-purple-600 transition-colors`} />
                  </motion.div>
                </div>

                {/* Title */}
                <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {dept.name}
                </h3>

                {/* Description */}
                <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {dept.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200/20">
                  <div className="flex items-center gap-2">
                    <BookOpen className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Courses</p>
                      <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{dept.courses}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Students</p>
                      <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{dept.students}</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  onClick={() => navigate(`/courses/${dept.id}`)}
                >
                  Explore Courses <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </motion.div>

          {/* No Results */}
          {filteredDepartments.length === 0 && (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No departments found matching "{searchQuery}"
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <AIChatbot ref={chatbotRef} />
    </div>
  );
};

export default Departments;

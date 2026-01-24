import React, { useState, useEffect } from 'react';
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
  X,
  Plus,
  Trash2,
  Edit2,
  Loader
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Sidebar } from '@/components/Sidebar';

import { AddDepartmentModal } from '@/components/AddDepartmentModal';
import { StudyService, Department } from '@/services/studyService';

const Departments: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { isDark } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingDept, setIsAddingDept] = useState(false);

  // Load departments on component mount
  useEffect(() => {
    loadDepartments();
  }, [user?.id]);

  const loadDepartments = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await StudyService.getDepartments(user.id);
      setDepartments(data);
    } catch (err) {
      console.error('Error loading departments:', err);
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (name: string) => {
    if (!user?.id) return;
    
    try {
      setIsAddingDept(true);
      const newDept = await StudyService.createDepartment(user.id, name);
      setDepartments([newDept, ...departments]);
    } catch (err) {
      console.error('Error adding department:', err);
      setError('Failed to add department');
    } finally {
      setIsAddingDept(false);
    }
  };

  const handleDeleteDepartment = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this department?')) return;
    
    try {
      await StudyService.deleteDepartment(id);
      setDepartments(departments.filter(d => d.id !== id));
    } catch (err) {
      console.error('Error deleting department:', err);
      setError('Failed to delete department');
    }
  };

  const handleToggleChatbot = () => {
    // Chatbot removed
  };

  const handleNavigate = (page: string) => {
    if (page === 'dashboard') navigate('/dashboard');
    else if (page === 'departments') navigate('/departments');
    else if (page === 'revisions') navigate('/revisions');
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  const departmentColors = [
    'from-blue-500 to-cyan-600',
    'from-purple-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-green-500 to-emerald-600',
    'from-red-500 to-rose-600',
    'from-indigo-500 to-blue-600',
  ];

  const getColorForIndex = (index: number) => departmentColors[index % departmentColors.length];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <Sidebar currentPage="departments" onNavigate={handleNavigate} onToggleChatbot={handleToggleChatbot} />

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
              📚 My Departments
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              Organize your studies by creating departments and adding courses
            </motion.p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div 
              className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-600 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {/* Search and Add Button */}
          <motion.div 
            className="mb-12 space-y-4"
            variants={itemVariants}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className={`relative flex-1 rounded-2xl overflow-hidden shadow-lg ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                <Input
                  placeholder="Search departments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-12 py-3 text-lg border-0 focus:ring-2 focus:ring-blue-500 ${
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

              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-xl flex items-center gap-2 h-12"
              >
                <Plus size={20} />
                Add Department
              </Button>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div 
              className="flex flex-col items-center justify-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading your departments...
              </p>
            </motion.div>
          )}

          {/* Departments Grid */}
          {!loading && filteredDepartments.length > 0 && (
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
                  className={`group cursor-pointer rounded-2xl p-6 transition-all backdrop-blur-xl border relative overflow-hidden ${
                    isDark
                      ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'
                      : 'bg-white/50 border-white/50 hover:bg-white/80'
                  } shadow-lg hover:shadow-2xl`}
                >
                  {/* Background Gradient */}
                  <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${getColorForIndex(idx)}`} />

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <motion.div 
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getColorForIndex(idx)} flex items-center justify-center shadow-lg`}
                      whileHover={{ rotate: 12, scale: 1.1 }}
                    >
                      <Building2 className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleDeleteDepartment(dept.id, e)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-600'
                        }`}
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className={`text-2xl font-bold mb-2 relative z-10 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {dept.name}
                  </h3>

                  {/* Created Date */}
                  <p className={`text-sm mb-6 relative z-10 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Created {new Date(dept.created_at).toLocaleDateString()}
                  </p>

                  {/* Action Button */}
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all relative z-10"
                    onClick={() => navigate(`/courses/${dept.id}`)}
                  >
                    View Courses <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && filteredDepartments.length === 0 && departments.length === 0 && (
            <motion.div 
              className={`text-center py-20 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-white/50'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Building2 className={`mx-auto w-16 h-16 mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                No departments yet
              </p>
              <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Start by creating your first department to organize your studies
              </p>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl"
              >
                <Plus size={20} className="mr-2" />
                Create Department
              </Button>
            </motion.div>
          )}

          {/* No Search Results */}
          {!loading && filteredDepartments.length === 0 && departments.length > 0 && (
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

      <AddDepartmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddDepartment}
        isLoading={isAddingDept}
      />

    </div>
  );
};

export default Departments;

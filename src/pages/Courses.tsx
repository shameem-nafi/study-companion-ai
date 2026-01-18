import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Search, 
  ArrowLeft,
  BookOpen,
  X,
  Plus,
  Trash2,
  Loader,
  ArrowRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Sidebar } from '@/components/Sidebar';
import { AIChatbot, AIChatbotHandle } from '@/components/AIChatbot';
import { AddCourseModal } from '@/components/AddCourseModal';
import { StudyService, Department, Course } from '@/services/studyService';

const Courses: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { departmentId } = useParams();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const chatbotRef = React.useRef<AIChatbotHandle>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [department, setDepartment] = useState<Department | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingCourse, setIsAddingCourse] = useState(false);

  useEffect(() => {
    loadCourses();
  }, [departmentId, user?.id]);

  const loadCourses = async () => {
    if (!departmentId || !user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Load department
      const depts = await StudyService.getDepartments(user.id);
      const dept = depts.find(d => d.id === departmentId);
      if (!dept) {
        setError('Department not found');
        setDepartment(null);
        setCourses([]);
        return;
      }
      setDepartment(dept);

      // Load courses
      const coursesData = await StudyService.getCourses(departmentId, user.id);
      setCourses(coursesData);
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (name: string, code?: string) => {
    if (!departmentId || !user?.id) return;

    try {
      setIsAddingCourse(true);
      const newCourse = await StudyService.createCourse(user.id, departmentId, name, code);
      setCourses([newCourse, ...courses]);
    } catch (err) {
      console.error('Error adding course:', err);
      setError('Failed to add course');
    } finally {
      setIsAddingCourse(false);
    }
  };

  const handleDeleteCourse = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await StudyService.deleteCourse(id);
      setCourses(courses.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course');
    }
  };

  const handleToggleChatbot = () => {
    chatbotRef.current?.open();
  };

  const handleNavigate = (page: string) => {
    if (page === 'dashboard') navigate('/dashboard');
    else if (page === 'departments') navigate('/departments');
    else if (page === 'revisions') navigate('/revisions');
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.code && course.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
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

  const courseColors = [
    'from-blue-500 to-cyan-600',
    'from-purple-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-green-500 to-emerald-600',
    'from-red-500 to-rose-600',
    'from-indigo-500 to-blue-600',
  ];

  const getColorForIndex = (index: number) => courseColors[index % courseColors.length];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <Sidebar currentPage="departments" onNavigate={handleNavigate} onToggleChatbot={handleToggleChatbot} />

      <main className="lg:ml-64 min-h-screen pt-20 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Back Button and Header */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => navigate('/departments')}
              className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-slate-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <ArrowLeft size={20} />
              Back to Departments
            </button>

            {error ? (
              <div className={`text-center py-10`}>
                <p className={`text-lg ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
                <Button
                  onClick={() => navigate('/departments')}
                  className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-600"
                >
                  Go Back
                </Button>
              </div>
            ) : (
              <>
                <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  📚 {department?.name || 'Courses'}
                </h1>
                <p className={`text-lg mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage your courses and lessons in this department
                </p>
              </>
            )}
          </motion.div>

          {!error && (
            <>
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
                      placeholder="Search courses..."
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
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl flex items-center gap-2 h-12"
                  >
                    <Plus size={20} />
                    Add Course
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
                  <Loader className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                  <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Loading courses...
                  </p>
                </motion.div>
              )}

              {/* Courses Grid */}
              {!loading && filteredCourses.length > 0 && (
                <motion.div 
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredCourses.map((course, idx) => (
                    <motion.div
                      key={course.id}
                      variants={itemVariants}
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/topics/${course.id}`)}
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
                          <BookOpen className="w-8 h-8 text-white" />
                        </motion.div>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => handleDeleteCourse(course.id, e)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-600'
                          }`}
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>

                      {/* Title */}
                      <h3 className={`text-2xl font-bold mb-2 relative z-10 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {course.name}
                      </h3>

                      {/* Course Code */}
                      {course.code && (
                        <p className={`text-sm font-mono mb-4 relative z-10 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {course.code}
                        </p>
                      )}

                      {/* Created Date */}
                      <p className={`text-sm mb-6 relative z-10 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Created {new Date(course.created_at).toLocaleDateString()}
                      </p>

                      {/* Action Button */}
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all relative z-10"
                        onClick={() => navigate(`/topics/${course.id}`)}
                      >
                        View Topics <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Empty State */}
              {!loading && filteredCourses.length === 0 && courses.length === 0 && (
                <motion.div 
                  className={`text-center py-20 rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-white/50'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <BookOpen className={`mx-auto w-16 h-16 mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    No courses yet
                  </p>
                  <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Create your first course to start organizing your lessons
                  </p>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl"
                  >
                    <Plus size={20} className="mr-2" />
                    Create Course
                  </Button>
                </motion.div>
              )}

              {/* No Search Results */}
              {!loading && filteredCourses.length === 0 && courses.length > 0 && (
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
            </>
          )}
        </div>
      </main>

      <AddCourseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCourse}
        departmentName={department?.name}
        isLoading={isAddingCourse}
      />

      <AIChatbot ref={chatbotRef} />
    </div>
  );
};

export default Courses;

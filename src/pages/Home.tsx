import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Zap, 
  BookOpen, 
  BarChart3, 
  Users, 
  ArrowRight, 
  GraduationCap,
  Globe,
  Moon,
  Sun,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { GlobalSettings } from '@/components/GlobalSettings';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleGetStarted = () => {
    navigate('/departments');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
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

  const features = [
    {
      icon: BookOpen,
      title: 'Comprehensive Learning',
      description: 'Access thousands of study materials organized by departments and courses'
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Monitor your learning progress with detailed analytics and statistics'
    },
    {
      icon: Zap,
      title: 'Smart AI Assistant',
      description: 'Get instant help from our AI chatbot for quick answers and explanations'
    },
    {
      icon: Users,
      title: 'Collaborative Learning',
      description: 'Learn together with peers and share study notes'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-slate-950' : 'bg-gradient-to-b from-blue-50 via-white to-purple-50'
    }`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-colors ${
        isDark 
          ? 'bg-slate-950/80 border-slate-800/50' 
          : 'bg-white/80 border-gray-200/50'
      } backdrop-blur-xl border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg`}>
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('auth.title')}
              </h1>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Master Your Studies
              </p>
            </div>
          </motion.button>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <GlobalSettings />

            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950 gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('auth.logoutButton')}</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <motion.section 
          className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-32"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-6xl mx-auto text-center">
            <motion.h2 
              variants={itemVariants}
              className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Master Your Studies
              </span>
              <br />
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>with Smart Learning</span>
            </motion.h2>

            <motion.p 
              variants={itemVariants}
              className={`text-lg sm:text-xl mb-8 max-w-2xl mx-auto ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Your all-in-one learning platform with organized study materials, AI assistance, and progress tracking
            </motion.p>

            {user && (
              <motion.div variants={itemVariants} className="flex gap-4 justify-center flex-wrap">
                <Button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/departments')}
                  className="px-8 py-6 text-lg font-semibold rounded-xl"
                >
                  Browse Departments
                </Button>
              </motion.div>
            )}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-10 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </motion.section>

        {/* Features Section */}
        <motion.section 
          className={`px-4 sm:px-6 lg:px-8 py-20 ${
            isDark ? 'bg-slate-900/50' : 'bg-white/50'
          }`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              variants={itemVariants}
            >
              <h3 className={`text-3xl sm:text-4xl font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Powerful Features for Success
              </h3>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Everything you need to excel in your studies
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className={`p-8 rounded-2xl backdrop-blur-xl border transition-all ${
                    isDark
                      ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'
                      : 'bg-white/50 border-white/50 hover:bg-white/80'
                  }`}
                >
                  <motion.div 
                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg"
                    whileHover={{ rotate: 12, scale: 1.1 }}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <h4 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {feature.title}
                  </h4>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section 
          className="px-4 sm:px-6 lg:px-8 py-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { number: '10K+', label: 'Study Materials' },
                { number: '5000+', label: 'Active Students' },
                { number: '98%', label: 'Success Rate' }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`text-center p-8 rounded-2xl ${
                    isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/50 border border-white/50'
                  }`}
                >
                  <motion.div 
                    className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1, type: 'spring', damping: 20, stiffness: 300 }}
                    viewport={{ once: true }}
                  >
                    {stat.number}
                  </motion.div>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section */}
        {user && (
          <motion.section 
            className={`px-4 sm:px-6 lg:px-8 py-20 ${
              isDark ? 'bg-slate-900/50' : 'bg-gradient-to-r from-blue-500/10 to-purple-600/10'
            }`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="max-w-4xl mx-auto text-center">
              <motion.div variants={itemVariants}>
                <h3 className={`text-3xl sm:text-4xl font-bold mb-6 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Ready to start learning?
                </h3>
                <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Join thousands of students already using Study Companion AI to improve their grades
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                >
                  Start Learning Now <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </div>
          </motion.section>
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-200'} py-12 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-6xl mx-auto text-center">
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            © 2026 Study Companion AI. Master your studies with our intelligent learning platform.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

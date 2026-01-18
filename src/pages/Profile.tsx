import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  BookOpen,
  Settings,
  LogOut,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { AIChatbot, AIChatbotHandle } from '@/components/AIChatbot';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { profile, signOut } = useAuth();
  const chatbotRef = React.useRef<AIChatbotHandle>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleChatbot = () => {
    chatbotRef.current?.open();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    email: profile?.email || '',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Passionate about learning and technology',
    university: 'Stanford University',
    major: 'Computer Science',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // Show success message
    }, 1000);
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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'security', label: 'Security', icon: Lock }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <Sidebar currentPage="profile" onNavigate={() => {}} onToggleChatbot={handleToggleChatbot} />

      <main className="lg:ml-64 min-h-screen pt-20 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.button
              whileHover={{ x: -4 }}
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </motion.button>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              My Profile
            </motion.h1>
          </motion.div>

          {/* Profile Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-8 rounded-2xl mb-8 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/50 border-white/50'} border`}
          >
            <div className="flex gap-8 items-start md:items-center flex-col md:flex-row">
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="relative flex-shrink-0"
              >
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <User className="w-12 h-12 text-white" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full text-white shadow-lg"
                >
                  <Camera className="w-5 h-5" />
                </motion.button>
              </motion.div>

              {/* Info */}
              <div className="flex-1">
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {profile?.full_name || 'User Name'}
                </h2>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  {profile?.email}
                </p>
                <div className="flex gap-6 flex-wrap">
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Courses</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>12</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                    <p className={`text-2xl font-bold text-green-600`}>8</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>In Progress</p>
                    <p className={`text-2xl font-bold text-blue-600`}>4</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div 
            className="flex gap-2 mb-8 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {tabs.map(tab => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : isDark
                      ? 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Tab Content */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={activeTab}
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {/* Personal Info */}
                <motion.div
                  variants={itemVariants}
                  className={`p-8 rounded-2xl ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/50 border-white/50'} border`}
                >
                  <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Personal Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Full Name
                      </label>
                      <Input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`rounded-lg border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`rounded-lg border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Phone
                      </label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`rounded-lg border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Location
                      </label>
                      <Input
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className={`rounded-lg border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Education Info */}
                <motion.div
                  variants={itemVariants}
                  className={`p-8 rounded-2xl ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/50 border-white/50'} border`}
                >
                  <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Education
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        University
                      </label>
                      <Input
                        name="university"
                        value={formData.university}
                        onChange={handleInputChange}
                        className={`rounded-lg border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Major
                      </label>
                      <Input
                        name="major"
                        value={formData.major}
                        onChange={handleInputChange}
                        className={`rounded-lg border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Save Button */}
                <motion.div variants={itemVariants}>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl px-8 py-3 shadow-lg hover:shadow-xl transition-all gap-2 flex items-center"
                  >
                    <Save className="w-5 h-5" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <motion.div
                  variants={itemVariants}
                  className={`p-8 rounded-2xl ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/50 border-white/50'} border space-y-6`}
                >
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Notification Preferences
                  </h3>

                  {[
                    { title: 'Course Updates', desc: 'Get notified about new courses' },
                    { title: 'Assignment Reminders', desc: 'Reminder for pending assignments' },
                    { title: 'Revision Schedules', desc: 'Spaced repetition reminders' },
                    { title: 'Achievement Unlocked', desc: 'Celebrate your milestones' }
                  ].map((setting, idx) => (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {setting.title}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {setting.desc}
                          </p>
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <motion.div
                  variants={itemVariants}
                  className={`p-8 rounded-2xl ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/50 border-white/50'} border`}
                >
                  <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Current Password
                      </label>
                      <div className="relative">
                        <Input
                          name="currentPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className={`rounded-lg border pr-10 ${
                            isDark 
                              ? 'bg-slate-700 border-slate-600 text-white' 
                              : 'bg-white border-gray-300'
                          }`}
                        />
                        <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {showPassword ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        New Password
                      </label>
                      <Input
                        name="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className={`rounded-lg border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Confirm Password
                      </label>
                      <Input
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`rounded-lg border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                  <Button className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl px-8 py-3 shadow-lg">
                    Update Password
                  </Button>
                </motion.div>

                {/* Sign Out */}
                <motion.div
                  variants={itemVariants}
                  className={`p-8 rounded-2xl ${isDark ? 'bg-red-900/20 border-red-700/30' : 'bg-red-50 border-red-200'} border`}
                >
                  <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                    Danger Zone
                  </h3>
                  <p className={`text-sm mb-4 ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                    Sign out from all devices
                  </p>
                  <Button
                    onClick={handleSignOut}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl gap-2 flex items-center"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      <AIChatbot ref={chatbotRef} />
    </div>
  );
};

export default Profile;

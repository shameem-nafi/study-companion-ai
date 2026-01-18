import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, code?: string) => Promise<void>;
  departmentName?: string;
  isLoading?: boolean;
}

export const AddCourseModal: React.FC<AddCourseModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  departmentName = 'this department',
  isLoading = false
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    try {
      await onAdd(name, code || undefined);
      setName('');
      setCode('');
      onClose();
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md ${
              isDark ? 'bg-slate-900' : 'bg-white'
            } rounded-xl shadow-2xl p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Add Course
              </h2>
              <button
                onClick={onClose}
                className={`p-1 rounded-lg ${
                  isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                } transition-colors`}
              >
                <X size={20} />
              </button>
            </div>

            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Adding course to <strong>{departmentName}</strong>
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Course Name *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Introduction to Python, Calculus I"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  className={isDark ? 'bg-slate-800 border-slate-700' : ''}
                />
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Course Code (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g., CS101, MATH201"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isLoading}
                  className={isDark ? 'bg-slate-800 border-slate-700' : ''}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                >
                  {isLoading ? 'Adding...' : 'Add Course'}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

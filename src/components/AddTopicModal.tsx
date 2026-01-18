import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, description?: string, tags?: string[]) => Promise<void>;
  courseName?: string;
  isLoading?: boolean;
}

export const AddTopicModal: React.FC<AddTopicModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  courseName = 'this course',
  isLoading = false
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    try {
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      await onAdd(name, description || undefined, tags.length > 0 ? tags : undefined);
      setName('');
      setDescription('');
      setTagsInput('');
      onClose();
    } catch (error) {
      console.error('Error adding topic:', error);
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
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[90vh] overflow-y-auto ${
              isDark ? 'bg-slate-900' : 'bg-white'
            } rounded-xl shadow-2xl p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Add Topic/Lesson
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
              Adding topic to <strong>{courseName}</strong>
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Topic Name *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Variables and Data Types, Limits"
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
                  Description (Optional)
                </label>
                <textarea
                  placeholder="What is this topic about? Any notes?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors resize-none ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Tags (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g., important, exam, difficult (comma-separated)"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  disabled={isLoading}
                  className={isDark ? 'bg-slate-800 border-slate-700' : ''}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Separate tags with commas
                </p>
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
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {isLoading ? 'Adding...' : 'Add Topic'}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

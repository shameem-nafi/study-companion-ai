import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const GlobalSettings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Dark Mode Toggle */}
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="relative overflow-hidden glass-button"
        >
          <motion.div
            initial={false}
            animate={{
              rotate: theme === 'dark' ? 0 : 180,
              scale: theme === 'dark' ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute"
          >
            <Moon className="h-5 w-5" />
          </motion.div>
          <motion.div
            initial={false}
            animate={{
              rotate: theme === 'light' ? 0 : -180,
              scale: theme === 'light' ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute"
          >
            <Sun className="h-5 w-5" />
          </motion.div>
        </Button>
      </motion.div>

      {/* Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="glass-button">
            <Globe className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-dropdown">
          <DropdownMenuItem
            onClick={() => handleLanguageChange('en')}
            className={i18n.language === 'en' ? 'bg-accent' : ''}
          >
            {t('common.english')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleLanguageChange('bn')}
            className={i18n.language === 'bn' ? 'bg-accent' : ''}
          >
            {t('common.bangla')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

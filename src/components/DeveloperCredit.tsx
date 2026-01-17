import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';

export const DeveloperCredit: React.FC = () => {
  const { t } = useTranslation();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="py-4 text-center text-sm text-muted-foreground"
    >
      <p className="flex items-center justify-center gap-2">
        {t('footer.developedBy')}{' '}
        <motion.a
          href="https://www.linkedin.com/in/sadman-nahial-nafi"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t('footer.developerName')}
          <Heart className="h-3 w-3 text-red-500 fill-red-500" />
        </motion.a>
      </p>
    </motion.footer>
  );
};

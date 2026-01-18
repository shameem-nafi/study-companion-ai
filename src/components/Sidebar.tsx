import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  RefreshCw,
  LogOut,
  Menu,
  X,
  GraduationCap,
  MessageCircle,
  User,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { GlobalSettings } from '@/components/GlobalSettings';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onToggleChatbot?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onToggleChatbot }) => {
  const { t } = useTranslation();
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { id: 'dashboard', label: t('dashboard.title'), icon: LayoutDashboard, route: '/dashboard' },
    { id: 'departments', label: t('departments.title'), icon: Building2, route: '/departments' },
    { id: 'revisions', label: t('revisions.title'), icon: RefreshCw, route: '/revisions' },
  ];

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-border/50 flex items-center justify-between gap-3">
        <button
          onClick={() => {
            onNavigate('dashboard');
            setMobileOpen(false);
          }}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer flex-1 min-w-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="text-left min-w-0">
            <h2 className="font-bold text-lg">{t('auth.title')}</h2>
            {profile?.full_name && (
              <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                {profile.full_name}
              </p>
            )}
          </div>
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleChatbot}
          className="hidden lg:flex bg-primary hover:bg-primary/80 text-primary-foreground rounded-xl h-9 w-9 flex-shrink-0"
          title={t('chatbot.title')}
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item, idx) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05, type: 'spring', damping: 20, stiffness: 300 }}
            whileHover={{ x: 6, scale: 1.01 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              navigate(item.route);
              onNavigate(item.id);
              setMobileOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              currentPage === item.id
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <motion.div whileHover={{ rotate: 12 }}>
              <item.icon className="w-5 h-5" />
            </motion.div>
            {item.label}
          </motion.button>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-border/50 space-y-4">
        <GlobalSettings />
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
          onClick={() => navigate('/profile')}
        >
          <User className="w-4 h-4 mr-2" />
          My Profile
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t('auth.logoutButton')}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border/50 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleChatbot}
            className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{t('chatbot.title')}</span>
          </Button>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
          </div>
          <h2 className="font-bold">{t('auth.title')}</h2>
        </button>
      </div>

      {/* Mobile Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: mobileOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="lg:hidden fixed inset-y-0 left-0 w-72 bg-background/95 backdrop-blur-xl border-r border-border/50 z-40 flex flex-col pt-16"
      >
        <NavContent />
      </motion.div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-background/50 backdrop-blur-xl border-r border-border/50 flex-col">
        <NavContent />
      </div>
    </>
  );
};

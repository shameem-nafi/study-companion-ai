import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { UnifiedDashboard } from '@/components/UnifiedDashboard';
import { DeveloperCredit } from '@/components/DeveloperCredit';
import { AIChatbot, AIChatbotHandle } from '@/components/AIChatbot';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const chatbotRef = React.useRef<AIChatbotHandle>(null);
  const navigate = useNavigate();

  const handleToggleChatbot = () => {
    chatbotRef.current?.open();
  };

  const handleNavigate = (page: string) => {
    if (page === 'dashboard') navigate('/dashboard');
    else if (page === 'departments') navigate('/departments');
    else if (page === 'revisions') navigate('/revisions');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <Sidebar currentPage="dashboard" onNavigate={handleNavigate} onToggleChatbot={handleToggleChatbot} />
      <main className="lg:ml-64 min-h-screen pt-20 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          <UnifiedDashboard />
          <DeveloperCredit />
        </div>
      </main>
      <AIChatbot ref={chatbotRef} />
    </div>
  );
};

export default Dashboard;

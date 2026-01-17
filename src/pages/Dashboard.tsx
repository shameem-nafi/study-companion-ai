import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { DashboardView } from '@/components/DashboardView';
import { DepartmentsView } from '@/components/DepartmentsView';
import { RevisionsView } from '@/components/RevisionsView';
import { DeveloperCredit } from '@/components/DeveloperCredit';

const Dashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderContent = () => {
    switch (currentPage) {
      case 'departments':
        return <DepartmentsView />;
      case 'revisions':
        return <RevisionsView />;
      default:
        return <DashboardView onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="lg:ml-64 min-h-screen pt-20 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {renderContent()}
          <DeveloperCredit />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

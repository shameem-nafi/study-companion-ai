import React from 'react';
import { CompleteProfileForm } from '@/components/CompleteProfileForm';
import { GlobalSettings } from '@/components/GlobalSettings';

const CompleteProfile: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex flex-col">
      <header className="absolute top-4 right-4 z-10">
        <GlobalSettings />
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <CompleteProfileForm />
      </main>
    </div>
  );
};

export default CompleteProfile;

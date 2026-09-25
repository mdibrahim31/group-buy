import React from 'react';
import { AppProvider } from './context/AppContext';
import { SubAdminPanelModal } from './components/SubAdminPanelModal';

export const SubAdminAppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-900 flex flex-col">
      <SubAdminPanelModal
        isOpen={true}
        onClose={() => {
          window.location.href = './index.html';
        }}
      />
    </div>
  );
};

export default function SubAdminApp() {
  return (
    <AppProvider>
      <SubAdminAppContent />
    </AppProvider>
  );
}

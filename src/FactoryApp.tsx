import React from 'react';
import { AppProvider } from './context/AppContext';
import { FactoryPanelModal } from './components/FactoryPanelModal';

export const FactoryAppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-900 flex flex-col">
      <FactoryPanelModal
        isOpen={true}
        onClose={() => {
          window.location.href = './index.html';
        }}
      />
    </div>
  );
};

export default function FactoryApp() {
  return (
    <AppProvider>
      <FactoryAppContent />
    </AppProvider>
  );
}

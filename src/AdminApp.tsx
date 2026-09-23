import React from 'react';
import { AppProvider } from './context/AppContext';
import { AdminPanelModal } from './components/AdminPanelModal';

export const AdminAppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-900 flex flex-col">
      <AdminPanelModal
        isOpen={true}
        onClose={() => {
          window.location.href = './index.html';
        }}
      />
    </div>
  );
};

export default function AdminApp() {
  return (
    <AppProvider>
      <AdminAppContent />
    </AppProvider>
  );
}

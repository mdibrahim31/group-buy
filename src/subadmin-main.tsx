import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import SubAdminApp from './SubAdminApp.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <SubAdminApp />
    </ErrorBoundary>
  </StrictMode>,
);

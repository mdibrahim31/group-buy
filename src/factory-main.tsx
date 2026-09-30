import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import FactoryApp from './FactoryApp.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <FactoryApp />
    </ErrorBoundary>
  </StrictMode>,
);

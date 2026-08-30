import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { StoreProvider } from './store/StoreContext';
import GoogleGate from './components/GoogleGate';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleGate>
      <StoreProvider>
        <App />
      </StoreProvider>
    </GoogleGate>
  </StrictMode>,
);
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { StoreProvider } from './store/StoreContext';
import './index.css';

// Enregistre le service worker dès le chargement : indispensable pour que le
// site soit installable (PWA) et pour que les notifications push arrivent en
// arrière-plan, même quand l'onglet est fermé.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Enregistrement du service worker impossible :', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
);
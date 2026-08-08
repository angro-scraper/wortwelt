import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import '@fontsource/nunito/latin-ext-400.css';
import '@fontsource/nunito/latin-ext-700.css';
import '@fontsource/nunito/latin-ext-800.css';
import '@fontsource/nunito/latin-ext-900.css';
import { WortWeltApp } from './WortWeltApp';
import './styles.css';

let applyServiceWorkerUpdate: ((reloadPage?: boolean) => Promise<void>) | undefined;
applyServiceWorkerUpdate = registerSW({
  immediate: true,
  onNeedRefresh: () => {
    void applyServiceWorkerUpdate?.(true);
  },
  onRegisteredSW: (_serviceWorkerUrl, registration) => {
    void registration?.update();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode><WortWeltApp /></StrictMode>
);

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import '../index.css';

// Global API Fetch Interceptor
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  let url = input;
  if (typeof url === 'string' && url.startsWith('/api')) {
    const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    if (apiBaseUrl) {
      url = `${apiBaseUrl}${url}`;
      init = init || {};
      init.credentials = 'include';
    }
  }
  return originalFetch(url, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


import { useState, useEffect } from 'react';

export function useRoute() {
  const [hash, setHash] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || '#/');
      // Scroll to top on navigation
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (newHash: string) => {
    window.location.hash = newHash.startsWith('#') ? newHash : `#/${newHash}`;
  };

  // Parse route e.g. "article/1" -> { path: "article", param: "1" }
  const cleanHash = hash.replace(/^#\/?/, '');
  const parts = cleanHash.split('/');
  const path = parts[0] || 'home';
  const param = parts[1] || null;

  return {
    path,
    param,
    hash,
    navigate
  };
}

// frontend/config.js

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0');

export const serverUrl =
  import.meta.env.VITE_SERVER_URL ||
  import.meta.env.VITE_API_URL ||
  (isLocalhost
    ? 'http://localhost:5000'
    : 'https://cravely-backend-dmak.onrender.com');

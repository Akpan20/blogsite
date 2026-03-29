import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally
window.Pusher = Pusher;

// Configure Laravel Echo
export const initEcho = (authToken?: string) => {
  const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: 'http://localhost:8000/api/broadcasting/auth',
    auth: authToken ? {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    } : undefined,
  });

  return echo;
};

// Global Echo instance
let echoInstance: Echo | null = null;

export const getEcho = (): Echo | null => {
  return echoInstance;
};

export const setEcho = (echo: Echo) => {
  echoInstance = echo;
};

export const disconnectEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
};
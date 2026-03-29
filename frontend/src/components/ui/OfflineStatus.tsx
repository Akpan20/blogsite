import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-60 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
      <WifiOff className="h-4 w-4 text-orange-400" />
      <span className="text-sm font-medium">Viewing in Offline Mode</span>
    </div>
  );
}
// src/components/LocalStorageMonitor.tsx
import { useEffect } from 'react';

export default function LocalStorageMonitor() {
  useEffect(() => {
    // Only run in development to avoid console spam in production
    if (import.meta.env.MODE !== 'development') return;

    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    const originalClear = localStorage.clear;

    localStorage.setItem = function (key: string, value: string) {
      console.log(`📝 localStorage.setItem called:`, { 
        key, 
        value: typeof value === 'string' ? value.substring(0, 50) + '...' : value 
      });
      if (key === 'auth_token') {
        console.trace('🔍 Token SET stack trace:');
      }
      return originalSetItem.apply(this, arguments as any);
    };

    localStorage.removeItem = function (key: string) {
      console.log(`🗑️ localStorage.removeItem called:`, { key });
      if (key === 'auth_token') {
        console.trace('🔍 Token REMOVED stack trace:');
      }
      return originalRemoveItem.apply(this, arguments as any);
    };

    localStorage.clear = function () {
      console.log(`🧹 localStorage.clear called`);
      console.trace('🔍 Clear stack trace:');
      return originalClear.apply(this, arguments as any);
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        console.log(`🔄 External storage change:`, {
          key: e.key,
          oldValue: e.oldValue?.substring(0, 20) + '...',
          newValue: e.newValue?.substring(0, 20) + '...',
        });
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
      localStorage.clear = originalClear;
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  return null; // This component renders nothing
}
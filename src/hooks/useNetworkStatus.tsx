import { useEffect, useState } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection quality
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const updateConnectionStatus = () => {
        // Consider connection slow if effective type is 'slow-2g' or '2g'
        setIsSlowConnection(connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
      };

      connection.addEventListener('change', updateConnectionStatus);
      updateConnectionStatus();

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', updateConnectionStatus);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isSlowConnection };
};

// Offline notification component
import React from 'react';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface OfflineNotificationProps {
  isOnline: boolean;
  isSlowConnection: boolean;
}

export const OfflineNotification: React.FC<OfflineNotificationProps> = ({ isOnline, isSlowConnection }) => {
  if (isOnline && !isSlowConnection) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 p-3 text-center text-white ${
      !isOnline ? 'bg-red-600' : 'bg-yellow-600'
    }`}>
      <div className="flex items-center justify-center space-x-2">
        {!isOnline ? (
          <>
            <WifiOff className="w-5 h-5" />
            <span>You're offline. Some features may not work properly.</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-5 h-5" />
            <span>Slow connection detected. Images may load slowly.</span>
          </>
        )}
      </div>
    </div>
  );
};
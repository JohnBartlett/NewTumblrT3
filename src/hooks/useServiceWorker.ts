import { useEffect, useState } from 'react';
import { Workbox, messageSW } from 'workbox-window';

interface ServiceWorkerState {
  isSupported: boolean;
  registration: ServiceWorkerRegistration | null;
  isUpdateAvailable: boolean;
  updateServiceWorker: () => Promise<void>;
}

export function useServiceWorker(): ServiceWorkerState {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  const isSupported = 'serviceWorker' in navigator;

  useEffect(() => {
    if (!isSupported) return;

    const wb = new Workbox('/sw.js');

    // Notify when a service worker update is available
    wb.addEventListener('waiting', (event) => {
      setIsUpdateAvailable(true);
    });

    // Handle controller change after update
    wb.addEventListener('controlling', (event) => {
      window.location.reload();
    });

    // Register the service worker
    wb.register()
      .then((reg) => {
        setRegistration(reg);
        
        // Check for updates immediately
        reg.update();
        
        // Check for updates periodically
        const interval = setInterval(() => {
          reg.update();
        }, 60 * 60 * 1000); // Every hour

        return () => clearInterval(interval);
      })
      .catch((error) => {
        console.error('Service worker registration failed:', error);
      });
  }, [isSupported]);

  const updateServiceWorker = async () => {
    if (!registration || !registration.waiting) return;

    // Send message to waiting service worker to activate it
    await messageSW(registration.waiting, { type: 'SKIP_WAITING' });
  };

  return {
    isSupported,
    registration,
    isUpdateAvailable,
    updateServiceWorker,
  };
}




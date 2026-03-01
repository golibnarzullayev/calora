import { useEffect, useState } from 'react';
import {
  registerServiceWorker,
  setupInstallPrompt,
  isStandalone,
  isOnline,
  setupNetworkListener,
} from '../utils/pwa';

export const usePWA = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isOnlineStatus, setIsOnlineStatus] = useState(true);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    // Register service worker
    registerServiceWorker().then((registration) => {
      if (registration) {
        setSwRegistered(true);
      }
    });

    // Setup install prompt
    setupInstallPrompt();

    // Check if app is installed
    setIsInstalled(isStandalone());

    // Setup network listener
    setIsOnlineStatus(isOnline());
    setupNetworkListener((online) => {
      setIsOnlineStatus(online);
    });

    // Listen for install prompt ready
    const handleInstallPromptReady = () => {
      setCanInstall(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener('install-prompt-ready', handleInstallPromptReady);
    window.addEventListener('app-installed', handleAppInstalled);

    return () => {
      window.removeEventListener('install-prompt-ready', handleInstallPromptReady);
      window.removeEventListener('app-installed', handleAppInstalled);
    };
  }, []);

  return {
    isInstalled,
    canInstall,
    isOnline: isOnlineStatus,
    swRegistered,
  };
};

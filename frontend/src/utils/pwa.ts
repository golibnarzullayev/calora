// PWA Service Worker Registration and Management

export const registerServiceWorker = async (): Promise<
  ServiceWorkerRegistration | undefined
> => {
  if (!("serviceWorker" in navigator)) {
    return undefined;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    setInterval(() => {
      registration.update();
    }, 60000);

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            showUpdatePrompt();
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error("Service Worker registration failed:", error);
    return undefined;
  }
};

export const showUpdatePrompt = () => {
  // Dispatch custom event for update notification
  const event = new CustomEvent("sw-update-available");
  window.dispatchEvent(event);
};

export const skipWaiting = () => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });
  }
};

export const unregisterServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      console.log("Service Workers unregistered");
    } catch (error) {
      console.error("Failed to unregister Service Workers:", error);
    }
  }
};

// Check if app is installed
export const isAppInstalled = async (): Promise<boolean> => {
  if ("getInstalledRelatedApps" in navigator) {
    try {
      const apps = await (navigator as any).getInstalledRelatedApps();
      return apps.length > 0;
    } catch (error) {
      console.error("Error checking installed apps:", error);
      return false;
    }
  }
  return false;
};

// Request install prompt
export const requestInstallPrompt = () => {
  const event = new CustomEvent("request-install-prompt");
  window.dispatchEvent(event);
};

// Add to home screen prompt handler
let deferredPrompt: any = null;

export const setupInstallPrompt = () => {
  window.addEventListener("beforeinstallprompt", (e: any) => {
    e.preventDefault();
    deferredPrompt = e;
    // Dispatch event to show install button
    const event = new CustomEvent("install-prompt-ready");
    window.dispatchEvent(event);
  });

  window.addEventListener("appinstalled", () => {
    console.log("PWA was installed");
    deferredPrompt = null;
    const event = new CustomEvent("app-installed");
    window.dispatchEvent(event);
  });
};

export const triggerInstall = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    deferredPrompt = null;
  }
};

// Detect if running as standalone PWA
export const isStandalone = (): boolean => {
  return (
    (window.navigator as any).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
};

// Get network status
export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const setupNetworkListener = (callback: (isOnline: boolean) => void) => {
  window.addEventListener("online", () => callback(true));
  window.addEventListener("offline", () => callback(false));
};

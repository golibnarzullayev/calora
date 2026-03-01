declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
          };
          auth_date: number;
          hash: string;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        showPopup: (params: any) => void;
        showAlert: (message: string) => void;
        showConfirm: (message: string, callback: (ok: boolean) => void) => void;
        HapticFeedback: {
          impactOccurred: (style: string) => void;
          notificationOccurred: (type: string) => void;
          selectionChanged: () => void;
        };
        CloudStorage: {
          getItem: (
            key: string,
            callback: (err: any, value: string) => void,
          ) => void;
          setItem: (
            key: string,
            value: string,
            callback: (err: any) => void,
          ) => void;
          removeItem: (key: string, callback: (err: any) => void) => void;
        };
      };
    };
  }
}

export function getTelegramWebApp() {
  return window.Telegram?.WebApp;
}

export function getTelegramUser() {
  return window.Telegram?.WebApp?.initDataUnsafe?.user;
}

export function initTelegramWebApp() {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.ready();
    webApp.expand();
  }
}

export function getTelegramUserId(): string | null {
  const user = getTelegramUser();
  if (user?.id) {
    return user.id.toString();
  }
  return null;
}

export function showTelegramAlert(message: string) {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.showAlert(message);
  } else {
    alert(message);
  }
}

export function showTelegramConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp();
    if (webApp) {
      webApp.showConfirm(message, (ok) => resolve(ok));
    } else {
      resolve(confirm(message));
    }
  });
}

export function hapticFeedback(type: "impact" | "notification" | "selection") {
  const webApp = getTelegramWebApp();
  if (webApp?.HapticFeedback) {
    if (type === "impact") {
      webApp.HapticFeedback.impactOccurred("medium");
    } else if (type === "notification") {
      webApp.HapticFeedback.notificationOccurred("success");
    } else if (type === "selection") {
      webApp.HapticFeedback.selectionChanged();
    }
  }
}

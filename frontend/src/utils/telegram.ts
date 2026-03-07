export function getTelegramWebApp() {
  return window.Telegram?.WebApp;
}

export function getTelegramUser() {
  return window.Telegram?.WebApp?.initDataUnsafe?.user;
}

export const initTelegramWebApp = () => {
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;

    tg.ready();
    tg.expand();
  }
};

export const getTelegramUserId = () => {
  if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    return String(window.Telegram.WebApp.initDataUnsafe.user.id);
  }

  return null;
};

export const showTelegramAlert = (message: string) => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.showAlert(message);
  } else {
    alert(message);
  }
};

export const showTelegramConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp();
    if (webApp) {
      webApp.showConfirm(message, (ok) => resolve(ok));
    } else {
      resolve(confirm(message));
    }
  });
};

export const hapticFeedback = (
  type: "impact" | "notification" | "selection",
) => {
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
};

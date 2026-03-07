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

import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import "@twa-dev/types";
import App from "./App";
import "./index.css";

document.addEventListener(
  "touchmove",
  (e) => {
    if (
      e.target instanceof HTMLElement &&
      (e.target.closest("[data-scrollable]") ||
        e.target.closest(".overflow-y-auto"))
    ) {
      return;
    }
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  },
  { passive: false },
);

document.addEventListener(
  "touchstart",
  (e) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("[data-scrollable]") ||
      target.closest(".overflow-y-auto")
    ) {
      return;
    }
  },
  { passive: true },
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
);

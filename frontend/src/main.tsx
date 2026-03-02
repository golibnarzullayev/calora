import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./context/ThemeContext";
import App from "./App";
import "./index.css";

// Prevent pull-to-refresh and native app-like behavior
document.addEventListener(
  "touchmove",
  (e) => {
    // Allow scrolling within scrollable containers
    if (
      e.target instanceof HTMLElement &&
      (e.target.closest("[data-scrollable]") ||
        e.target.closest(".overflow-y-auto"))
    ) {
      return;
    }
    // Prevent default pull-to-refresh
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  },
  { passive: false },
);

// Prevent overscroll bounce on iOS
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
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
);

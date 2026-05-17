"use client";

import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--glass-strong-bg)",
            border: "1px solid var(--glass-strong-border)",
            color: "var(--foreground)",
            backdropFilter: "blur(20px)",
          },
        }}
        richColors
        closeButton
      />
    </>
  );
}

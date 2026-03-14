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
            background: "oklch(0.14 0.01 260 / 90%)",
            border: "1px solid oklch(1 0 0 / 8%)",
            color: "oklch(0.95 0.01 80)",
            backdropFilter: "blur(20px)",
          },
        }}
        richColors
        closeButton
      />
    </>
  );
}

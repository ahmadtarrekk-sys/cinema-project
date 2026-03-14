"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Exceptions");

  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex max-w-md flex-col items-center text-center"
      >
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cinema-red/10 ring-1 ring-cinema-red/20">
          <AlertTriangle className="h-8 w-8 text-cinema-red" />
        </div>

        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("error_title")}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t("error_desc")}
        </p>

        {error.digest && (
          <p className="mt-2 text-xs text-muted-foreground/50">
            {t("error_id", { id: error.digest })}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <Button
            onClick={reset}
            className="gap-2 bg-gold text-black hover:bg-gold-light font-semibold"
          >
            <RotateCcw className="h-4 w-4" />
            {t("try_again")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

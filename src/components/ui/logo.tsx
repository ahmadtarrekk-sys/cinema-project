"use client";

import { motion } from "framer-motion";
import { Film } from "lucide-react";
import { Link } from "@/i18n/routing";

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <motion.div
        className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10 ring-1 ring-gold/20 overflow-hidden"
        whileHover={{ scale: 1.05, rotate: 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <img src="/favicon.ico" alt="Movie Time Logo" className="h-5 w-5 object-contain" />
        <div className="absolute -inset-0.5 rounded-lg bg-gold/5 opacity-0 blur-sm transition-opacity group-hover:opacity-100" />
      </motion.div>
      <div className="flex flex-col">
        <span className="font-display text-lg font-semibold tracking-wide text-gradient-gold">
          MOVIE TIME
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Cinema
        </span>
      </div>
    </Link>
  );
}

"use client";

import { motion, type Variants } from "framer-motion";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  Play,
  Ticket,
  Popcorn,
  ArrowRight,
  Star,
  MapPin,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function HomePage() {
  const t = useTranslations("Home");

  const features = [
    {
      icon: Ticket,
      title: t("features.items.booking.title"),
      description: t("features.items.booking.desc"),
    },
    {
      icon: Popcorn,
      title: t("features.items.concessions.title"),
      description: t("features.items.concessions.desc"),
    },
    {
      icon: Sparkles,
      title: t("features.items.smart.title"),
      description: t("features.items.smart.desc"),
    },
    {
      icon: MapPin,
      title: t("features.items.venues.title"),
      description: t("features.items.venues.desc"),
    },
  ];

  return (
    <div className="relative">
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative flex min-h-[100vh] items-center overflow-hidden bg-hero">
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 overlay-hero" />
        
        {/* Spotlight background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.82_0.12_75/8%),transparent)]" />
          <div className="absolute bottom-0 h-48 w-full bg-gradient-to-t from-background/70 to-transparent backdrop-blur-sm" />
          <div className="animate-spotlight absolute -top-1/2 left-1/2 h-[200%] w-[60%] -translate-x-1/2 bg-[conic-gradient(from_90deg,transparent,oklch(0.82_0.12_75/3%),transparent_50%)]" />
        </div>

        {/* Decorative grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(oklch(1 0 0 / 5%) 1px, transparent 1px),
                              linear-gradient(90deg, oklch(1 0 0 / 5%) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center text-center"
          >
            {/* Badge */}
            <motion.div variants={fadeUp}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5">
                <Star className="h-3.5 w-3.5 text-gold" />
                <span className="text-xs font-medium tracking-wide text-gold">
                  {t("badge")}
                </span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div variants={fadeUp}>
              <h1 className="max-w-4xl font-display text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl whitespace-pre-line text-on-image-strong">
                {t.rich("title", {
                  brand: (chunks) => <span className="text-gradient-gold">{chunks}</span>
                })}
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg text-on-image"
            >
              {t("subtitle")}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link href="/movies">
                <Button
                  size="lg"
                  className="group gap-2 bg-gold px-8 text-black hover:bg-gold-light font-semibold btn-glow"
                >
                  <Play className="h-4 w-4 rtl:rotate-180" />
                  {t("cta.browse")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180" />
                </Button>
              </Link>
              <Link href="/cinemas">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-border px-8 hover:bg-accent"
                >
                  <MapPin className="h-4 w-4" />
                  {t("cta.find")}
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              className="mt-16 grid grid-cols-3 gap-8 sm:gap-16"
            >
              {[
                { value: "25+", label: t("stats.cinemas") },
                { value: "200+", label: t("stats.movies") },
                { value: "50K+", label: t("stats.viewers") },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-2xl font-bold text-gold sm:text-3xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="relative border-t border-border py-24 bg-chat bg-blend-overlay bg-background/80">
        <div className="absolute inset-0 overlay-content" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12 text-center"
          >
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t("features.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              {t("features.subtitle")}
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div className="group relative rounded-xl border border-border bg-cinema-surface p-6 transition-all duration-300 hover:border-gold/20 hover:bg-cinema-surface-hover hover:glow-gold-sm lg:h-full card-interactive">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 transition-colors group-hover:bg-gold/15">
                    <feature.icon className="h-5 w-5 text-gold" />
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="relative border-t border-border py-24 bg-auth bg-blend-overlay bg-background/80">
        <div className="absolute inset-0 overlay-scrim" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,oklch(0.82_0.12_75/5%),transparent)]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto max-w-2xl px-4 text-center sm:px-6"
        >
          <Film className="mx-auto mb-4 h-8 w-8 text-gold/60" />
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t("banner.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            {t("banner.subtitle")}
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button
                size="lg"
                className="gap-2 bg-gold px-8 text-black hover:bg-gold-light font-semibold btn-glow"
              >
                <Sparkles className="h-4 w-4" />
                {t("cta.join")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

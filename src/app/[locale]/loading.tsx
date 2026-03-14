import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="relative">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
        <div className="absolute inset-0 animate-glow-pulse rounded-full bg-gold/5 blur-xl" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-4 w-32 shimmer-bg" />
        <Skeleton className="h-3 w-24 shimmer-bg" />
      </div>
    </div>
  );
}

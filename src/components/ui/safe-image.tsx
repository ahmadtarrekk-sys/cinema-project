"use client";

/**
 * A safe image component for user-provided URLs.
 * Hides itself gracefully if the image fails to load.
 */
export function SafeImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

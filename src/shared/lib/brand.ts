/**
 * Public logo URL (`public/logo.png`). Used for favicon, shell header, logins, and slides.
 */
export function getBrandLogoUrl(): string {
  const raw = import.meta.env.BASE_URL ?? "/";
  const base = raw.replace(/\/+$/, "");
  return base ? `${base}/logo.png` : "/logo.png";
}

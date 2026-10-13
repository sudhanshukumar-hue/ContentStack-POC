const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBase(href?: string) {
  if (!href) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")) return href;
  if (!base || !href.startsWith("/")) return href;
  if (href === base || href.startsWith(`${base}/`)) return href;
  return `${base}${href}`;
}

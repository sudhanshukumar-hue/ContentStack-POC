export function slugify(value?: string) {
  if (!value) return undefined;
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || undefined;
}

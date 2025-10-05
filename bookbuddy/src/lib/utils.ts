export const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

/**
 * Get the correct API path with basePath prefix
 * This ensures API calls work both in development and production
 */
export const getApiPath = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // In production with basePath, Next.js automatically handles routing
  // But we need to explicitly add it for fetch calls
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  return `${basePath}/${cleanPath}`;
};

/**
 * Get the correct asset path with basePath prefix
 * This ensures static assets (images, etc.) work both in development and production
 */
export const getAssetPath = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // In production with basePath, static assets need the prefix
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  return basePath ? `${basePath}/${cleanPath}` : `/${cleanPath}`;
};

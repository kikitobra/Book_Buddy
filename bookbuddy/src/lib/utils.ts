export const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

import { z } from "astro/zod";

/**
 * Zod 4 schemas for landing-page content.
 * Shared by the Content Loader (src/content.config.ts) and components.
 * When Strapi content types exist, the same schemas validate the loader output
 * (Document Service API, flattened responses keyed by `documentId`).
 */

export const iconNames = [
  "network",
  "approval",
  "antenna",
  "domain",
  "hash",
  "license",
  "mobile",
  "globe",
  "coverage",
  "users",
] as const;

export const serviceSchema = z.object({
  title: z.string(),
  summary: z.string(),
  icon: z.enum(iconNames),
  href: z.string(),
});

export const insightSchema = z.object({
  label: z.string(),
  value: z.string(),
  unit: z.string().optional(),
  icon: z.enum(iconNames),
  note: z.string().optional(),
});

export const updateSchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  category: z.string(),
  date: z.coerce.date(),
  image: z.string(),
  href: z.string(),
});

export type Service = z.infer<typeof serviceSchema>;
export type Insight = z.infer<typeof insightSchema>;
export type Update = z.infer<typeof updateSchema>;
export type IconName = (typeof iconNames)[number];

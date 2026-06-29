import { z } from "astro/zod";

/**
 * Zod 4 schemas for landing-page content.
 * Shared by the Content Loader (src/content.config.ts) and components.
 * When Strapi content types exist, the same schemas validate the loader output
 * (Document Service API, flattened responses keyed by `documentId`).
 */

export const serviceSchema = z.object({
  title: z.string(),
  summary: z.string(),
  icon: z.string(),
  href: z.string(),
});

export const insightSchema = z.object({
  label: z.string(),
  value: z.string(),
  unit: z.string().optional(),
  icon: z.string(),
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

/** Mobile coverage rows from the Strapi `mobile-coverage` collection (flattened). */
export const mobileCoverageSchema = z.object({
  island: z.string(),
  provider: z.string().nullish(),
  logo: z
    .object({ url: z.string(), alternativeText: z.string().nullish() })
    .nullish(),
  yearInspected: z.number().nullish(),
  networkType: z.string().nullish(),
  qos: z.enum(["Good", "Average", "Poor"]).nullish(),
  populationCoverage: z.number().nullish(),
  villagesStrong: z.string().nullish(),
  villagesAverage: z.string().nullish(),
  villagesWeak: z.string().nullish(),
  villagesNoCoverage: z.string().nullish(),
});

export type Service = z.infer<typeof serviceSchema>;
export type Insight = z.infer<typeof insightSchema>;
export type Update = z.infer<typeof updateSchema>;
export type MobileCoverage = z.infer<typeof mobileCoverageSchema>;

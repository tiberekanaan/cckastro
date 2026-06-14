import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { serviceSchema, insightSchema, updateSchema } from "./types/content";

/**
 * Build-time content via the Content Loader API.
 * Mock data lives in src/data/*.json today. To wire the live CMS later, swap
 * `loader: file(...)` for the Strapi community Astro loader — schemas and the
 * components consuming them stay unchanged.
 */
const services = defineCollection({
  loader: file("src/data/services.json"),
  schema: serviceSchema,
});

const insights = defineCollection({
  loader: file("src/data/insights.json"),
  schema: insightSchema,
});

const updates = defineCollection({
  loader: file("src/data/updates.json"),
  schema: updateSchema,
});

export const collections = { services, insights, updates };

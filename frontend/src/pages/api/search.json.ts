import type { APIRoute } from "astro";
import { z } from "astro/zod";
import { searchSite } from "../../lib/search";
import type { SearchResponse } from "../../types/search";

export const prerender = false;

const querySchema = z.string().trim().min(2).max(100);

export const GET: APIRoute = async ({ url }) => {
  const parsed = querySchema.safeParse(url.searchParams.get("q") ?? "");
  const body: SearchResponse = {
    results: parsed.success ? await searchSite(parsed.data) : [],
  };
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30",
    },
  });
};

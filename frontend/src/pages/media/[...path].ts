export const prerender = false;

import type { APIRoute } from "astro";
import { STRAPI_MEDIA_URL } from "../../lib/strapi";

/**
 * Same-origin proxy for Strapi Cloud media: streams files from the media host
 * (`STRAPI_MEDIA_URL`) so image URLs never expose where the backend is hosted.
 * Media filenames are content-hashed by Strapi, so responses are immutable and
 * cached hard (browser + Vercel edge via s-maxage). Range requests pass
 * through for video/audio.
 */

// Slash-separated segments of word chars, dots, hyphens — no traversal, no scheme.
const SEGMENT = /^[\w.-]+$/;

function safePath(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const segments = raw.split("/");
  const ok = segments.every(
    (s) => SEGMENT.test(s) && s !== "." && s !== "..",
  );
  return ok ? segments.join("/") : undefined;
}

export const GET: APIRoute = async ({ params, request }) => {
  if (!STRAPI_MEDIA_URL) return new Response("Not found", { status: 404 });

  const path = safePath(params.path);
  if (!path) return new Response("Not found", { status: 404 });

  let upstream: Response;
  try {
    const range = request.headers.get("range");
    upstream = await fetch(`${STRAPI_MEDIA_URL}/${path}`, {
      headers: range ? { range } : undefined,
    });
  } catch (err) {
    console.error("[media] upstream fetch failed:", err);
    return new Response("Media temporarily unavailable", { status: 502 });
  }

  // The media host answers 403 (S3-style) for missing objects, not just 404.
  if (upstream.status === 404 || upstream.status === 403) {
    return new Response("Not found", { status: 404 });
  }
  if (!upstream.ok || !upstream.body) {
    console.error(`[media] upstream ${upstream.status} for ${path}`);
    return new Response("Media temporarily unavailable", { status: 502 });
  }

  const headers = new Headers();
  for (const name of [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
    "etag",
    "last-modified",
  ]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set(
    "Cache-Control",
    "public, max-age=31536000, s-maxage=31536000, immutable",
  );

  return new Response(upstream.body, { status: upstream.status, headers });
};

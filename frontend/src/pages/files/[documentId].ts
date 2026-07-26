export const prerender = false;

import type { APIRoute } from "astro";
import { z } from "astro/zod";
import { STRAPI_URL, upstreamMediaUrl } from "../../lib/strapi";
import type {
  OfficialDocument,
  StrapiCollectionResponse,
} from "../../types/strapi";

/**
 * Same-origin proxy for Official Document files: streams the file from the
 * Strapi media host so visitors never see the backend URL. `?download=1`
 * switches Content-Disposition to attachment (a cross-origin `download`
 * attribute is ignored by browsers, so downloads only work same-origin).
 */

const documentIdSchema = z.string().regex(/^[a-z0-9]{24}$/i);

export const GET: APIRoute = async ({ params, url }) => {
  const parsed = documentIdSchema.safeParse(params.documentId);
  if (!parsed.success) return new Response("Not found", { status: 404 });

  // Lookup via public `find` + documentId filter (findOne isn't a public action).
  const query = new URLSearchParams();
  query.set("filters[documentId][$eq]", parsed.data);
  query.set("populate", "file");
  query.set("pagination[pageSize]", "1");

  let doc: OfficialDocument | undefined;
  try {
    const res = await fetch(`${STRAPI_URL}/api/official-documents?${query}`);
    if (!res.ok) throw new Error(`Strapi /api/official-documents → ${res.status}`);
    const json: StrapiCollectionResponse<OfficialDocument> = await res.json();
    doc = json.data?.[0];
  } catch (err) {
    console.error("[files] document lookup failed:", err);
    return new Response("File temporarily unavailable", { status: 502 });
  }

  // Direct media-host URL — this fetch is server-side, so no need to (and must
  // not) go through the same-origin /media proxy rewrite.
  const fileUrl = doc ? upstreamMediaUrl(doc.file) : undefined;
  if (!doc || !fileUrl) return new Response("Not found", { status: 404 });

  let upstream: Response;
  try {
    upstream = await fetch(fileUrl);
    if (!upstream.ok || !upstream.body) {
      throw new Error(`media fetch → ${upstream.status}`);
    }
  } catch (err) {
    console.error("[files] media fetch failed:", err);
    return new Response("File temporarily unavailable", { status: 502 });
  }

  const filename =
    doc.file?.name ??
    `${doc.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}${doc.file?.ext ?? ""}`;
  // ASCII fallback for the quoted form; RFC 5987 filename* carries the full name.
  const asciiName = filename.replace(/["\r\n]/g, "").replace(/[^\x20-\x7e]/g, "_");
  const disposition = url.searchParams.get("download") === "1" ? "attachment" : "inline";

  const headers = new Headers();
  headers.set(
    "Content-Type",
    upstream.headers.get("content-type") ??
      doc.file?.mime ??
      "application/octet-stream",
  );
  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);
  headers.set(
    "Content-Disposition",
    `${disposition}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
  );
  headers.set("Cache-Control", "public, max-age=3600");

  return new Response(upstream.body, { status: 200, headers });
};

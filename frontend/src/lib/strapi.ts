import type {
  StrapiMedia,
  StrapiRichText,
  StrapiInlineNode,
  StrapiBlockNode,
} from "../types/strapi";

/** Strapi base URL — inlined from .env at build time (Astro 6 `import.meta.env`). */
export const STRAPI_URL: string =
  import.meta.env.STRAPI_URL ?? "http://localhost:1337";

/** Absolute URL for a Strapi media object (handles relative upload paths). */
export function mediaUrl(media?: StrapiMedia | null): string | undefined {
  if (!media?.url) return undefined;
  return media.url.startsWith("http") ? media.url : `${STRAPI_URL}${media.url}`;
}

/** Flatten a Strapi "blocks" rich-text value into plain text (for excerpts). */
export function richTextToPlain(blocks?: StrapiRichText): string {
  if (!blocks) return "";
  const fromNode = (node: StrapiInlineNode | StrapiBlockNode): string => {
    if (node.type === "text") return node.text;
    if ("children" in node && Array.isArray(node.children)) {
      return node.children.map(fromNode).join("");
    }
    return "";
  };
  return blocks
    .map(fromNode)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

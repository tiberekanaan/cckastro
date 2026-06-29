import type {
  StrapiMedia,
  StrapiRichText,
  StrapiInlineNode,
  StrapiBlockNode,
  Navigation,
  NavLinkItem,
  FooterColumnItem,
  GlobalSetting,
  GlobalSettings,
} from "../types/strapi";
import { site } from "../data/site";

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

/**
 * Soft fetch a Strapi collection: returns the `data` array, or `[]` on
 * 404/unpublished/unreachable. Never throws on a missing endpoint, so a
 * not-yet-synced content type degrades to an empty collection at build time.
 */
export async function softFetchStrapi<T = unknown>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${STRAPI_URL}${path}`);
    if (!res.ok) {
      if (res.status !== 404) throw new Error(`Strapi ${path} → ${res.status}`);
      return [];
    }
    const json: { data: T[] | null } = await res.json();
    return json.data ?? [];
  } catch (err) {
    console.error(`[softFetchStrapi] ${path} failed:`, err);
    return [];
  }
}

/** Hard-coded fallback used when the Navigation single type is unpublished/unreachable. */
const FALLBACK_NAV: { headerLinks: NavLinkItem[]; footerColumns: FooterColumnItem[] } = {
  headerLinks: site.nav.map((l) => ({ label: l.label, href: l.href })),
  footerColumns: site.footer.columns.map((c) => ({
    heading: c.heading,
    links: c.links.map((l) => ({ label: l.label, href: l.href })),
  })),
};

/**
 * Editable header links + footer columns from the Strapi `navigation` single type.
 * Falls back to `site.ts` values on 404/unpublished/unreachable, or when the CMS
 * entry leaves a section empty.
 */
export async function getNavigation(): Promise<{
  headerLinks: NavLinkItem[];
  footerColumns: FooterColumnItem[];
}> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/navigation?populate[headerLinks]=true&populate[footerColumns][populate]=links`,
    );
    if (!res.ok) {
      if (res.status !== 404) throw new Error(`Strapi /api/navigation → ${res.status}`);
      return FALLBACK_NAV;
    }
    const json: { data: Navigation | null } = await res.json();
    const data = json.data;
    return {
      headerLinks: data?.headerLinks?.length ? data.headerLinks : FALLBACK_NAV.headerLinks,
      footerColumns: data?.footerColumns?.length
        ? data.footerColumns
        : FALLBACK_NAV.footerColumns,
    };
  } catch (err) {
    console.error("[navigation] fetch failed:", err);
    return FALLBACK_NAV;
  }
}

/** Hard-coded fallback used when the Global Setting single type is unpublished/unreachable. */
const FALLBACK_GLOBAL: GlobalSettings = {
  siteName: site.name,
  contactAddress: site.address,
  contactPhone: site.phone,
  contactEmail: site.email,
  logoUrl: undefined,
  faviconUrl: undefined,
};

/**
 * Editable site assets + contact info from the Strapi `global-setting` single type.
 * Falls back to `site.ts` values per-field on 404/unpublished/unreachable or empty fields.
 */
export async function getGlobalSettings(): Promise<GlobalSettings> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/global-setting?populate[0]=logo&populate[1]=favicon`,
    );
    if (!res.ok) {
      if (res.status !== 404)
        throw new Error(`Strapi /api/global-setting → ${res.status}`);
      return FALLBACK_GLOBAL;
    }
    const json: { data: GlobalSetting | null } = await res.json();
    const data = json.data;
    if (!data) return FALLBACK_GLOBAL;
    return {
      siteName: data.siteName || FALLBACK_GLOBAL.siteName,
      contactAddress: data.contactAddress || FALLBACK_GLOBAL.contactAddress,
      contactPhone: data.contactPhone || FALLBACK_GLOBAL.contactPhone,
      contactEmail: data.contactEmail || FALLBACK_GLOBAL.contactEmail,
      logoUrl: mediaUrl(data.logo),
      faviconUrl: mediaUrl(data.favicon),
    };
  } catch (err) {
    console.error("[global-setting] fetch failed:", err);
    return FALLBACK_GLOBAL;
  }
}

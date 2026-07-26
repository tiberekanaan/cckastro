import type {
  StrapiMedia,
  StrapiRichText,
  StrapiInlineNode,
  StrapiBlockNode,
  Navigation,
  NavLinkItem,
  NavHeaderItem,
  FooterColumnItem,
  GlobalSetting,
  GlobalSettings,
} from "../types/strapi";
import { site } from "../data/site";

/** Strapi base URL — inlined from .env at build time (Astro 6 `import.meta.env`). */
export const STRAPI_URL: string =
  import.meta.env.STRAPI_URL ?? "http://localhost:1337";

/** Strapi Cloud media host base (unset → media URLs are passed through as-is). */
export const STRAPI_MEDIA_URL: string | undefined =
  (import.meta.env.STRAPI_MEDIA_URL as string | undefined)?.replace(/\/+$/, "") ||
  undefined;

/** Direct (backend-host) URL for a Strapi media object — for server-side fetches only. */
export function upstreamMediaUrl(media?: StrapiMedia | null): string | undefined {
  if (!media?.url) return undefined;
  return media.url.startsWith("http") ? media.url : `${STRAPI_URL}${media.url}`;
}

/**
 * Browser-facing URL for a Strapi media object. Media-host URLs are rewritten
 * to the same-origin `/media/<file>` proxy so visitors never see the Strapi
 * Cloud host; anything else (local dev uploads, external URLs) passes through.
 */
export function mediaUrl(media?: StrapiMedia | null): string | undefined {
  const url = upstreamMediaUrl(media);
  if (!url) return undefined;
  if (STRAPI_MEDIA_URL && url.startsWith(`${STRAPI_MEDIA_URL}/`)) {
    return `/media/${url.slice(STRAPI_MEDIA_URL.length + 1)}`;
  }
  return url;
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

/**
 * Normalize an editor-entered nav href: external/protocol links and in-page
 * anchors pass through; internal paths get a leading `/` so they resolve the
 * same from every page (a bare `news` would otherwise break on nested routes).
 */
function normalizeNavHref(href: string): string {
  const trimmed = href.trim();
  if (trimmed === "") return "/";
  if (/^(https?:|mailto:|tel:|#)/i.test(trimmed)) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

const normalizeNavLinks = (links: NavLinkItem[]): NavLinkItem[] =>
  links.map((l) => ({ ...l, href: normalizeNavHref(l.href) }));

/** Normalize header items; an item with children is a dropdown and needs no own href. */
const normalizeHeaderItems = (items: NavHeaderItem[]): NavHeaderItem[] =>
  items.map((i) => ({
    ...i,
    href: i.href ? normalizeNavHref(i.href) : undefined,
    children: i.children?.length ? normalizeNavLinks(i.children) : undefined,
  }));

/** Hard-coded fallback used when the Navigation single type is unpublished/unreachable. */
const FALLBACK_NAV: { headerLinks: NavHeaderItem[]; footerColumns: FooterColumnItem[] } = {
  headerLinks: site.nav.map((l) => ({
    label: l.label,
    href: l.href,
    children: l.children?.map((c) => ({ label: c.label, href: c.href })),
  })),
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
  headerLinks: NavHeaderItem[];
  footerColumns: FooterColumnItem[];
}> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/navigation?populate[headerLinks][populate]=children&populate[footerColumns][populate]=links`,
    );
    if (!res.ok) {
      if (res.status !== 404) throw new Error(`Strapi /api/navigation → ${res.status}`);
      return FALLBACK_NAV;
    }
    const json: { data: Navigation | null } = await res.json();
    const data = json.data;
    return {
      headerLinks: data?.headerLinks?.length
        ? normalizeHeaderItems(data.headerLinks)
        : FALLBACK_NAV.headerLinks,
      footerColumns: data?.footerColumns?.length
        ? data.footerColumns.map((c) => ({ ...c, links: normalizeNavLinks(c.links ?? []) }))
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
  tagline: site.tagline,
  contactAddress: site.address,
  contactPhone: site.phone,
  contactEmail: site.email,
  googleAnalyticsId: undefined,
  logoUrl: undefined,
  faviconUrl: undefined,
  footerLogoUrl: undefined,
};

/**
 * Editable site assets + contact info from the Strapi `global-setting` single type.
 * Falls back to `site.ts` values per-field on 404/unpublished/unreachable or empty fields.
 */
export async function getGlobalSettings(): Promise<GlobalSettings> {
  try {
    const res = await fetch(
      // populate=* stays valid whichever schema version the backend runs
      // (an explicit key list 400s on a backend that predates `footerLogo`).
      `${STRAPI_URL}/api/global-setting?populate=*`,
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
      tagline: data.tagline || FALLBACK_GLOBAL.tagline,
      contactAddress: data.contactAddress || FALLBACK_GLOBAL.contactAddress,
      contactPhone: data.contactPhone || FALLBACK_GLOBAL.contactPhone,
      contactEmail: data.contactEmail || FALLBACK_GLOBAL.contactEmail,
      googleAnalyticsId: data.googleAnalyticsId || undefined,
      logoUrl: mediaUrl(data.logo),
      faviconUrl: mediaUrl(data.favicon),
      footerLogoUrl: mediaUrl(data.footerLogo),
    };
  } catch (err) {
    console.error("[global-setting] fetch failed:", err);
    return FALLBACK_GLOBAL;
  }
}

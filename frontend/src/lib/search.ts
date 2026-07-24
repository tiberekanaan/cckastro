import { STRAPI_URL, softFetchStrapi, richTextToPlain } from "./strapi";
import type {
  NewsItem,
  Service,
  Project,
  Career,
  Commissioner,
  OfficialDocument,
  UafPage,
  TendersPage,
  PrivacyPage,
  TermsPage,
} from "../types/strapi";
import type { SearchEntry, SearchResult } from "../types/search";

/** Strip Markdown syntax down to plain text (for excerpts + matching). */
function markdownToPlain(md?: string | null): string {
  if (!md) return "";
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Soft fetch a Strapi single type: `data` object, or `null` when missing. */
async function softFetchSingle<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${STRAPI_URL}${path}`);
    if (!res.ok) {
      if (res.status !== 404) throw new Error(`Strapi ${path} → ${res.status}`);
      return null;
    }
    const json: { data: T | null } = await res.json();
    return json.data;
  } catch (err) {
    console.error(`[search] ${path} failed:`, err);
    return null;
  }
}

/**
 * Static routes whose copy lives in the frontend (or in `page` dynamic zones
 * too complex to index) — searchable via a curated summary + keywords.
 */
const STATIC_PAGES: SearchEntry[] = [
  {
    title: "Home",
    url: "/",
    category: "Page",
    text: "Communications Commission of Kiribati CCK homepage telecommunications ICT regulator latest updates services",
  },
  {
    title: "About Us",
    url: "/about",
    category: "Page",
    text: "About the Communications Commission of Kiribati mission vision commissioners organisation structure org chart who we are",
  },
  {
    title: "Contact",
    url: "/contact",
    category: "Page",
    text: "Contact the Communications Commission of Kiribati address phone email enquiry message form",
  },
  {
    title: "Distress Beacon Registration",
    url: "/distress-beacon",
    category: "Page",
    text: "Register a distress beacon EPIRB PLB ELT emergency position indicating radio beacon vessel aircraft owner emergency contact registration form",
  },
  {
    title: "Mobile Coverage",
    url: "/mobile-coverage",
    category: "Page",
    text: "Mobile network coverage by island operator Oceanlink Vodafone 2G 3G 4G quality of service signal",
  },
  {
    title: "Resources",
    url: "/resources",
    category: "Page",
    text: "Resources library official documents regulations rules PDF downloads",
  },
  {
    title: "News",
    url: "/news",
    category: "Page",
    text: "News articles announcements press releases latest updates",
  },
  {
    title: "Careers",
    url: "/careers",
    category: "Page",
    text: "Careers job openings vacancies employment positions apply deadline",
  },
  {
    title: "Tenders",
    url: "/tenders",
    category: "Page",
    text: "Tenders procurement application process customer portal bids",
  },
  {
    title: "Universal Access Fund",
    url: "/universal-access",
    category: "Page",
    text: "Universal Access Fund UAF projects connectivity outer islands telecommunications development",
  },
  {
    title: "Privacy Policy",
    url: "/privacy",
    category: "Page",
    text: "Privacy policy personal data protection information collection",
  },
  {
    title: "Terms of Use",
    url: "/terms",
    category: "Page",
    text: "Terms of use conditions website legal",
  },
];

/** Detail-route href per the slug standard (entries render before slug regen). */
const detailHref = (
  route: string,
  item: { slug?: string | null; documentId: string },
): string => `/${route}/${item.slug ?? item.documentId}`;

async function buildIndex(): Promise<SearchEntry[]> {
  const [
    news,
    services,
    projects,
    careers,
    commissioners,
    documents,
    uafPage,
    tendersPage,
    privacyPage,
    termsPage,
  ] = await Promise.all([
    softFetchStrapi<NewsItem>("/api/news?pagination[pageSize]=100"),
    softFetchStrapi<Service>("/api/services?pagination[pageSize]=100"),
    softFetchStrapi<Project>("/api/projects?pagination[pageSize]=100"),
    softFetchStrapi<Career>("/api/careers?pagination[pageSize]=100"),
    softFetchStrapi<Commissioner>("/api/commissioners?pagination[pageSize]=100"),
    softFetchStrapi<OfficialDocument>(
      "/api/official-documents?pagination[pageSize]=100",
    ),
    softFetchSingle<UafPage>("/api/uaf-page"),
    softFetchSingle<TendersPage>("/api/tenders-page"),
    softFetchSingle<PrivacyPage>("/api/privacy-page"),
    softFetchSingle<TermsPage>("/api/terms-page"),
  ]);

  const entries: SearchEntry[] = STATIC_PAGES.map((p) => ({ ...p }));

  // Merge live single-type copy into the matching static route entry.
  const singleTypeCopy: Record<string, string> = {
    "/universal-access": markdownToPlain(uafPage?.description),
    "/tenders": markdownToPlain(tendersPage?.description),
    "/privacy": markdownToPlain(privacyPage?.content),
    "/terms": markdownToPlain(termsPage?.content),
  };
  for (const entry of entries) {
    const copy = singleTypeCopy[entry.url];
    if (copy) entry.text = `${entry.text} ${copy}`;
  }

  for (const n of news) {
    if (!n.title) continue;
    entries.push({
      title: n.title,
      url: detailHref("news", n),
      category: "News",
      text: richTextToPlain(n.description),
    });
  }
  for (const s of services) {
    entries.push({
      title: s.title,
      url: detailHref("services", s),
      category: "Service",
      text: `${markdownToPlain(s.description)} ${markdownToPlain(s.content)}`.trim(),
    });
  }
  for (const p of projects) {
    if (!p.title) continue;
    entries.push({
      title: p.title,
      url: detailHref("projects", p),
      category: "Project",
      text: richTextToPlain(p.description),
    });
  }
  for (const c of careers) {
    entries.push({
      title: c.title,
      url: detailHref("careers", c),
      category: "Career",
      text: markdownToPlain(c.description),
    });
  }
  for (const c of commissioners) {
    if (!c.name) continue;
    entries.push({
      title: c.name,
      url: detailHref("commissioners", c),
      category: "Commissioner",
      text: `${c.role ?? ""} ${markdownToPlain(c.background)}`.trim(),
    });
  }
  for (const d of documents) {
    entries.push({
      title: d.title,
      // No detail page — deep-link into the Resources library pre-filtered.
      url: `/resources?q=${encodeURIComponent(d.title)}`,
      category: "Document",
      text: d.type,
    });
  }

  return entries;
}

/** Module-scope index cache so keystroke-driven requests don't hammer Strapi. */
let cachedIndex: SearchEntry[] | null = null;
let cachedAt = 0;
const INDEX_TTL_MS = 60_000;

async function getIndex(): Promise<SearchEntry[]> {
  if (!cachedIndex || Date.now() - cachedAt > INDEX_TTL_MS) {
    cachedIndex = await buildIndex();
    cachedAt = Date.now();
  }
  return cachedIndex;
}

const EXCERPT_LENGTH = 160;

/** Excerpt centred on the first match, clipped to whole words where possible. */
function makeExcerpt(text: string, query: string): string {
  if (!text) return "";
  const at = text.toLowerCase().indexOf(query);
  if (at === -1) {
    return text.length <= EXCERPT_LENGTH
      ? text
      : `${text.slice(0, EXCERPT_LENGTH).trimEnd()}…`;
  }
  const start = Math.max(0, at - Math.floor((EXCERPT_LENGTH - query.length) / 2));
  const end = Math.min(text.length, start + EXCERPT_LENGTH);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}

const MAX_RESULTS = 20;

/** Case-insensitive substring search over the index; title hits rank first. */
export async function searchSite(query: string): Promise<SearchResult[]> {
  const q = query.toLowerCase();
  const index = await getIndex();
  return index
    .map((entry) => {
      const inTitle = entry.title.toLowerCase().includes(q);
      const inText = entry.text.toLowerCase().includes(q);
      if (!inTitle && !inText) return null;
      return { entry, score: inTitle ? 2 : 1 };
    })
    .filter((hit): hit is { entry: SearchEntry; score: number } => hit !== null)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, MAX_RESULTS)
    .map(({ entry }) => ({
      title: entry.title,
      url: entry.url,
      category: entry.category,
      excerpt: makeExcerpt(entry.text, q),
    }));
}

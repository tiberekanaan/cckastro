import type { IconName } from "./content";

/**
 * Strapi 5 API response types (flattened — no `.attributes` wrappers).
 * Entries are keyed by a 24-char alphanumeric `documentId`.
 */

export interface StrapiMedia {
  url: string;
  alternativeText?: string | null;
  width?: number | null;
  height?: number | null;
}

/* --- Rich text (Strapi "blocks" field) --- */
export interface StrapiTextNode {
  type: "text";
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

export interface StrapiLinkNode {
  type: "link";
  url: string;
  children: StrapiInlineNode[];
}

export type StrapiInlineNode = StrapiTextNode | StrapiLinkNode;

export interface StrapiBlockNode {
  type: "paragraph" | "heading" | "list" | "list-item" | "quote" | "code";
  level?: number;
  format?: "ordered" | "unordered";
  children: (StrapiInlineNode | StrapiBlockNode)[];
}

export type StrapiRichText = StrapiBlockNode[];

/* --- Dynamic-zone blocks --- */
interface BlockBase {
  __component: string;
  id: number;
}

export interface HeroBlock extends BlockBase {
  __component: "blocks.hero";
  title: string;
  subtitle?: string | null;
  image?: StrapiMedia | null;
  buttonText?: string | null;
  buttonLink?: string | null;
}

export interface ServiceItem {
  id: number;
  title: string;
  summary?: string | null;
  icon: IconName;
  href?: string | null;
}

export interface ServicesGridBlock extends BlockBase {
  __component: "blocks.services-grid";
  eyebrow?: string | null;
  heading?: string | null;
  services?: ServiceItem[];
}

export interface Service {
  id: number;
  documentId: string;
  title: string;
  description?: string | null;
  slug?: string | null;
  content?: string | null;
  image?: StrapiMedia | null;
}

export interface FeaturedServicesBlock extends BlockBase {
  __component: "blocks.featured-services";
  eyebrow?: string | null;
  heading?: string | null;
  services?: Service[];
  image?: StrapiMedia | null;
}

export interface LatestNewsBlock extends BlockBase {
  __component: "blocks.latest-news";
  title?: string | null;
  image?: StrapiMedia | null;
}

export interface CtaBlock extends BlockBase {
  __component: "blocks.cta";
  variant?: "primary" | "danger";
  title: string;
  body?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  image?: StrapiMedia | null;
}

export interface MarketInsightBlock extends BlockBase {
  __component: "blocks.market-insight";
  label?: string | null;
  value?: string | null;
}

export interface MarketInsightItem {
  id: number;
  label?: string | null;
  value?: string | null;
  iconName?: string | null;
}

export interface MarketInsightsSectionBlock extends BlockBase {
  __component: "blocks.market-insights-section";
  title?: string | null;
  image?: StrapiMedia | null;
  insights?: MarketInsightItem[];
}

export interface ProfileCardBlock extends BlockBase {
  __component: "blocks.profile-card";
  name?: string | null;
  title?: string | null;
  photo?: StrapiMedia | null;
}

export interface RichTextBlock extends BlockBase {
  __component: "blocks.rich-text";
  content?: StrapiRichText;
}

export interface FaqBlock extends BlockBase {
  __component: "blocks.faq";
  question?: string | null;
  answer?: StrapiRichText;
}

export interface FormBlock extends BlockBase {
  __component: "blocks.form";
  formType?: "General Inquiry" | "Registration";
}

export interface OrgChartBlock extends BlockBase {
  __component: "blocks.org-chart";
  title?: string | null;
  description?: string | null;
}

export interface Commissioner {
  id: number;
  documentId: string;
  name?: string | null;
  role?: string | null;
  slug?: string | null;
  image?: StrapiMedia | null;
  /** Strapi `richtext` field → Markdown string (rendered via `marked`). */
  background?: string | null;
}

export interface CommissionerProfilesBlock extends BlockBase {
  __component: "blocks.commissioner-profiles";
  eyebrow?: string | null;
  heading?: string | null;
  commissioners?: Commissioner[];
}

export type PageBlock =
  | HeroBlock
  | ServicesGridBlock
  | FeaturedServicesBlock
  | LatestNewsBlock
  | CtaBlock
  | MarketInsightBlock
  | MarketInsightsSectionBlock
  | ProfileCardBlock
  | RichTextBlock
  | FaqBlock
  | FormBlock
  | OrgChartBlock
  | CommissionerProfilesBlock;

/* --- Collection types --- */
export interface StrapiPage {
  id: number;
  documentId: string;
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  content?: PageBlock[];
}

export interface NewsItem {
  id: number;
  documentId: string;
  title?: string | null;
  date?: string | null;
  description?: StrapiRichText;
  photo?: StrapiMedia | null;
}

export interface Project {
  id: number;
  documentId: string;
  title?: string | null;
  description?: StrapiRichText;
  photos?: StrapiMedia[] | null;
}

/** UAF single type. `description` is a Strapi `richtext` (Markdown) field. */
export interface UafPage {
  id: number;
  documentId: string;
  title?: string | null;
  description?: string | null;
}

export interface OfficialDocument {
  id: number;
  documentId: string;
  title: string;
  type: "Regulation" | "Rule";
  file?: StrapiMedia | null;
}

export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiCollectionResponse<T> {
  data: T[];
  meta: { pagination?: StrapiPagination };
}

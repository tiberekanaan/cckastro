export type SearchCategory =
  | "Page"
  | "News"
  | "Service"
  | "Project"
  | "Career"
  | "Commissioner"
  | "Document";

/** One hit returned by `/api/search.json`. */
export interface SearchResult {
  title: string;
  url: string;
  category: SearchCategory;
  excerpt: string;
}

export interface SearchResponse {
  results: SearchResult[];
}

/** Internal index entry — `text` is the flattened, searchable page content. */
export interface SearchEntry {
  title: string;
  url: string;
  category: SearchCategory;
  text: string;
}

// Editors may enter scheme-less external links ("portal.cck.ki"); without a
// scheme the browser resolves them relative to cck.ki. A leading domain-like
// segment (contains a dot) means external → https://; otherwise internal path.
export function normalizeButtonLink(href: string): string {
  const trimmed = href.trim();
  if (trimmed === "") return "#";
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(trimmed)) return trimmed;
  const firstSegment = trimmed.split("/")[0];
  return firstSegment.includes(".") ? `https://${trimmed}` : `/${trimmed}`;
}

export function isExternalLink(href: string): boolean {
  return /^https?:/i.test(href);
}

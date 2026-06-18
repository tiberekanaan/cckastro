/**
 * Site chrome + single-instance content (nav, hero, CTAs, footer).
 * Typed module today; maps cleanly to Strapi single types later.
 */

export interface NavLink {
  label: string;
  href: string;
}

export const site = {
  name: "Communications Commission of Kiribati",
  shortName: "CCK",
  email: "info@cck.gov.ki",
  phone: "+686 7501 0000",
  address: "Bairiki, Tarawa, Kiribati",
  nav: [
    { label: "About Us", href: "/about" },
    { label: "Distress Beacon", href: "/distress-beacon" },
    { label: "Resources", href: "/resources" },
    { label: "News", href: "/news" },
    { label: "UAF", href: "/universal-access" },
  ] satisfies NavLink[],
  hero: {
    eyebrow: "National Telecommunications Regulator",
    title: "Regulating Kiribati's telecommunication market",
    body: "We license operators, set technical standards, protect consumers, and manage spectrum — building a connected nation that benefits all citizens.",
    primaryCta: { label: "About Us", href: "/about" },
    secondaryCta: { label: "Read Our Strategy", href: "/strategy" },
  },
  distress: {
    title: "Do you own a distress beacon?",
    body: "Registering your 406 MHz beacon helps search-and-rescue teams find you faster in an emergency. It's free and only takes a few minutes.",
    cta: { label: "Register Now", href: "/distress-beacon" },
  },
  help: {
    title: "We are here to help",
    body: "Have a question about licensing, consumer rights, or telecom services in Kiribati? Our team is ready to assist.",
    cta: { label: "Contact Us", href: "/contact" },
  },
  footer: {
    columns: [
      {
        heading: "Commission",
        links: [
          { label: "About Us", href: "/about" },
          { label: "Our Strategy", href: "/strategy" },
          { label: "Careers", href: "/careers" },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        heading: "Services",
        links: [
          { label: "Licensing", href: "/services/licensing" },
          { label: "Type Approval", href: "/services/type-approval" },
          { label: "Domain Name (.ki)", href: "/services/domain-name" },
          { label: "Numbering", href: "/services/numbering" },
        ],
      },
      {
        heading: "Resources",
        links: [
          { label: "Public Consultations", href: "/consultations" },
          { label: "Reports", href: "/resources/reports" },
          { label: "Legislation", href: "/resources/legislation" },
          { label: "Beacon Registry", href: "/distress-beacon" },
        ],
      },
    ],
  },
} as const;

export type Site = typeof site;

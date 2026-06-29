import type { Core } from '@strapi/strapi';

// Public-read actions required by the frontend org chart.
const PUBLIC_ACTIONS = [
  'api::org-role.org-role.find',
  'api::org-role.org-role.findOne',
  // Commissioner profiles: card grid (find) + detail page / dynamic-zone relation (findOne).
  'api::commissioner.commissioner.find',
  'api::commissioner.commissioner.findOne',
  // Distress beacon: unauthenticated public form submissions.
  'api::distress-beacon.distress-beacon.create',
  // Careers: job listings (find) + detail page (findOne).
  'api::career.career.find',
  'api::career.career.findOne',
  // Careers page: editable page copy single type.
  'api::careers-page.careers-page.find',
  // Tenders page: editable application-process copy single type.
  'api::tenders-page.tenders-page.find',
  // Navigation: editable header links + footer columns single type.
  'api::navigation.navigation.find',
  // Legal pages: editable Privacy + Terms copy single types.
  'api::privacy-page.privacy-page.find',
  'api::terms-page.terms-page.find',
  // Global settings: editable site assets + contact info single type.
  'api::global-setting.global-setting.find',
  // Mobile coverage: public island/village coverage table.
  'api::mobile-coverage.mobile-coverage.find',
];

// Collections whose `slug` UID must be backfilled for pre-existing entries.
const SLUGGED_TYPES = [
  'api::new.new',
  'api::project.project',
  'api::career.career',
] as const;

// Mirror Strapi's UID generation (lowercase, alphanumeric, hyphen-separated).
const slugify = (input: string): string =>
  input
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';

const uniqueSlug = (base: string, used: Set<string>): string => {
  let slug = base;
  let i = 2;
  while (used.has(slug)) slug = `${base}-${i++}`;
  return slug;
};

// Generate a clean slug from the title for any entry still missing one.
async function backfillSlugs(strapi: Core.Strapi): Promise<void> {
  for (const uid of SLUGGED_TYPES) {
    try {
      const docService = strapi.documents(uid as any) as any;
      const docs = await docService.findMany({
        status: 'draft',
        fields: ['title', 'slug'],
        limit: 1000,
      });

      const used = new Set<string>(
        docs.map((d: any) => d.slug).filter(Boolean),
      );

      for (const doc of docs as any[]) {
        if (doc.slug || !doc.title) continue;
        const slug = uniqueSlug(slugify(doc.title), used);
        used.add(slug);

        await docService.update({ documentId: doc.documentId, data: { slug } });

        // Propagate to the live version only if the entry was already published.
        const published = await docService.findOne({
          documentId: doc.documentId,
          status: 'published',
          fields: ['id'],
        });
        if (published) {
          await docService.publish({ documentId: doc.documentId });
        }

        strapi.log.info(`[slug-backfill] ${uid} ${doc.documentId} → "${slug}"`);
      }
    } catch (err) {
      strapi.log.error(`[slug-backfill] failed for ${uid}: ${err}`);
    }
  }
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Grant the public role read access to org-roles (idempotent).
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });
    if (!publicRole) return;

    for (const action of PUBLIC_ACTIONS) {
      const existing = await strapi
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action, role: publicRole.id } });
      if (!existing) {
        await strapi
          .query('plugin::users-permissions.permission')
          .create({ data: { action, role: publicRole.id } });
      }
    }

    // Backfill clean slugs for entries created before the `slug` field existed.
    await backfillSlugs(strapi);
  },
};

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
];

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
  },
};

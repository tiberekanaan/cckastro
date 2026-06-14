/**
 * One-off seed for the Org Chart (api::org-role.org-role).
 * - Creates a CCK org hierarchy via the Document Service API.
 * - Links children to parents through the `reportsTo` self-relation (by documentId).
 * - Idempotent: skips creation if any org roles already exist.
 *
 * Run with the dev server stopped:  node scripts/seed-org-roles.js
 */
const { compileStrapi, createStrapi } = require("@strapi/strapi");

// Parent is referenced by roleTitle; resolved to documentId at insert time.
const ROLES = [
  { roleTitle: "Director General", personName: "Jane Mwangi", reportsTo: null },
  { roleTitle: "Director, Licensing", personName: "Peter Otieno", reportsTo: "Director General" },
  { roleTitle: "Director, Spectrum Management", personName: "Aisha Hassan", reportsTo: "Director General" },
  { roleTitle: "Director, Consumer Affairs", personName: "Samuel Kariuki", reportsTo: "Director General" },
  { roleTitle: "Director, Corporate Services", personName: "Grace Wanjiru", reportsTo: "Director General" },
  { roleTitle: "Manager, Frequency Planning", personName: "David Kimani", reportsTo: "Director, Spectrum Management" },
  { roleTitle: "Manager, Compliance", personName: "Mary Achieng", reportsTo: "Director, Licensing" },
  { roleTitle: "Manager, Complaints", personName: "Brian Mutua", reportsTo: "Director, Consumer Affairs" },
];

async function main() {
  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = "error";

  const docs = app.documents("api::org-role.org-role");

  const existing = await docs.findMany({ status: "published" });
  if (existing.length > 0) {
    console.log(`Org roles already exist (${existing.length}); skipping seed.`);
    await app.destroy();
    return;
  }

  // roleTitle -> documentId, populated as we insert top-down.
  const idByTitle = {};

  for (const role of ROLES) {
    const created = await docs.create({
      data: {
        roleTitle: role.roleTitle,
        personName: role.personName,
        reportsTo: role.reportsTo ? idByTitle[role.reportsTo] : null,
      },
      status: "published",
    });
    idByTitle[role.roleTitle] = created.documentId;
    console.log(`Created: ${role.roleTitle} (${created.documentId})`);
  }

  console.log(`Seeded ${ROLES.length} org roles.`);
  await app.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

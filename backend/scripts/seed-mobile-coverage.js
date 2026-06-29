/**
 * Import the Mobile Coverage collection from the 2026 summary.
 * - Source data: ./mobile-coverage-2026.json (parsed from the CCK 2026
 *   "Mobile Coverage Summary" spreadsheet). populationCoverage is a percent
 *   integer; village fields are comma-separated lists.
 * - REPLACE semantics: deletes all existing rows, then inserts published ones.
 * Uses the Document Service API (Strapi 5).
 *
 * Run with the dev server stopped:  node scripts/seed-mobile-coverage.js
 */
const fs = require("fs");
const path = require("path");
const { compileStrapi, createStrapi } = require("@strapi/strapi");

const ROWS = JSON.parse(
  fs.readFileSync(path.join(__dirname, "mobile-coverage-2026.json"), "utf-8"),
);

async function main() {
  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = "error";

  const docs = app.documents("api::mobile-coverage.mobile-coverage");

  // Clear existing rows (drafts + published) so re-running is a clean re-import.
  const existing = await docs.findMany({ status: "draft", fields: ["documentId"] });
  for (const row of existing) {
    await docs.delete({ documentId: row.documentId });
  }
  if (existing.length) console.log(`Removed ${existing.length} existing rows.`);

  for (const row of ROWS) {
    const created = await docs.create({ data: row, status: "published" });
    console.log(
      `Created: ${row.island} / ${row.provider} (${created.documentId})`,
    );
  }

  console.log(`Imported ${ROWS.length} mobile coverage rows.`);
  await app.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

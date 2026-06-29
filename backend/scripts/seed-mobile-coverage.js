/**
 * One-off seed for the Mobile Coverage collection.
 * - Inserts published island/provider coverage rows with village-level detail.
 * - Idempotent: skips if any published rows already exist.
 * Uses the Document Service API (Strapi 5).
 *
 * NOTE: This is representative sample data — edit the figures in the Strapi
 * admin (Content Manager → Mobile Coverage) to match the real assessment.
 *
 * Run with the dev server stopped:  node scripts/seed-mobile-coverage.js
 */
const { compileStrapi, createStrapi } = require("@strapi/strapi");

// island / provider rows. Village fields are comma-separated lists; the
// frontend splits on commas + newlines. qos ∈ Good | Average | Poor.
const ROWS = [
  {
    island: "South Tarawa",
    provider: "ATHKL (Vodafone)",
    networkType: "4G LTE",
    yearInspected: 2024,
    qos: "Good",
    populationCoverage: 96,
    villagesStrong: "Betio, Bairiki, Bikenibeu, Teaoraereke, Eita",
    villagesAverage: "Bonriki, Temaiku",
    villagesWeak: "Buota",
    villagesNoCoverage: "",
  },
  {
    island: "South Tarawa",
    provider: "Ocean Link",
    networkType: "3G/4G",
    yearInspected: 2024,
    qos: "Average",
    populationCoverage: 78,
    villagesStrong: "Betio, Bairiki",
    villagesAverage: "Bikenibeu, Teaoraereke, Eita",
    villagesWeak: "Bonriki, Temaiku",
    villagesNoCoverage: "Buota",
  },
  {
    island: "Kiritimati",
    provider: "ATHKL (Vodafone)",
    networkType: "4G LTE",
    yearInspected: 2023,
    qos: "Average",
    populationCoverage: 82,
    villagesStrong: "London, Tabwakea",
    villagesAverage: "Banana",
    villagesWeak: "Poland",
    villagesNoCoverage: "",
  },
  {
    island: "Abaiang",
    provider: "ATHKL (Vodafone)",
    networkType: "3G",
    yearInspected: 2023,
    qos: "Poor",
    populationCoverage: 54,
    villagesStrong: "Tuarabu",
    villagesAverage: "Tabontebike, Koinawa",
    villagesWeak: "Tebunginako",
    villagesNoCoverage: "Ribono, Nuotaea",
  },
  {
    island: "Tabiteuea North",
    provider: "ATHKL (Vodafone)",
    networkType: "3G",
    yearInspected: 2022,
    qos: "Poor",
    populationCoverage: 41,
    villagesStrong: "Utiroa",
    villagesAverage: "Tanaeang",
    villagesWeak: "Eita, Aiwa",
    villagesNoCoverage: "Tekabwibwi, Buariki",
  },
];

async function main() {
  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = "error";

  const docs = app.documents("api::mobile-coverage.mobile-coverage");

  const existing = await docs.findMany({ status: "published" });
  if (existing.length > 0) {
    console.log(
      `Mobile coverage rows already exist (${existing.length}); skipping seed.`,
    );
    await app.destroy();
    return;
  }

  for (const row of ROWS) {
    const created = await docs.create({ data: row, status: "published" });
    console.log(
      `Created: ${row.island} / ${row.provider} (${created.documentId})`,
    );
  }

  console.log(`Seeded ${ROWS.length} mobile coverage rows.`);
  await app.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

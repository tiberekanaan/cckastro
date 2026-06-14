/**
 * One-off seed for the About Us page.
 * - Creates (or reuses) a page with slug "about".
 * - Ensures it contains a `blocks.org-chart` block.
 * Idempotent: won't duplicate the page or the block.
 *
 * Run with the dev server stopped:  node scripts/seed-about-page.js
 */
const { compileStrapi, createStrapi } = require("@strapi/strapi");

const ORG_CHART_BLOCK = {
  __component: "blocks.org-chart",
  title: "Our Organization",
  description:
    "The CCK leadership and reporting structure across licensing, spectrum, consumer affairs and corporate services.",
};

async function main() {
  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = "error";

  const docs = app.documents("api::page.page");

  const [existing] = await docs.findMany({
    filters: { slug: "about" },
    status: "draft",
    populate: { content: { on: { "blocks.org-chart": { populate: "*" } } } },
  });

  if (existing) {
    const hasOrgChart = (existing.content ?? []).some(
      (b) => b.__component === "blocks.org-chart",
    );
    if (hasOrgChart) {
      console.log("About page already has an org-chart block; nothing to do.");
      await app.destroy();
      return;
    }
    // Preserve existing blocks (strip ids), append org-chart.
    const content = (existing.content ?? []).map(({ id, ...rest }) => rest);
    content.push(ORG_CHART_BLOCK);
    await docs.update({
      documentId: existing.documentId,
      data: { content },
    });
    await docs.publish({ documentId: existing.documentId });
    console.log(`Appended org-chart block to existing About page (${existing.documentId}).`);
    await app.destroy();
    return;
  }

  const created = await docs.create({
    data: {
      title: "About Us",
      slug: "about",
      description: "About the Communications Commission of Kenya.",
      content: [ORG_CHART_BLOCK],
    },
  });
  await docs.publish({ documentId: created.documentId });
  console.log(`Created About page with org-chart block (${created.documentId}).`);

  await app.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

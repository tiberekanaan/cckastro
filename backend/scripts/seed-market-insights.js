/**
 * One-off seed for the Market Insights Z-pattern block.
 * - Appends a `blocks.market-insights-section` block (title + image + insights).
 * Uses the Document Service API; preserves all existing blocks.
 *
 * Run with the dev server stopped:  node scripts/seed-market-insights.js
 */
const { compileStrapi, createStrapi } = require("@strapi/strapi");

const MI_IMAGE_ID = 2; // 9.webp
const MI_TITLE = "Market at a glance";
const MI_INSIGHTS = [
  { label: "Active subscribers", value: "120K+", iconName: "lucide:users" },
  { label: "Mobile penetration", value: "63%", iconName: "lucide:signal" },
  { label: "Licensed operators", value: "4", iconName: "lucide:building-2" },
  { label: "Network uptime", value: "99.2%", iconName: "lucide:activity" },
];

// Backfill iconName onto existing insights, keyed by label.
const ICON_BY_LABEL = Object.fromEntries(
  MI_INSIGHTS.map((i) => [i.label, i.iconName]),
);

async function main() {
  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = "error";

  const docs = app.documents("api::page.page");
  const [page] = await docs.findMany({
    filters: { slug: "home" },
    status: "draft",
    populate: {
      content: {
        on: {
          "blocks.hero": { populate: { image: true } },
          "blocks.featured-services": {
            populate: { services: true, image: true },
          },
          "blocks.latest-news": { populate: { image: true } },
          "blocks.market-insights-section": {
            populate: { image: true, insights: true },
          },
        },
      },
    },
  });

  if (!page) throw new Error("home page not found");

  let hasMarketInsights = false;
  const content = [];

  for (const block of page.content ?? []) {
    switch (block.__component) {
      case "blocks.hero":
        content.push({
          __component: "blocks.hero",
          title: block.title,
          subtitle: block.subtitle,
          image: block.image?.id ?? null,
          buttonText: block.buttonText,
          buttonLink: block.buttonLink,
        });
        break;
      case "blocks.featured-services":
        content.push({
          __component: "blocks.featured-services",
          eyebrow: block.eyebrow,
          heading: block.heading,
          services: (block.services ?? []).map((s) => s.documentId),
          image: block.image?.id ?? null,
        });
        break;
      case "blocks.latest-news":
        content.push({
          __component: "blocks.latest-news",
          title: block.title,
          image: block.image?.id ?? null,
        });
        break;
      case "blocks.market-insights-section":
        hasMarketInsights = true;
        content.push({
          __component: "blocks.market-insights-section",
          title: block.title ?? MI_TITLE,
          image: block.image?.id ?? MI_IMAGE_ID,
          insights: (block.insights ?? []).map((i) => ({
            label: i.label,
            value: i.value,
            iconName: ICON_BY_LABEL[i.label] ?? i.iconName ?? null,
          })),
        });
        break;
      default:
        content.push(block);
    }
  }

  if (!hasMarketInsights) {
    content.push({
      __component: "blocks.market-insights-section",
      title: MI_TITLE,
      image: MI_IMAGE_ID,
      insights: MI_INSIGHTS,
    });
  }

  await docs.update({
    documentId: page.documentId,
    status: "draft",
    data: { content },
  });
  await docs.publish({ documentId: page.documentId });

  console.log(
    "Seed complete →",
    JSON.stringify({
      documentId: page.documentId,
      marketInsightsAppended: !hasMarketInsights,
      blocks: content.map((b) => b.__component),
    }),
  );

  await app.destroy();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

/**
 * One-off seed for the Z-pattern redesign fields.
 * - Attaches an image to the existing `blocks.featured-services` block.
 * - Appends a `blocks.latest-news` block (title + image).
 * Uses the Document Service API; preserves all existing blocks.
 *
 * Run with the dev server stopped:  node scripts/seed-new-fields.js
 */
const { compileStrapi, createStrapi } = require("@strapi/strapi");

const FS_IMAGE_ID = 2; // 9.webp
const NEWS_IMAGE_ID = 1; // signing.jpg
const NEWS_TITLE = "Latest News";

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
        },
      },
    },
  });

  if (!page) throw new Error("home page not found");

  let hasLatestNews = false;
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
          image: FS_IMAGE_ID,
        });
        break;
      case "blocks.latest-news":
        hasLatestNews = true;
        content.push({
          __component: "blocks.latest-news",
          title: block.title ?? NEWS_TITLE,
          image: NEWS_IMAGE_ID,
        });
        break;
      default:
        content.push(block);
    }
  }

  if (!hasLatestNews) {
    content.push({
      __component: "blocks.latest-news",
      title: NEWS_TITLE,
      image: NEWS_IMAGE_ID,
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
      latestNewsAppended: !hasLatestNews,
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

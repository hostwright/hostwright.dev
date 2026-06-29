// Build the social card (public/og.png) from the project's own logo artwork.
// Resilient: if sharp or the source art is missing, log and continue so the
// build still succeeds (BUILD_STATUS.md records the outcome).
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pub = (f) => resolve(root, "public", f);

const W = 1200;
const H = 630;

const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect x="40" y="40" width="1120" height="550" rx="18" fill="none" stroke="#e4e1da" stroke-width="2"/>
  <text x="100" y="442" font-family="Helvetica, Arial, sans-serif" font-size="32" fill="#585d63">Desired-state container control for Apple silicon Macs.</text>
  <text x="100" y="556" font-family="'Courier New', monospace" font-size="24" fill="#646973">hostwright.dev</text>
  <text x="1100" y="556" text-anchor="end" font-family="'Courier New', monospace" font-size="24" fill="#646973">Apache-2.0 · Early design</text>
</svg>`;

try {
  const { default: sharp } = await import("sharp");
  const mark = await sharp(pub("hostwright-mark.png")).resize({ height: 104 }).toBuffer();
  const wordmark = await sharp(pub("hostwright-wordmark.png")).resize({ height: 92 }).toBuffer();

  await sharp({
    create: { width: W, height: H, channels: 4, background: "#faf9f6" },
  })
    .composite([
      { input: Buffer.from(overlay), top: 0, left: 0 },
      { input: mark, top: 88, left: 96 },
      { input: wordmark, top: 244, left: 96 },
    ])
    .png()
    .toFile(pub("og.png"));
  console.log("[og] wrote public/og.png");
} catch (err) {
  console.warn(`[og] skipped og.png generation: ${err.message}`);
}

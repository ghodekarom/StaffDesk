/**
 * Icon generation script for StaffDesk PWA.
 * Run once: node scripts/generate-icons.mjs
 * Requires: sharp (installed as a devDependency)
 */
import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(
  "C:\\Users\\Gaurav Kadam\\.gemini\\antigravity-ide\\brain\\83981ec3-9415-45a3-809c-69799a530389",
  "staffdesk_icon_1787993107787.jpg"
);
const OUT = join(ROOT, "public", "icons");

mkdirSync(OUT, { recursive: true });

const srcBuffer = readFileSync(SRC);

const icons = [
  { name: "icon-192x192.png",        size: 192 },
  { name: "icon-256x256.png",        size: 256 },
  { name: "icon-384x384.png",        size: 384 },
  { name: "icon-512x512.png",        size: 512 },
  { name: "apple-touch-icon.png",    size: 180 },
  { name: "favicon-32x32.png",       size: 32  },
];

// Maskable icon: add 20% safe-zone padding on a solid bg
const MASKABLE_SIZE = 512;
const INNER = Math.round(MASKABLE_SIZE * 0.6); // 60% = within safe zone

async function run() {
  for (const { name, size } of icons) {
    await sharp(srcBuffer)
      .resize(size, size, { fit: "cover" })
      .png()
      .toFile(join(OUT, name));
    console.log(`✓ ${name}`);
  }

  // Maskable icon: dark bg + centred icon at 60% size
  const innerImg = await sharp(srcBuffer)
    .resize(INNER, INNER, { fit: "cover" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: MASKABLE_SIZE,
      height: MASKABLE_SIZE,
      channels: 4,
      background: { r: 15, g: 17, b: 23, alpha: 1 }, // #0f1117
    },
  })
    .composite([
      {
        input: innerImg,
        gravity: "centre",
      },
    ])
    .png()
    .toFile(join(OUT, "icon-maskable-512x512.png"));
  console.log("✓ icon-maskable-512x512.png");

  console.log("\nAll icons generated in public/icons/");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Generates all PWA icons, apple-touch-icon, and favicons from the actual
 * StaffDesk SVG vector logo used throughout the website.
 *
 * Usage: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "icons");

mkdirSync(OUT, { recursive: true });

function generateSvg({ size, scale, bg = "#0f1117", rx = 0 }) {
  const contentSize = 32 * scale;
  const offset = (size - contentSize) / 2;

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  ${bg ? `<rect width="${size}" height="${size}" rx="${rx}" fill="${bg}"/>` : ""}
  <g transform="translate(${offset}, ${offset}) scale(${scale})">
    <path
      d="M22 10.5C22 14.0899 19.0899 17 15.5 17H10V10.5C10 6.91015 12.9101 4 16.5 4H22V10.5Z"
      fill="url(#icon-grad-1)"
    />
    <path
      d="M10 21.5C10 17.9101 12.9101 15 16.5 15H22V21.5C22 25.0899 19.0899 28 15.5 28H10V21.5Z"
      fill="url(#icon-grad-2)"
    />
    <defs>
      <linearGradient id="icon-grad-1" x1="10" y1="4" x2="22" y2="17" gradientUnits="userSpaceOnUse">
        <stop stop-color="#2DD4BF" />
        <stop offset="1" stop-color="#3B82F6" />
      </linearGradient>
      <linearGradient id="icon-grad-2" x1="10" y1="15" x2="22" y2="28" gradientUnits="userSpaceOnUse">
        <stop stop-color="#3B82F6" />
        <stop offset="1" stop-color="#A855F7" />
      </linearGradient>
    </defs>
  </g>
</svg>
`;
}

const icons = [
  { name: "icon-192x192.png", size: 192, scale: 4.5 },
  { name: "icon-256x256.png", size: 256, scale: 6.0 },
  { name: "icon-384x384.png", size: 384, scale: 9.0 },
  { name: "icon-512x512.png", size: 512, scale: 12.0 },
  { name: "apple-touch-icon.png", size: 180, scale: 4.2 },
  { name: "favicon-32x32.png", size: 32, scale: 0.8 },
];

async function run() {
  // Generate standard icons
  for (const { name, size, scale } of icons) {
    const svgBuffer = Buffer.from(generateSvg({ size, scale, bg: "#0f1117" }));
    await sharp(svgBuffer)
      .png()
      .toFile(join(OUT, name));
    console.log(`✓ ${name} (${size}x${size})`);
  }

  // Maskable icon: centered within 60% safe zone
  const maskableSvg = Buffer.from(
    generateSvg({ size: 512, scale: 9.2, bg: "#0f1117" })
  );
  await sharp(maskableSvg)
    .png()
    .toFile(join(OUT, "icon-maskable-512x512.png"));
  console.log("✓ icon-maskable-512x512.png (512x512 maskable)");

  // Also write favicon.ico to public/ and app/ if needed
  const faviconSvg = Buffer.from(generateSvg({ size: 32, scale: 0.85, bg: "#0f1117" }));
  await sharp(faviconSvg)
    .png()
    .toFile(join(__dirname, "..", "public", "favicon.ico"));
  console.log("✓ public/favicon.ico");

  console.log("\nAll PWA and browser icons successfully regenerated with the exact StaffDesk website logo!");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

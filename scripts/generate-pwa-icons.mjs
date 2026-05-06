/**
 * Menghasilkan ulang PNG ikon PWA MoneyLog (hijau tema).
 * Jalankan: npm run icons
 */
import sharp from "sharp";
import { writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../public/icons");

/** SVG satu ukuran: dompet putih di atas gradien hijau (tanpa teks). */
function iconSvg(size, maskable) {
  const rx = Math.round(size * 0.22);
  const scale = maskable ? size * 0.0168 : size * 0.0195;
  const gY = size * 0.5;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1a8a38"/>
      <stop offset="1" stop-color="#136f2b"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${rx}" fill="url(#bg)"/>
  <g transform="translate(${size / 2} ${gY}) scale(${scale}) translate(-12 -12)" fill="none" stroke="#ffffff" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
    <path d="M3 5v14a2 2 0 0 0 2 2h15v-5"/>
  </g>
</svg>`;
}

async function writePng(filename, size, maskable) {
  const buf = await sharp(Buffer.from(iconSvg(size, maskable)))
    .png()
    .toBuffer();
  await writeFile(join(OUT, filename), buf);
  console.log("wrote", filename);
}

await writePng("icon-512.png", 512, false);
await writePng("icon-192.png", 192, false);
await writePng("icon-maskable-512.png", 512, true);
await writePng("icon-maskable-192.png", 192, true);
await writePng("apple-touch-icon.png", 180, false);

console.log("Done — ikon hijau tema (#136f2b).");

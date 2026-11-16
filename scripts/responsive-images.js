/* Vite plugin: responsive copies of every uploaded artwork.

   CMS uploads are full-size phone photos (roughly 2000x3000, ~2 MB). The
   grid and the home carousel show them at a few hundred pixels wide, but
   the browser still downloads and decodes the full image: about 27 MB of
   memory each once decoded. On phones that makes scrolling slow, and iOS
   Safari can kill the tab ("A problem repeatedly occurred").

   Before every dev or build run, this writes WebP copies of each file in
   public/uploads at a few widths into public/_img/, and a manifest
   (src/generated/images.json) with each image's size and available widths.
   src/lib/content.js reads the manifest to build srcset attributes. Copies
   that are already newer than their source are skipped, so repeat runs are
   fast. Both output paths are gitignored; CI regenerates them. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'public', 'uploads');
const outDir = path.join(root, 'public', '_img');
const manifestPath = path.join(root, 'src', 'generated', 'images.json');

const WIDTHS = [480, 960, 1600];
const EXT = /\.(jpe?g|png|webp|avif|tiff?)$/i;

async function generate(log) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });

  const manifest = {};
  let made = 0;

  for (const file of fs.readdirSync(srcDir)) {
    if (!EXT.test(file)) continue;
    const src = path.join(srcDir, file);
    const srcTime = fs.statSync(src).mtimeMs;
    const stem = file.replace(EXT, '');

    try {
      // .rotate() applies EXIF orientation so phone photos aren't sideways.
      const meta = await sharp(src).rotate().metadata();
      const swap = meta.orientation >= 5;
      const width = swap ? meta.height : meta.width;
      const height = swap ? meta.width : meta.height;

      const widths = WIDTHS.filter((w) => w < width);
      // Always provide at least one copy, even for small sources.
      if (!widths.length) widths.push(width);

      for (const w of widths) {
        const out = path.join(outDir, `${stem}-${w}.webp`);
        if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= srcTime) continue;
        await sharp(src).rotate().resize({ width: w }).webp({ quality: 80 }).toFile(out);
        made++;
      }

      manifest[`/uploads/${file}`] = { width, height, stem, widths };
    } catch (err) {
      log(`[responsive-images] skipped ${file}: ${err.message}`);
    }
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  if (made) log(`[responsive-images] wrote ${made} resized images`);
}

export default function responsiveImages() {
  return {
    name: 'responsive-images',
    async buildStart() {
      await generate((msg) => this.info?.(msg) ?? console.log(msg));
    },
  };
}

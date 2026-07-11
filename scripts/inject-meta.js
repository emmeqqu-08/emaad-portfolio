/* Post-build step: bake the artist-editable title & description from
   src/content/site.json into dist/index.html.

   Why: this is a single-page app, but social-embed crawlers (Slack,
   Discord, iMessage, Twitter/X, Facebook) and search engines read the
   *served* HTML without running JavaScript. So the tab title and the
   link-preview description must be present in the static HTML, not only
   set at runtime. This script updates them after `vite build`. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sitePath = path.join(root, 'src', 'content', 'site.json');
const htmlPath = path.join(root, 'dist', 'index.html');

const site = JSON.parse(fs.readFileSync(sitePath, 'utf8'));
const title = site.siteTitle || 'Portfolio';
const desc = site.metaDescription || '';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

let html = fs.readFileSync(htmlPath, 'utf8');

html = html
  .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
  .replace(
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${esc(desc)}" />`
  )
  .replace(
    /<meta property="og:title"[^>]*>/,
    `<meta property="og:title" content="${esc(title)}" />`
  )
  .replace(
    /<meta property="og:description"[^>]*>/,
    `<meta property="og:description" content="${esc(desc)}" />`
  );

fs.writeFileSync(htmlPath, html);
console.log(`inject-meta: set title="${title}"`);

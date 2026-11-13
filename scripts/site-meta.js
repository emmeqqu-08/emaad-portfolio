/* Vite plugin: page metadata for search engines and link previews.

   This is a single-page app, but social-embed crawlers (Slack, Discord,
   iMessage, X, Facebook) and search engines read the *served* HTML
   without running JavaScript. So this plugin:

   1. Fills index.html's title, description, Open Graph tags, canonical
      link and structured data (JSON-LD) from src/content/site.json. It
      runs in dev too, so the tab never flashes the placeholder title.
   2. At build time, writes works/index.html and about/index.html, copies
      of the app shell with their own title, description and canonical.
      GitHub Pages then serves those URLs with a 200 status instead of
      falling through to 404.html, so search engines can index them.
   3. Writes sitemap.xml listing those pages.

   Titles and descriptions come from src/lib/pageMeta.js, which the app
   also uses at runtime, so the two always match. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pageMeta, PAGES } from '../src/lib/pageMeta.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sitePath = path.join(root, 'src', 'content', 'site.json');
const worksDir = path.join(root, 'src', 'content', 'works');

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// JSON that is safe to place inside a <script> element.
function scriptJson(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .split(String.fromCharCode(0x2028)).join('\\u' + '2028')
    .split(String.fromCharCode(0x2029)).join('\\u' + '2029');
}

function readSite() {
  return JSON.parse(fs.readFileSync(sitePath, 'utf8'));
}

function countWorks() {
  return fs.readdirSync(worksDir).filter((f) => f.endsWith('.md')).length;
}

function pageUrl(siteUrl, route) {
  return siteUrl + (route === '/' ? '' : route.slice(1) + '/');
}

function isWebUrl(value) {
  try {
    return ['http:', 'https:'].includes(new URL(String(value).trim()).protocol);
  } catch {
    return false;
  }
}

function structuredData(site, siteUrl) {
  const sameAs = (Array.isArray(site.socials) ? site.socials : [])
    .map((s) => s && s.url)
    .filter(isWebUrl)
    .map((u) => u.trim());
  const person = {
    '@type': 'Person',
    '@id': `${siteUrl}#artist`,
    name: site.artistName,
    url: siteUrl,
  };
  if (sameAs.length) person.sameAs = sameAs;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      person,
      {
        '@type': 'WebSite',
        name: site.siteTitle || site.artistName,
        url: siteUrl,
        author: { '@id': `${siteUrl}#artist` },
      },
    ],
  };
}

/* Rewrite one page's head. `extraHead` is inserted before </head>. */
function applyMeta(html, { title, description, url }, extraHead = '') {
  const tags =
    `<link rel="canonical" href="${esc(url)}" />\n` +
    `    <meta property="og:url" content="${esc(url)}" />\n` +
    extraHead;
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(description)}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}" />`)
    .replace(
      /<meta property="og:description"[^>]*>/,
      `<meta property="og:description" content="${esc(description)}" />`
    )
    .replace(/<link rel="canonical"[^>]*>\s*/g, '')
    .replace(/<meta property="og:url"[^>]*>\s*/g, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '')
    .replace('</head>', `    ${tags}  </head>`);
}

/* siteUrl: the public URL of the home page, ending in "/". */
export default function siteMeta({ siteUrl }) {
  const base = siteUrl.endsWith('/') ? siteUrl : siteUrl + '/';

  return {
    name: 'site-meta',

    transformIndexHtml(html) {
      const site = readSite();
      const meta = pageMeta('/', site, countWorks());
      const ld = `<script type="application/ld+json">${scriptJson(structuredData(site, base))}</script>\n`;
      return applyMeta(html, { ...meta, url: base }, ld);
    },

    writeBundle(options) {
      const outDir = options.dir;
      const site = readSite();
      const workCount = countWorks();
      const shell = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');

      for (const route of PAGES) {
        if (route === '/') continue;
        const meta = pageMeta(route, site, workCount);
        const dir = path.join(outDir, route.slice(1));
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(
          path.join(dir, 'index.html'),
          applyMeta(shell, { ...meta, url: pageUrl(base, route) })
        );
      }

      const urls = PAGES.map((r) => `  <url><loc>${esc(pageUrl(base, r))}</loc></url>`).join('\n');
      fs.writeFileSync(
        path.join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
      );
    },
  };
}

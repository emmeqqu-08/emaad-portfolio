/* ============================================================
   Content loader
   Reads the markdown files Decap CMS writes into src/content/works
   at build time via Vite's import.meta.glob, and parses their
   YAML frontmatter into artwork objects the UI can render.

   The frontmatter schema is intentionally flat, so a small,
   dependency-free parser is more robust here than pulling Node
   polyfills into the browser bundle.
   ============================================================ */

import siteData from '../content/site.json';

export const site = siteData;

/* Eagerly import every work file as a raw string. */
const files = import.meta.glob('../content/works/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

/* --- Minimal, forgiving YAML-frontmatter parser -------------- */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};

  const lines = match[1].split('\n');
  const data = {};
  let currentListKey = null;

  for (const line of lines) {
    if (!line.trim()) continue;

    // list item:  "  - Painting"
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentListKey) {
      data[currentListKey].push(stripQuotes(listItem[1].trim()));
      continue;
    }

    // key: value
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (kv) {
      const key = kv[1];
      const value = kv[2].trim();
      if (value === '') {
        // could be the start of a list block
        currentListKey = key;
        data[key] = [];
      } else {
        currentListKey = null;
        data[key] = coerce(stripQuotes(value));
      }
    }
  }
  return data;
}

function stripQuotes(v) {
  return v.replace(/^["']|["']$/g, '');
}

function coerce(v) {
  if (v === 'true') return true;
  if (v === 'false') return false;
  return v;
}

/* --- Build the works array ----------------------------------- */
export const works = Object.entries(files)
  .map(([path, raw]) => {
    const fm = parseFrontmatter(raw);
    const slug = path.split('/').pop().replace(/\.md$/, '');
    return {
      slug,
      title: fm.title ?? 'Untitled',
      image: fm.image ?? '',
      year: fm.year ?? '',
      medium: fm.medium ?? '',
      dimensions: fm.dimensions ?? '',
      categories: Array.isArray(fm.categories) ? fm.categories : [],
      available: fm.available === true,
      uploadDate: fm.uploadDate ?? '',
      description: fm.description ?? '',
    };
  })
  // newest upload first by default
  .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

/* Categories for the filter UI. The artist manages the master list in
   the dashboard (site.categories), which controls order and wording. We
   fall back to auto-deriving from the works if that list is empty. Only
   categories that actually appear on at least one work are shown, so an
   unused category never renders an empty filter. */
export const allCategories = (() => {
  const used = new Set(works.flatMap((w) => w.categories));
  const managed = Array.isArray(site.categories) ? site.categories : [];
  if (managed.length) {
    return managed.filter((c) => used.has(c));
  }
  return [...used].sort();
})();

/* Hand-picked featured works for the home "Selected" strip.
   The artist chooses these by slug in the dashboard; if none are
   picked we fall back to the four most recently added pieces. */
export const featuredWorks = (() => {
  const picked = Array.isArray(site.featured) ? site.featured : [];
  const resolved = picked
    .map((slug) => works.find((w) => w.slug === slug))
    .filter(Boolean);
  return resolved.length ? resolved : works.slice(0, 4);
})();

/* Social links, normalized. Empty entries are dropped. The optional
   `icon` field lets the artist pick an icon in the dashboard; if unset
   we fall back to guessing from the platform name. */
export const socials = (Array.isArray(site.socials) ? site.socials : [])
  .filter((s) => s && s.url && s.platform)
  .map((s) => ({ platform: s.platform, url: s.url, icon: s.icon || '' }));

/* Per-page title and description.

   Shared by the app (which updates the tab title as you navigate) and by
   the build plugin in scripts/site-meta.js (which writes them into the
   static HTML for search engines and link previews), so both always
   agree. Everything comes from the CMS settings; nothing here is
   hand-written copy. Keep this file free of browser- or Vite-only code,
   because Node imports it at build time. */

const MAX_DESC = 155;

function clip(text, max = MAX_DESC) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:]+$/, '') + '…';
}

/* Routes that get their own static HTML file and sitemap entry. */
export const PAGES = ['/', '/works', '/about'];

/* site: the contents of src/content/site.json.
   workCount: how many artworks are published. */
export function pageMeta(path, site, workCount) {
  const siteTitle = site.siteTitle || 'Portfolio';
  const name = site.artistName || siteTitle;

  switch (path) {
    case '/works':
      return {
        title: `Works · ${siteTitle}`,
        description: `All ${workCount} ${workCount === 1 ? 'piece' : 'pieces'} by ${name}.`,
      };
    case '/about': {
      const firstParagraph = String(site.aboutBody || '').split('\n').find((p) => p.trim());
      return {
        title: `About · ${siteTitle}`,
        description: firstParagraph ? clip(firstParagraph) : `About ${name}.`,
      };
    }
    default:
      return {
        title: siteTitle,
        description: clip(site.metaDescription || site.tagline || ''),
      };
  }
}

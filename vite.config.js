import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import siteMeta from './scripts/site-meta.js'
import responsiveImages from './scripts/responsive-images.js'

// Base path for the production build.
//   - GitHub Pages project site:  "/emaad-portfolio/"
//   - Custom domain / user site:  set BASE_PATH="/" (or leave the env unset
//     and change the default below).
// Dev server always runs at "/".
const base = process.env.BASE_PATH || '/emaad-portfolio/'

// Public URL of the home page, used for canonical links, the sitemap and
// structured data. Change it (or set SITE_URL) if the site moves to a
// custom domain.
const siteUrl = process.env.SITE_URL || 'https://emmeqqu-08.github.io/emaad-portfolio/'

// https://vite.dev/config/
// (`vite preview` also reports command "serve", so check isPreview too:
// preview must use the production base to match the built HTML.)
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'serve' && !isPreview ? '/' : base,
  plugins: [responsiveImages(), react(), siteMeta({ siteUrl })],
  build: {
    // Keep font files out of the CSS. Zen Kaku Gothic ships dozens of
    // small unicode-range subsets; inlined as base64 they made the
    // render-blocking stylesheet ~450 kB. As files, the browser only
    // downloads the subsets a page actually uses.
    assetsInlineLimit: (file) => (/\.(woff2?|ttf|otf)$/.test(file) ? false : undefined),
  },
}))

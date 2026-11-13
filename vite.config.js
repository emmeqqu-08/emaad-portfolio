import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import siteMeta from './scripts/site-meta.js'

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
  plugins: [react(), siteMeta({ siteUrl })],
}))

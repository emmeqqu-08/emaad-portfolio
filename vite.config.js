import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path for the production build.
//   - GitHub Pages project site:  "/emaad-portfolio/"
//   - Custom domain / user site:  set BASE_PATH="/" (or leave the env unset
//     and change the default below).
// Dev server always runs at "/".
const base = process.env.BASE_PATH || '/emaad-portfolio/'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : base,
  plugins: [react()],
}))

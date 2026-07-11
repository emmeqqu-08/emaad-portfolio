# Emaad — Art Portfolio

A dark, cinematic portfolio site with a refined JoJo's Bizarre Adventure–inspired
aesthetic. Built with **React + Vite**. Content is managed through **Decap CMS**,
so the artist can add new pieces from a friendly web dashboard — no code, free forever.

- **Home** — dramatic hero + a "Selected" teaser strip.
- **Works** — Pinterest-style masonry grid, filter by category, sort, and a
  fullscreen lightbox with full metadata for each piece.
- **About** — artist statement + contact.

---

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
```

Build for production:

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build
```

---

## How content works

Each artwork is a markdown file in [`src/content/works/`](src/content/works/) with
frontmatter fields. The site reads them at build time
([`src/lib/content.js`](src/lib/content.js)). Site-wide text (name, tagline, about)
lives in [`src/content/site.json`](src/content/site.json).

A work file looks like this:

```markdown
---
title: Crimson Dawn
image: /uploads/crimson-dawn.jpg   # or a full URL
year: 2024
medium: Oil on canvas
dimensions: 60 × 80 cm
categories:
  - Painting
  - Abstract
available: true
uploadDate: 2024-11-02T10:00:00.000Z
description: A study in warm dissonance...
---
```

Only **title**, **image**, and **description** are required; everything else is optional.

---

## The artist's dashboard (Decap CMS)

Once deployed, the artist visits **`yoursite.com/admin`**, logs in, and gets a
form-based editor. Adding a piece = drag in an image, type a title/description,
pick categories, hit **Publish**. Decap commits the file + image to GitHub, and
the site rebuilds automatically. All free, no subscriptions.

The dashboard has two sections:

- **Artworks** — add / edit / delete pieces.
- **Site Settings → General / Home / About** — edit everything in `site.json`
  with no code:
  - Artist name, tagline, hero statement, About text.
  - **Hero portrait** — upload a photo of the artist to show beside the name on
    the home page (leave empty for a text-only hero).
  - **Social links** — an add-any-number list. Type a platform name (Instagram,
    LinkedIn, DeviantArt, ArtStation, …) and its URL; it appears in the footer
    and About page automatically.
  - **Selected works** — a searchable picker to choose which pieces show in the
    home "Selected" strip (leave empty to auto-show the newest work).

Config lives in [`public/admin/config.yml`](public/admin/config.yml).

---

## One-time deployment (you do this once)

This uses **Netlify** (free) so the artist can log in with just an email — no
GitHub account required.

1. **Push this repo to GitHub.**

2. **Create a Netlify site** at [netlify.com](https://netlify.com):
   - "Add new site" → "Import an existing project" → pick this GitHub repo.
   - Build command `npm run build`, publish directory `dist` (already set in
     [`netlify.toml`](netlify.toml)). Deploy.

3. **Enable Netlify Identity** (the artist's login):
   - Site → **Integrations / Identity** → **Enable Identity**.
   - Under Identity → **Registration**, set to **Invite only** (so randoms can't sign up).
   - Under Identity → **Services** → enable **Git Gateway**. This is what lets
     Decap commit to GitHub on the artist's behalf.

4. **Invite the artist:**
   - Identity → **Invite users** → enter the artist's email.
   - They get an email, click the link, set a password. Done.

5. **The artist goes to `yoursite.com/admin`** and logs in. That's it.

### Testing the CMS locally (optional)

`local_backend: true` is set in the config, so you can test the dashboard without
touching GitHub:

```bash
npx decap-server        # in one terminal
npm run dev             # in another; visit http://localhost:5173/admin
```

---

## Notes & limits

- **Image size:** keep uploads web-friendly (JPG/PNG/WebP, ideally < ~2 MB).
  GitHub warns above 50 MB per file, but you'd never hit that with optimized
  web images. Hundreds of pieces fit comfortably.
- Images uploaded via the CMS are stored in `public/uploads/` and served from
  `/uploads/...`.
- `/admin` is excluded from search engines (`noindex`).

---

## Tech

React 19 · Vite · React Router · Motion (animations) · Decap CMS · Netlify.
Fonts: Anton (display), Fraunces (serif accents), Zen Kaku Gothic New (body).

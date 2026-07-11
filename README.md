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

- **Artworks** — add / edit / delete pieces. Categories are picked from the
  master list (see below), so they stay consistent across the site.
- **Site Settings → General / Home / About** — edit everything in `site.json`
  with no code:
  - **Browser tab title** and **link preview description** — what shows in the
    browser tab and when the site link is shared on social/chat. (These are also
    baked into the static HTML at build time so link-preview crawlers see them —
    see `scripts/inject-meta.js`.)
  - Artist name, tagline, hero statement, About text.
  - **Hero portrait** and **About page image** — upload photos of the artist
    (leave empty to hide).
  - **Categories (master list)** — add or remove the categories used across the
    site. These become the options when tagging artworks and the filter chips on
    the Works page. A category only appears as a filter once at least one work
    uses it.
  - **Social links** — an add-any-number list. Each has a platform name, URL, and
    an **icon** you pick from a dropdown (Instagram, LinkedIn, DeviantArt,
    ArtStation, Behance, X, Facebook, YouTube, TikTok, Pinterest, Dribbble, or a
    generic globe). Shows in the footer and About page.
  - **Selected works** — a searchable picker to choose which pieces show in the
    home "Selected" strip (leave empty to auto-show the newest work). If more are
    picked than fit the row, the strip auto-scrolls as a carousel.

Config lives in [`public/admin/config.yml`](public/admin/config.yml).

> **Previewing the admin locally:** the Vite dev server (`npm run dev`) serves the
> React app for `/admin/`, so to see the real dashboard run `npm run build && npm
> run preview` and open `/admin/`. For editing content locally without touching
> GitHub, also run `npx decap-server` in another terminal (the config has
> `local_backend: true`).

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
touching GitHub. Note the admin only renders from a production build:

```bash
npx decap-server        # in one terminal
npm run build && npm run preview   # in another; visit http://localhost:4173/admin/
```

---

## Transferring the repo to the artist's GitHub + shared access

The site is theirs, so the GitHub repo should live in their account. Here's how
that works and how you keep access.

**Transfer the repo (recommended — keeps history):**
1. In GitHub: repo → **Settings → General → Transfer ownership** → enter the
   artist's GitHub username. (Or: they create an empty repo and you
   `git push` to it; transfer is cleaner as it preserves issues/history.)
2. After transfer, the repo URL changes to `github.com/<artist>/<repo>`. Update
   your local remote: `git remote set-url origin <new-url>`.
3. The artist adds you back as a collaborator: their repo → **Settings →
   Collaborators → Add people** → your GitHub username. Now you both can push.

**Reconnect Netlify after the transfer:** Netlify's GitHub link is tied to the
old repo path, so relink it once — Netlify site → **Site configuration → Build &
deploy → Continuous deployment → Manage repository / Link to a different
repository** → pick the artist's repo. (The build settings and `netlify.toml`
carry over.)

**Can both of you access the Netlify backend?** Yes — two separate kinds of access:

- **Netlify dashboard access** (deploys, settings, Identity, billing): Netlify
  Team → **Members → Invite members** → add the other person's email. Free tier
  allows multiple members. Whoever owns the Netlify team owns the site; the other
  is added as a member/collaborator.
- **The `/admin` content editor** (adding artwork, editing settings): this is
  gated by **Netlify Identity**, separate from GitHub and the Netlify team. Just
  invite each person's email under **Identity → Invite users**. Both you and the
  artist can be Identity users and both edit content at `/admin`.

So a typical setup: the **artist owns** the GitHub repo and the Netlify site;
**you're added** as a GitHub collaborator, a Netlify team member, and an Identity
user — giving you full ability to help maintain and edit going forward.

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

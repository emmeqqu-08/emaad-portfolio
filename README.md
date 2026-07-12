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

## Deploying on GitHub Pages (free, no build-minute metering)

The site is a static build hosted on **GitHub Pages**; content is committed to
the GitHub repo by **Decap CMS** using **GitHub OAuth** for login. Everything
here is free and open — no Netlify, no credits.

### 1. Turn on Pages + the deploy workflow

1. Push this repo to GitHub.
2. Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The included workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml))
   builds the site and deploys it on every push to `main`. It sets the Vite base
   path to `/<repo-name>/` automatically, so the site serves at:
   **`https://<your-username>.github.io/<repo-name>/`**

That's the site live. Next, wire up the CMS login.

### 2. Give Decap a GitHub OAuth login (the `/admin` dashboard)

GitHub Pages can't run the little server that completes a GitHub OAuth login, so
Decap uses an external **OAuth proxy**. You have two free options:

**Option A — use a community-hosted proxy (fastest).** Several exist; you point
Decap at one and register an OAuth app against it. Update the top of
[`public/admin/config.yml`](public/admin/config.yml):

```yaml
backend:
  name: github
  repo: <owner>/<repo>          # e.g. shaadqrsh/emaad-portfolio
  branch: main
  base_url: https://<the-proxy-origin>   # the community proxy URL
  auth_endpoint: auth
```

**Option B — self-host the proxy (most reliable, still free).** Deploy the tiny
open-source [`decap-proxy`](https://github.com/sterlinghq/decap-proxy) (or
`netlify-cms-oauth-provider`) to a free host such as **Cloudflare Workers**,
**Deno Deploy**, or **Vercel** — it's a single endpoint with no ongoing cost.
Then set `base_url` to your deployed proxy URL. This won't disappear on you the
way a shared community proxy can.

**Register the GitHub OAuth app** (needed for either option):
1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. **Homepage URL:** your Pages site URL.
   **Authorization callback URL:** the proxy's callback (e.g.
   `https://<proxy-origin>/callback` — check the proxy's docs).
3. Copy the **Client ID** and generate a **Client Secret**, and give them to the
   proxy (community proxies show a form; self-hosted proxies take them as env
   vars).

Once set, visiting `https://<your-username>.github.io/<repo>/admin/` shows a
**“Login with GitHub”** button.

### 3. Who can log in

Anyone who is a **collaborator on the repo** can log into `/admin` and edit.
- Repo → **Settings → Collaborators → Add people** → add the artist's (and your)
  GitHub username.
- Both of you then log into `/admin` with your GitHub accounts and can publish.

### Testing the CMS locally (optional)

`local_backend: true` is set, so you can test the dashboard without touching
GitHub. The admin only renders from a production build:

```bash
npx decap-server                                   # terminal 1
BASE_PATH=/ npm run build && npm run preview        # terminal 2
# then open http://localhost:4173/admin/
```

---

## Transferring the repo to the artist's GitHub

The site is theirs, so the repo should live in their account.

1. GitHub → repo → **Settings → General → Transfer ownership** → the artist's
   username (this preserves history).
2. Update your local remote: `git remote set-url origin <new-url>`.
3. The artist re-adds you: their repo → **Settings → Collaborators** → your
   username. You both keep push access.
4. **Update the CMS config:** in [`public/admin/config.yml`](public/admin/config.yml),
   change `repo:` to `<artist-username>/<repo>` and push.
5. Re-enable **Settings → Pages → Source: GitHub Actions** on the artist's copy
   (the workflow deploys automatically after that). Update the OAuth app's
   Homepage URL to the new Pages URL if it changed.

Because login is by **repo collaborator**, both of you can maintain and edit the
site indefinitely — no per-host accounts to manage.

### Custom domain later

If you attach a custom domain (served at the root `/` instead of `/<repo>/`),
set `BASE_PATH: "/"` in the workflow's Build step (and it's fine to leave the
Vite default as-is for local). Add a `CNAME` file via **Settings → Pages →
Custom domain**.

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

React 19 · Vite · React Router · Motion (animations) · Decap CMS · GitHub Pages.
Fonts: Anton (display), Fraunces (serif accents), Zen Kaku Gothic New (body).

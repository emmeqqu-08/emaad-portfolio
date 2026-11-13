# Emaad: Art Portfolio

A dark portfolio site for Emaad's artwork, styled with a nod to JoJo's Bizarre
Adventure. It's built with React and Vite. Content is managed through Decap CMS,
so the artist can add new pieces from a web dashboard without touching code, and
it costs nothing to run.

The site has three pages:

- Home: a hero section and a "Selected" strip of featured work.
- Works: a masonry grid you can filter by category and sort. Clicking a piece
  opens it fullscreen with all of its details.
- About: the artist statement and contact info.

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

Only `title`, `image`, and `description` are required. Everything else is optional.

## The artist's dashboard (Decap CMS)

Once the site is deployed, the artist goes to `yoursite.com/admin`, logs in, and
gets a form-based editor. To add a piece, they drag in an image, type a title and
description, pick categories, and hit Publish. Decap commits the file and image to
GitHub, and the site rebuilds on its own.

The dashboard has two sections.

Artworks is where pieces are added, edited, and deleted. Categories come from the
master list described below, so they stay consistent across the site.

Site Settings (General, Home, About) edits everything in `site.json`:

- Browser tab title and link preview description. These control what shows in
  the browser tab and in the preview card when someone shares the link. They're
  also written into the static HTML at build time so link-preview crawlers can
  read them (see `scripts/inject-meta.js`).
- Artist name, tagline, hero statement, and About text.
- Hero portrait and About page image. Leave either empty to hide it.
- Categories (master list). The categories added here become the options when
  tagging artworks and the filter chips on the Works page. A category only shows
  up as a filter once at least one work uses it.
- Social links. Add as many as you like. Each one has a platform name, a URL, and
  an icon picked from a dropdown (Instagram, LinkedIn, DeviantArt, ArtStation,
  Behance, X, Facebook, YouTube, TikTok, Pinterest, Dribbble, or a generic globe).
  They appear in the footer and on the About page.
- Selected works. A searchable picker for the pieces shown in the home page's
  "Selected" strip. If it's empty, the strip shows the newest work. If more pieces
  are picked than fit in the row, the strip scrolls as a carousel.

Config lives in [`public/admin/config.yml`](public/admin/config.yml).

> Previewing the admin locally: the Vite dev server (`npm run dev`) serves the
> React app at `/admin/`, so you won't see the real dashboard there. Run `npm run
> build && npm run preview` and open `/admin/` instead. To edit content locally
> without touching GitHub, also run `npx decap-server` in another terminal (the
> config has `local_backend: true`).

## Deploying on GitHub Pages (free, no build-minute metering)

The site is a static build hosted on GitHub Pages. Decap CMS commits content to
the GitHub repo and uses GitHub OAuth for login. None of this needs Netlify or a
paid plan.

### 1. Turn on Pages and the deploy workflow

1. Push this repo to GitHub.
2. In the repo, go to Settings → Pages → Build and deployment and set Source to
   GitHub Actions.
3. The included workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml))
   builds and deploys the site on every push to `main`. It sets the Vite base
   path to `/<repo-name>/` automatically, so the site is served at
   `https://<your-username>.github.io/<repo-name>/`.

The site is now live. The next step is the CMS login.

### 2. Give Decap a GitHub OAuth login (the `/admin` dashboard)

GitHub Pages can't run the small server needed to finish a GitHub OAuth login, so
Decap relies on an external OAuth proxy. Public proxies keep getting shut down,
so we host our own for free as serverless functions on the existing
`nanorewind-4k` Vercel project. No new service or account is needed.

- `api/decap/auth.ts` starts the login and redirects to GitHub.
- `api/decap/callback.ts` exchanges the code for a token and passes it to Decap.
- `api/decap/_base-url.ts` works out the proxy's own public URL (see below).

One-time setup:

1. Register a GitHub OAuth app.
   On GitHub, go to Settings → Developer settings → OAuth Apps → New OAuth App
   and fill in:
   - Homepage URL: your Pages site URL
     (`https://<username>.github.io/emaad-portfolio/`)
   - Authorization callback URL:
     `https://nanorewind-4k.vercel.app/api/decap/callback`

   Register it, copy the Client ID, and generate a client secret.

2. Add environment variables to the nanorewind-4k Vercel project.
   In Vercel, open the nanorewind-4k project and go to Settings → Environment
   Variables:
   - `GITHUB_OAUTH_ID` = the Client ID (required)
   - `GITHUB_OAUTH_SECRET` = the Client Secret (required)
   - `OAUTH_PROXY_URL` = `https://nanorewind-4k.vercel.app` (optional). This is
     the proxy's own public origin. If it's unset, the proxy detects its URL from
     the incoming request, which is correct on the default `*.vercel.app` domain.
     Only set it if you put the proxy behind a custom domain. In that case it
     must match that domain and the OAuth callback URL above.

   Then redeploy nanorewind (push, or Vercel → Deployments → Redeploy) so the
   functions pick up the variables.

3. Point this site's config at the proxy.
   In [`public/admin/config.yml`](public/admin/config.yml), set `base_url` to the
   nanorewind Vercel domain and leave `auth_endpoint: api/decap/auth` as it is:

   ```yaml
   backend:
     name: github
     repo: emmeqqu-08/emaad-portfolio
     branch: main
     base_url: https://nanorewind-4k.vercel.app
     auth_endpoint: api/decap/auth
   ```

After that deploys, `https://<username>.github.io/emaad-portfolio/admin/` shows a
"Login with GitHub" button.

> The proxy works for any Decap site, so the same nanorewind functions and OAuth
> app can serve other projects later. Each site points the `base_url` in its own
> `config.yml` at the proxy.

### 3. Who can log in

Any collaborator on the repo can log into `/admin` and edit.

- In the repo, go to Settings → Collaborators → Add people and add the artist's
  GitHub username (and yours).
- You can both then log into `/admin` with your GitHub accounts and publish.

### Testing the CMS locally (optional)

`local_backend: true` is set, so you can test the dashboard without touching
GitHub. The admin only renders from a production build:

```bash
npx decap-server                                   # terminal 1
BASE_PATH=/ npm run build && npm run preview        # terminal 2
# then open http://localhost:4173/admin/
```

## Transferring the repo to the artist's GitHub

The site belongs to the artist, so the repo should live in their account.

1. On GitHub, go to the repo's Settings → General → Transfer ownership and enter
   the artist's username. History is preserved.
2. Update your local remote: `git remote set-url origin <new-url>`.
3. The artist adds you back under their repo's Settings → Collaborators, so you
   both keep push access.
4. Update the CMS config. In [`public/admin/config.yml`](public/admin/config.yml),
   change `repo:` to `<artist-username>/<repo>` and push.
5. Turn Settings → Pages → Source: GitHub Actions back on in the artist's copy.
   The workflow deploys automatically after that. If the Pages URL changed,
   update the OAuth app's Homepage URL to match.

Since login depends on being a repo collaborator, you can both keep maintaining
the site without separate accounts on any hosting service.

### Custom domain later

If you attach a custom domain, the site is served at the root `/` instead of
`/<repo>/`. Set `BASE_PATH: "/"` in the workflow's Build step (the Vite default
can stay as it is for local work), and add a `CNAME` file through Settings →
Pages → Custom domain.

## Notes and limits

- Keep image uploads web friendly (JPG, PNG, or WebP, ideally under about 2 MB).
  GitHub warns at 50 MB per file, which optimized web images won't come close
  to, and the repo can hold hundreds of pieces.
- Images uploaded through the CMS are stored in `public/uploads/` and served from
  `/uploads/...`.
- `/admin` is marked `noindex` so search engines skip it.

## Tech

React 19 · Vite · React Router · Motion (animations) · Decap CMS · GitHub Pages.
Fonts: Anton (display), Fraunces (serif accents), Zen Kaku Gothic New (body).

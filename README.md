# syntho-site

Source for [syntho.moe](https://syntho.moe), a static site built with [Astro](https://astro.build),
TypeScript and Three.js, served by nginx on nekocluster.

## Quick start

Requires Node ≥ 22.23 (see `.node-version`) and pnpm (version pinned in `package.json`).

```sh
pnpm install
pnpm dev        # http://localhost:4321
```

| Command        | What it does                                              |
| -------------- | --------------------------------------------------------- |
| `pnpm dev`     | Dev server with hot reload                                |
| `pnpm build`   | Production build to `dist/`                               |
| `pnpm preview` | Serve the production build locally                        |
| `pnpm check`   | Type-check `.astro` and `.ts` files                       |
| `pnpm lint`    | ESLint                                                    |
| `pnpm format`  | Prettier (write)                                          |
| `pnpm verify`  | Everything CI runs: format check, lint, type-check, build |

## Layout

```
src/
├── pages/                 File-based routes (/, /about, /projects, /projects/<slug>, 404)
├── layouts/               Page shells. BaseLayout owns <head>, SEO meta, header and footer
├── components/
│   ├── ui/                Plain Astro components (zero client JS)
│   └── three/             Components that mount a 3D scene on the client
├── scripts/               Client-side TypeScript (runs in the browser)
│   └── three/             One module per 3D scene
├── lib/                   Build-time helpers (queries, formatting)
├── content/projects/      One Markdown file per project or track
├── content.config.ts      Content schemas (validated at build time)
├── data/site.ts           Site name, nav and social links: single source of truth
├── styles/
│   ├── tokens.css         Colors, type scale, spacing: change the theme here
│   └── global.css         Reset and base element styles
└── assets/                Images processed by astro:assets (optimized at build)
public/                    Copied as-is (favicon, robots.txt, audio, résumé PDF)
docker/                    nginx config baked into the runtime image
```

Path aliases (`@components/*`, `@layouts/*`, `@lib/*`, `@data/*`, `@scripts/*`, `@styles/*`,
`@assets/*`) are defined in `tsconfig.json`.

## Common tasks

### Add a project or track

Create `src/content/projects/<slug>.md`. The filename becomes the URL `/projects/<slug>`.

```md
---
title: My thing
summary: One sentence, shown on the card (max 200 chars).
kind: code # code | music | art | other
date: 2026-11-15
tags: [three.js, webgl]
cover: ../../assets/projects/my-thing.png # optional, relative to this file
coverAlt: Screenshot of my thing
links:
  - label: Source
    href: https://github.com/...
audio: /audio/my-track.mp3 # optional, file lives in public/audio/
featured: false
draft: false # drafts show in `pnpm dev` only
---

Body in Markdown.
```

The schema lives in `src/content.config.ts`. If a field is wrong, the build fails with a clear error.

### Add a page

Create `src/pages/<name>.astro` wrapped in `<BaseLayout title="...">`. To list it in the header
and homepage nav, add an entry to `nav` in `src/data/site.ts`.

### Add a 3D scene

1. Write `src/scripts/three/<scene>.ts` exporting `mount(canvas, options) => dispose`.
   Use `hero-scene.ts` as the template: it reads theme colors from CSS variables, pauses while
   off-screen, and disposes GPU resources.
2. Wrap it in `src/components/three/<Scene>.astro` that **dynamically imports** the module.
   This keeps Three.js out of the main bundle and off pages that don't use it.
3. Always provide a non-WebGL fallback and respect `prefers-reduced-motion`.

If scenes get complex enough to want a component model, add a UI framework integration
(e.g. `pnpm astro add react` and use `@react-three/fiber`, or `pnpm astro add svelte` and use
Threlte) and render the component with `client:visible`.

### Retheme

Edit `src/styles/tokens.css`. Components only use the variables defined there.

## Conventions

- **Zero JS by default.** Interactivity is opt-in per component, and should progressively enhance
  content that works without it (see the filter buttons on `/projects`).
- **Clean URLs.** Pages build to `about.html`. nginx serves `/about` and redirects trailing slashes.
  Link to `/about`, not `/about/`.
- **Strict TypeScript.** Extends `astro/tsconfigs/strictest`.
- **Formatting and lint are enforced in CI.** Run `pnpm verify` before pushing.
- **Pinned dependencies.** Exact versions in `package.json` plus a committed lockfile.

## Deployment

The `Dockerfile` builds the site with Node, then copies `dist/` into an unprivileged nginx image
listening on `:8080` (`/healthz` is the probe endpoint).

CI builds the image and pushes it to Harbor. The Kubernetes manifests and ArgoCD Application live in
the `nekocluster-gitops` repo under `apps/syntho-site/`, not in this repo.

```sh
# Local smoke test of the production image
docker build -t syntho-site . && docker run --rm -p 8080:8080 syntho-site
```

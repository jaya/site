# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Corporate website for Jaya Tech (nearshore software consulting). Built with **Astro 5**, **Tailwind CSS 4 + DaisyUI 5**, **React 19** (for interactive islands), and **TypeScript**. Bilingual: English (`en`) and Brazilian Portuguese (`br`).

## Commands

```bash
pnpm install          # Install dependencies (pnpm 10.13+)
pnpm dev              # Dev server at localhost:4321/ (redirects to /en/)
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm start            # Run the built server: node ./dist/server/entry.mjs
```

Formatting: `pnpm prettier --write .` (tabs, single quotes, no semicolons, no trailing commas).

No test framework is configured.

## Architecture

**Astro Islands**: Pages are static HTML by default. React components only hydrate when using `client:load` or `client:visible` directives.

**Rendering model**: Output is static by default; only routes that explicitly opt out (`export const prerender = false`) are rendered on demand by the `@astrojs/node` adapter (standalone mode). Currently that's `src/pages/index.astro` (locale redirect) and `src/pages/[lang]/contact.astro` / `contato.astro` (need a live server for Astro Actions). This is why the site is deployed as a Node web service (see Deployment) rather than pure static hosting — a fully static host (e.g. GitHub Pages) cannot serve these routes.

**i18n**: URL-prefix routing (`/en/*`, `/br/*`). Each `[lang]` page uses `getStaticPaths()` returning both locales. Translations live in `src/i18n/locales/{en,br}.json` with dot-notation keys accessed via `t(translations, 'key.path')`.

**Page pattern**: Language-specific pages in `src/pages/[lang]/` import shared templates from `src/pages/_shared/`. The root `index.astro` redirects to the default locale.

**Server actions**: Contact form uses Astro Actions (`src/actions/index.ts`) with Zod validation and Resend email API. Requires `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO` env vars.

**Content collections**: Blog posts are Markdown in `src/content/blog/`, schema defined in `src/content.config.ts`.

**Path handling**: Use `withBase(path)` from `@/utils/url` for internal links to handle subdirectory deployment (`/jaya/` base path).

## Code Conventions

**Imports**: Always use `@/*` alias (maps to `src/*`). Never use relative paths like `../../../`.

**Colors**: Use Tailwind classes mapped to CSS variables (`text-primary`, `bg-primary-light`). Never hardcode hex values. Variables are defined in `src/styles/global.css`.

**CSS @apply ordering** (see `.cursor/rules/jaya-style-guide.mdc` for full details):

1. Base components (btn, card)
2. Layout/Display (flex, grid, relative)
3. Positioning (top, z-index)
4. Dimensions (w, h)
5. Spacing (p, m, gap - group related: `px-8 py-6`)
6. Background (bg - **separate line** from text)
7. Text (color, alignment, size, weight, leading)
8. Borders (border, rounded)
9. Effects (shadow, opacity, transition)

**Social links**: Always use centralized config from `@/data/social-links.ts`.

## Deployment

- **Render** (production): Docker **Web Service**, defined as code in `render.yaml` (Blueprint) at the repo root. Auto-deploys on push to `main`. Root domain, no base path (`jaya.tech`).
- **Docker**: Multi-stage Node 22 build (`Dockerfile`). Render injects service env vars both as Docker build args (consumed via `ARG`/`ENV` in the Dockerfile: `SITE_URL`, `ASTRO_BASE`, `BASE_PATH`) and as runtime env vars for the running container (`RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`).
- **Port**: The server reads `process.env.PORT` (Render injects its own at runtime, overriding the Dockerfile's default of `8080`). No hardcoded port assumptions.
- Site URL / base path are environment-aware (see `astro.config.mjs`) — `ASTRO_BASE` should stay unset for root-domain deploys like Render; only set it for subpath deployments.
- `RESEND_API_KEY` is a secret (`sync: false` in `render.yaml`) — set once in the Render dashboard, never committed.
- GitHub Pages deployment (`.github/workflows/deploy.yml`) was retired in favor of Render, since GitHub Pages is static-only and can't serve the on-demand routes described above (locale redirect, contact form Actions).

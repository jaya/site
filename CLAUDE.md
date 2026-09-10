# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Corporate website for Jaya Tech (nearshore software consulting). Built with **Astro 5**, **Tailwind CSS 4 + DaisyUI 5**, **React 19** (for interactive islands), and **TypeScript**. Bilingual: English (`en`) and Brazilian Portuguese (`br`).

## Commands

```bash
pnpm install          # Install dependencies (pnpm 10.13+)
pnpm dev              # Dev server at localhost:4321/jaya/
pnpm build            # Production build
pnpm preview          # Preview production build
```

Formatting: `pnpm prettier --write .` (tabs, single quotes, no semicolons, no trailing commas).

No test framework is configured.

## Architecture

**Astro Islands**: Pages are static HTML by default. React components only hydrate when using `client:load` or `client:visible` directives.

**i18n**: URL-prefix routing (`/en/*`, `/br/*`). Each `[lang]` page uses `getStaticPaths()` returning both locales. Translations live in `src/i18n/locales/{en,br}.json` with dot-notation keys accessed via `t(translations, 'key.path')`.

**Page pattern**: Language-specific pages in `src/pages/[lang]/` import shared templates from `src/pages/_shared/`. The root `/` redirects to the default locale via the static `redirects` config in `astro.config.mjs` (no `index.astro` page).

**Contact form**: Fully static — submits directly to [Web3Forms](https://web3forms.com) via client-side `fetch` (see `<script>` in `src/pages/_shared/ContactPage.astro`), no backend of our own. Requires `PUBLIC_WEB3FORMS_ACCESS_KEY` (must be `PUBLIC_`-prefixed, it's read in the browser).

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

- **GitHub Pages** (primary): Auto-deploys on push to `main` via `.github/workflows/deploy.yml`. Build gets `SITE_URL`/`ASTRO_BASE` derived from the repo (`https://<owner>.github.io` / `/<repo>/`) and `PUBLIC_WEB3FORMS_ACCESS_KEY` from the `WEB3FORMS_ACCESS_KEY` repo secret.
- Site is 100% static (no adapter, no SSR routes) — required for Pages.
- **Docker**: Multi-stage Node 22 build, port 8080, serves the static `dist/` output (`serve`). Build args: `SITE_URL`, `ASTRO_BASE`. Kept as an alternative hosting path, not the primary deployment.
- Site URL / base path are environment-aware (see `astro.config.mjs`)

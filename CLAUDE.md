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

- **GitHub Pages**: Auto-deploys on push to `main` via `.github/workflows/deploy.yml`
- **Docker**: Multi-stage Node 22 build, port 8080. Build args: `SITE_URL`, `ASTRO_BASE`
- Site URL / base path are environment-aware (see `astro.config.mjs`)

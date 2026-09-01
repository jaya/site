# Jaya Tech - Corporate Website

Official website for Jaya Tech, a fully remote software consulting company specializing in nearshore staff augmentation and high-impact projects. Bilingual (English / Brazilian Portuguese), built with Astro.

## 🎯 About Jaya

Jaya is a software consulting company founded in 2012, partnering with U.S. companies since 2016. We specialize in:

- **Nearshore Staff Augmentation** - Connecting companies with top-tier developers, tech leads, and staff engineers
- **Outsourcing** - Delivering managed engineering squads
- **Artificial Intelligence** - Supporting AI projects with ML, computer vision, and LLM integration

## 🧩 Tech Stack

- [Astro 5](https://astro.build/) - Pages are statically prerendered by default; a handful of routes (home redirect, contact form) opt into on-demand rendering via the `@astrojs/node` adapter
- [Tailwind CSS 4](https://tailwindcss.com/) + [DaisyUI 5](https://daisyui.com/)
- [React 19](https://reactjs.org/) - For interactive islands (`client:load` / `client:visible`)
- TypeScript
- [Resend](https://resend.com/) - Transactional email for the contact form
- Astro SEO, Astro Sitemap, astro-robots-txt
- Custom fonts: Open Sauce One & Space Grotesk

For the full architecture (i18n internals, rendering model, code conventions), see [`CLAUDE.md`](./CLAUDE.md) - it's kept in sync with how the codebase actually works.

## 🚀 Getting Started

**Requirements**: Node 22+, pnpm 10.13+

```bash
git clone git@github.com:jaya/site.git
cd site
pnpm install
cp .env.example .env   # fill in RESEND_API_KEY to send real emails (optional for local dev)
pnpm dev
```

Open `http://localhost:4321/` - it redirects to the default locale at `/en/` (Portuguese lives under `/br/`).

## 📦 Available Commands

| Command        | Action                                              |
| :------------- | :--------------------------------------------------- |
| `pnpm dev`     | Start local development server                       |
| `pnpm build`   | Build site for production                             |
| `pnpm preview` | Preview production build locally                      |
| `pnpm start`   | Run the built server (`dist/server/entry.mjs`)         |
| `pnpm astro`   | Run Astro CLI commands                                 |

Formatting: `pnpm prettier --write .` (see `.prettierrc`: tabs, single quotes, no semicolons, no trailing commas).

## 🌍 Internationalization

Locales: `en` (default) and `br`, URL-prefixed (`/en/*`, `/br/*`). Some Portuguese routes use localized slugs (e.g. `/br/contato` instead of `/br/contact`) - see `src/i18n/routes.ts`. Translation strings live in `src/i18n/locales/{en,br}.json`.

## 🔧 Environment Variables

See `.env.example`. Used by the contact form (`src/actions/index.ts`) and by the build (`astro.config.mjs`):

| Variable          | Required | Purpose                                                          |
| :----------------- | :------- | :---------------------------------------------------------------- |
| `RESEND_API_KEY`   | For real emails | Resend API key. If unset, the contact form logs a warning and returns a mock success (safe for local dev). |
| `EMAIL_FROM`       | No       | Sender address for contact form emails.                          |
| `EMAIL_TO`         | No       | Recipient address for contact form emails.                       |
| `SITE_URL`         | For prod builds | Canonical site URL, used for the sitemap and SEO tags.       |
| `ASTRO_BASE`       | No       | Base path, only needed for subpath deployments (e.g. `/jaya/`). Leave unset for root-domain deploys. |

## 🎨 Design System

Colors and design tokens are centralized as CSS variables in `src/styles/global.css` and consumed via Tailwind classes (`text-primary`, `bg-primary-light`, etc.) - never hardcode hex values. See `CLAUDE.md` for the full conventions (CSS `@apply` ordering, import aliases, social links config).

## 🚀 Deployment

### Render (production)

The app runs as a Docker **Web Service** on [Render](https://render.com/), built from the repo's `Dockerfile`. Configuration is defined as code in [`render.yaml`](./render.yaml) (a Render Blueprint):

1. On Render: **New +** → **Blueprint** → connect this repository.
2. Render reads `render.yaml` and provisions the service automatically on every push to `main`.
3. On first deploy, set the `RESEND_API_KEY` secret in the Render dashboard (it's intentionally not stored in the repo).
4. Point your domain's DNS at Render following the instructions shown for the custom domain in the service's dashboard.

The contact form (`/contact`, `/contato`) requires a running Node server (Astro Actions), which is why this is a Web Service rather than a static site.

### Local production build

```bash
pnpm build
pnpm start
```

Or with Docker:

```bash
docker build -t jaya-site --build-arg SITE_URL=https://jaya.tech .
docker run -p 8080:8080 -e RESEND_API_KEY=... jaya-site
```

## 📄 License

MIT - See the [LICENSE](LICENSE) file for details.

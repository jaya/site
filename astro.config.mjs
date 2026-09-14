import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'
import robotsTxt from 'astro-robots-txt'
import partytown from '@astrojs/partytown'
import mermaid from 'astro-mermaid'

function normalizeBase(v) {
	if (!v) return undefined
	let s = v.trim()
	if (!s.startsWith('/')) s = '/' + s
	if (!s.endsWith('/')) s = s + '/'
	if (s === '//') return '/'
	return s
}

const RAW_SITE = process.env.SITE_URL ?? process.env.PUBLIC_SITE_URL ?? 'https://example.com'

let SITE_URL = 'https://example.com'
try {
	SITE_URL = new URL(RAW_SITE).toString().replace(/\/$/, '') // remove barra final
} catch {}

const BASE = normalizeBase(process.env.ASTRO_BASE ?? process.env.BASE_PATH)

export default defineConfig({
	site: SITE_URL,
	...(BASE ? { base: BASE } : {}),
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'br'],
		routing: {
			prefixDefaultLocale: true,
			redirectToDefaultLocale: false
		}
	},
	// Site is fully static (GitHub Pages). The root `/` has no locale prefix,
	// so it's resolved via a build-time redirect instead of an SSR page.
	// Astro's `redirects` targets aren't base-prefixed automatically, so we
	// prepend BASE ourselves (e.g. `/site/en/` when deployed under a subpath).
	redirects: {
		'/': `${BASE ?? '/'}en/`
	},
	integrations: [
		react(),
		sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en-US', br: 'pt-BR' } } }),
		robotsTxt(),
		partytown(),
		mermaid()
	],
	vite: {
		plugins: [tailwindcss()],
		server: { watch: { usePolling: true } },
		css: { modules: { localsConvention: 'camelCaseOnly' } }
	}
})

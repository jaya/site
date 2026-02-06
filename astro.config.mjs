import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'
import robotsTxt from 'astro-robots-txt'
import node from '@astrojs/node'
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
	},
	adapter: node({
		mode: 'standalone'
	})
})

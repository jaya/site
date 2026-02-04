import type { Locale } from './utils'

const normalizePath = (path: string): string => {
	let normalized = path.startsWith('/') ? path : '/' + path
	if (normalized !== '/' && normalized.endsWith('/')) {
		normalized = normalized.slice(0, -1)
	}
	return normalized
}

export const routeMap: Record<string, Record<Locale, string>> = {
	'/': { en: '/', pt: '/' },
	'/about': { en: '/about', pt: '/about' },
	'/cases': { en: '/cases', pt: '/cases' },
	'/contact': { en: '/contact', pt: '/contato' },
	'/fintech': { en: '/fintech', pt: '/fintech' },
	'/healthtech': { en: '/healthtech', pt: '/healthtech' },
	'/retail': { en: '/retail', pt: '/varejo' },
	'/saas': { en: '/saas', pt: '/saas' },
	'/culture': { en: '/culture', pt: '/cultura' }
}

const resolveRouteKey = (path: string): string => {
	const normalized = normalizePath(path)
	if (routeMap[normalized]) {
		return normalized
	}

	for (const [key, locales] of Object.entries(routeMap)) {
		if (Object.values(locales).includes(normalized)) {
			return key
		}
	}

	return normalized
}

export function getRouteForLocale(path: string, locale: Locale): string {
	const key = resolveRouteKey(path)
	const mapped = routeMap[key]?.[locale]
	return normalizePath(mapped ?? key)
}

import { localeBr, localeEn, type Locale } from './constants'

const normalizePath = (path: string): string => {
	let normalized = path.startsWith('/') ? path : '/' + path
	if (normalized !== '/' && normalized.endsWith('/')) {
		normalized = normalized.slice(0, -1)
	}
	return normalized
}

export const routeMap: Record<string, Record<Locale, string>> = {
	'/': { [localeEn]: '/', [localeBr]: '/' },
	'/about': { [localeEn]: '/about', [localeBr]: '/about' },
	'/cases': { [localeEn]: '/cases', [localeBr]: '/cases' },
	'/contact': { [localeEn]: '/contact', [localeBr]: '/contato' },
	'/fintech': { [localeEn]: '/fintech', [localeBr]: '/fintech' },
	'/healthtech': { [localeEn]: '/healthtech', [localeBr]: '/healthtech' },
	'/retail': { [localeEn]: '/retail', [localeBr]: '/retail' },
	'/saas': { [localeEn]: '/saas', [localeBr]: '/saas' },
	'/culture': { [localeEn]: '/culture', [localeBr]: '/culture' }
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

import type { AstroGlobal } from 'astro'
import { getRouteForLocale } from '@/i18n/routes'
import { defaultLocale, localeBr, localeEn, locales, type Locale } from '@/i18n/constants'

export { defaultLocale, localeBr, localeEn, locales, type Locale }

export function getLocaleParam(
	param: string | undefined,
	allowedLocales: readonly Locale[] = locales
): Locale | null {
	if (!param) return null
	const locale = param as Locale
	return allowedLocales.includes(locale) ? locale : null
}

/**
 * Strip the base path from the pathname
 */
function stripBase(pathname: string): string {
	const base = import.meta.env.BASE_URL
	if (pathname.startsWith(base)) {
		return pathname.slice(base.length)
	}
	// Handle case where pathname doesn't have trailing slash but base does
	if (base.endsWith('/') && pathname === base.slice(0, -1)) {
		return ''
	}
	return pathname
}

/**
 * Get the current locale from the URL pathname
 */
export function getLocaleFromPath(pathname: string): Locale {
	const cleanPath = stripBase(pathname)
	const segments = cleanPath.split('/').filter(Boolean)
	const firstSegment = segments[0]

	if (locales.includes(firstSegment as Locale)) {
		return firstSegment as Locale
	}

	return defaultLocale
}

/**
 * Get the current locale from Astro request
 */
export function getLocale(Astro: AstroGlobal): Locale {
	return getLocaleFromPath(Astro.url.pathname)
}

/**
 * Get the pathname without locale prefix
 */
export function getPathnameWithoutLocale(pathname: string): string {
	const cleanPath = stripBase(pathname)
	const segments = cleanPath.split('/').filter(Boolean)

	if (segments.length === 0) {
		return '/'
	}

	const firstSegment = segments[0]

	if (locales.includes(firstSegment as Locale)) {
		const remaining = segments.slice(1)
		return remaining.length === 0 ? '/' : '/' + remaining.join('/')
	}

	// Return the path relative to base (without base prefix)
	return cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath
}

/**
 * Get the localized path for a given path
 */
export function getLocalizedPath(path: string, locale: Locale): string {
	// Normalize the path
	let cleanPath = path.startsWith('/') ? path : '/' + path
	if (cleanPath !== '/' && cleanPath.endsWith('/')) {
		cleanPath = cleanPath.slice(0, -1)
	}

	// Remove locale prefix if present
	const pathWithoutLocale = getPathnameWithoutLocale(cleanPath)
	const mappedPath = getRouteForLocale(pathWithoutLocale, locale)

	const localized = mappedPath === '/' ? `/${locale}` : `/${locale}${mappedPath}`
	return localized.endsWith('/') ? localized : `${localized}/`
}

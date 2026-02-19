import type { Locale } from './utils'

export type TranslationKey = string

export interface Translations {
	[key: string]: string | Translations
}

// Import translations dynamically
async function loadTranslations(locale: Locale): Promise<Translations> {
	const translations = await import(`./locales/${locale}.json`)
	return translations.default
}

// Cache for translations
const translationCache: Map<Locale, Translations> = new Map()

/**
 * Get translations for a specific locale
 */
export async function getTranslations(locale: Locale): Promise<Translations> {
	if (translationCache.has(locale)) {
		return translationCache.get(locale)!
	}

	const translations = await loadTranslations(locale)
	translationCache.set(locale, translations)
	return translations
}

/**
 * Get a translation value by key path (e.g., "nav.services" or "home.hero.title")
 */
export function getTranslation(
	translations: Translations,
	key: string
): string {
	const keys = key.split('.')
	let value: any = translations

	for (const k of keys) {
		if (value && typeof value === 'object' && k in value) {
			value = value[k]
		} else {
			return key // Return key if translation not found
		}
	}

	return typeof value === 'string' ? value : key
}

/**
 * Get translation with fallback
 */
export function t(translations: Translations, key: string, fallback?: string): string {
	const translation = getTranslation(translations, key)
	return translation !== key ? translation : fallback || key
}

/**
 * Create a Fragment component for rendering HTML from translations
 * This is a workaround for Astro's lack of set:html directive
 */
export function createHtmlFragment(html: string) {
	return {
		__html: html
	}
}


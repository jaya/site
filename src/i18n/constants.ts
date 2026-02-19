export const localeEn = 'en' as const
export const localeBr = 'br' as const
export const defaultLocale = localeEn
export const locales = [localeEn, localeBr] as const

export type Locale = (typeof locales)[number]

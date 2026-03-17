/**
 * Centralized social media and external links configuration
 * Update these links here and they will be reflected across the entire site
 */

export const socialLinks = {
	linkedin: 'https://www.linkedin.com/company/jaya-tech',
	github: 'https://github.com/jaya',
	medium: 'https://medium.com/wearejaya'
} as const

export type SocialLink = keyof typeof socialLinks

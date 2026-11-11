import raw from '@/data/site.json';
import type { SiteSettings } from '@/types/site';

/** Typed site settings. Edited by the client from the admin panel (src/data/site.json). */
export const site = raw satisfies SiteSettings as SiteSettings;

/** Strip formatting so a phone number works in a tel: link. */
export const telHref = (phone: string): string => `tel:${phone.replace(/[^\d+]/g, '')}`;

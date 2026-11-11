import raw from '@/data/guides.json';
import type { Guide, GuideSlug } from '@/types/site';

const guides = raw satisfies Record<GuideSlug, Guide> as Record<GuideSlug, Guide>;

export const getGuide = (slug: GuideSlug): Guide => guides[slug];

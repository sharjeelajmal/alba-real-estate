export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
}

export interface Licenses {
  individualNmls: string;
  companyName: string;
  companyNmls: string;
  /** Individual loan originator licenses, shown next to the NMLS number */
  stateLicenses: { state: string; number: string }[];
  /** Real estate licensee shown in the footer (Colorado advertising rules require the brokerage name) */
  realtorName: string;
  realtorLicense: string;
  /** Jorge is also a Colorado real estate licensee */
  jorgeRealtorLicense: string;
  brokerage: string;
}

export type SocialNetwork = 'facebook' | 'x' | 'linkedin' | 'instagram' | 'youtube';

export interface TrustItem {
  /** Must be a name from components/ui/Icon.astro */
  icon: string;
  title: string;
  text: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  instagram?: string;
}

export interface SiteSettings {
  name: string;
  poweredBy: string;
  tagline: string;
  contact: ContactInfo;
  licenses: Licenses;
  licensedStates: string;
  links: {
    calendly: string;
    nmlsConsumerAccess: string;
  };
  disclaimer: string;
  /** Leave a URL empty to hide that icon */
  socials: Partial<Record<SocialNetwork, string>>;
  /** Factual trust points shown in the trust strip (no unverifiable claims) */
  trust: TrustItem[];
  team: TeamMember[];
  tracking: {
    metaPixelId: string;
    ga4Id: string;
  };
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SeoProps {
  title: string;
  description: string;
  /** Exclude from search engines (thank-you pages, internal pages). */
  noindex?: boolean;
  /** Absolute or root-relative path to a 1200x630 share image. */
  image?: string;
}

export interface GuideStep {
  title: string;
  text: string;
}

export interface Guide {
  /** Netlify form name (must be unique per form) */
  formName: string;
  route: string;
  thankYouRoute: string;
  /** Path to the PDF in public/ (replaceable from the admin panel) */
  pdf: string;
  seo: { title: string; description: string };
  badge: string;
  headline: string;
  headlineAccent: string;
  intro: string;
  highlights: string[];
  formTitle: string;
  formNote: string;
  submitLabel: string;
  insideTitle: string;
  /** Second line of the inside heading, shown in gold */
  /** Page count of the PDF, shown in the guide facts */
  pages: number;
  insideAccent: string;
  insideIntro: string;
  steps: GuideStep[];
  /** Compliance footnote shown under the steps */
  note: string;
  cta: { title: string; accent: string; text: string };
  thankYou: {
    title: string;
    text: string;
    downloadLabel: string;
    nextTitle: string;
    nextText: string;
  };
}

export type GuideSlug = 'first-time-homebuyer' | 'self-employed-borrower';

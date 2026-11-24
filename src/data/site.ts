/**
 * Single source of truth for site-wide metadata and navigation.
 * Edit here, and the header, homepage nav, footer and <head> all update.
 */

export const site = {
  name: 'Syntho',
  title: 'Syntho',
  description: 'Projects, music and experiments by Syntho.',
  locale: 'en',
} as const;

export interface NavItem {
  href: string;
  label: string;
  /** Short blurb shown on the large homepage nav tiles. */
  blurb: string;
}

export const nav: readonly NavItem[] = [
  { href: '/about', label: 'About', blurb: 'Who I am, what I do, résumé.' },
  { href: '/projects', label: 'Projects', blurb: 'Code, music and things I have made.' },
];

export interface SocialLink {
  href: string;
  label: string;
}

// TODO: fill in real profiles.
export const socials: readonly SocialLink[] = [
  { href: 'https://github.com/synthojames', label: 'GitHub' },
];

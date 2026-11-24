import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Everything shown on /projects. Add a project by dropping a Markdown file
 * into src/content/projects/. The filename becomes the URL slug.
 * The schema is validated at build time, so a typo in frontmatter fails the build
 * instead of silently rendering a broken card.
 */
export const projectKinds = ['code', 'music', 'art', 'other'] as const;

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().max(200),
      kind: z.enum(projectKinds),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      /** External links: repo, live demo, Bandcamp, SoundCloud... */
      links: z.array(z.object({ label: z.string(), href: z.url() })).default([]),
      /** Optional audio file in /public, e.g. "/audio/track.mp3". */
      audio: z.string().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects };

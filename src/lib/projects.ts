import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

/**
 * Projects visible on the site: drafts are shown in `astro dev` but excluded
 * from production builds. Sorted featured-first, then newest-first.
 */
export async function getPublishedProjects(): Promise<Project[]> {
  const projects = await getCollection(
    'projects',
    ({ data }) => import.meta.env.DEV || !data.draft,
  );
  return projects.sort(
    (a, b) =>
      Number(b.data.featured) - Number(a.data.featured) ||
      b.data.date.getTime() - a.data.date.getTime(),
  );
}

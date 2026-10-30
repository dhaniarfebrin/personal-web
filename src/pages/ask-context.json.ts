import { getCollection } from 'astro:content';
import { techStack } from '../data/techStack';

// Public site content as one JSON file. Read by functions/api/ask.ts via the ASSETS binding.
export async function GET() {
  const [projects, blog, experience] = await Promise.all([
    getCollection('projects'),
    getCollection('blog'),
    getCollection('experience'),
  ]);
  const body = {
    projects: projects.map(({ slug, data, body }) => ({ slug, data, body })),
    blog: blog.map(({ slug, data, body }) => ({ slug, data, body })),
    experience: experience.map(({ id, data }) => ({ id, data: { ...data, end: data.end || 'present' } })),
    techStack,
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
}

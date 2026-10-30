type Project = {
  slug: string;
  title: string;
  description: string;
  technologies: string[];
  image?: string;
  liveUrl?: string;
  githubUrl?: string;
  href: string;
};

const linkCls = 'inline-flex items-center min-h-11 text-xs text-mute hover:text-ink underline';

export default function ProjectCards({ note, projects }: { note: string; projects: Project[] }) {
  return (
    <div class="mt-3">
      <p class="text-xs text-mute mb-2">{note}</p>
      <ul class="grid gap-3 sm:grid-cols-2">
        {projects.map((p) => (
          <li key={p.slug}>
            <article class="h-full border border-hairline bg-surface-soft p-4">
              {p.image && <img src={p.image} alt="" loading="lazy" class="w-full h-32 object-cover object-top mb-3 border border-hairline" />}
              <h3 class="text-sm font-bold text-ink">{p.title}</h3>
              <p class="text-sm text-body mt-1 line-clamp-3">{p.description}</p>
              {p.technologies.length > 0 && <p class="text-xs text-mute mt-2">{p.technologies.slice(0, 5).join(' · ')}</p>}
              <div class="flex flex-wrap gap-x-4 mt-1">
                <a href={p.href} class={linkCls}>[details]</a>
                {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" class={linkCls}>[code]</a>}
                {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" class={linkCls}>[demo]</a>}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}

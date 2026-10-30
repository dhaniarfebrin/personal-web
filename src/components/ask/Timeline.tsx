type Item = { when: string; label: string; detail: string; source: { label: string; href: string } };

export default function Timeline({ title, items }: { title: string; items: Item[] }) {
  return (
    <section class="mt-3" aria-label={title}>
      <h3 class="text-sm font-bold text-ink mb-2">{title}</h3>
      <ol class="border-t border-hairline">
        {items.map((it, i) => (
          <li key={i} class="py-3 border-b border-hairline">
            <p class="text-xs text-mute">{it.when}</p>
            <p class="text-sm text-ink">
              <span class="text-mute">[+]</span> {it.label}
            </p>
            <p class="text-sm text-body mt-1">{it.detail}</p>
            <a href={it.source.href} class="inline-flex items-center min-h-11 text-xs text-mute hover:text-ink underline">
              source: {it.source.label}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}

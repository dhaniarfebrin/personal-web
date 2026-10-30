import { useState } from 'preact/hooks';

type Props = { language: string; code: string; caption: string; source: { label: string; href: string } };

// Reuses the global .code-block / .copy-btn styles from BaseLayout.
export default function CodeBlock({ language, code, caption, source }: Props) {
  const [label, setLabel] = useState('[copy]');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setLabel('[copied]');
    } catch {
      setLabel('[failed]');
    }
    setTimeout(() => setLabel('[copy]'), 1500);
  };
  return (
    <figure class="mt-3">
      <div class="code-block">
        <pre tabindex={0} class="overflow-x-auto bg-surface-soft border border-hairline p-3 text-xs text-ink">
          <code data-language={language}>{code}</code>
        </pre>
        <button type="button" class="copy-btn" aria-label="Copy code to clipboard" onClick={copy}>
          {label}
        </button>
      </div>
      <figcaption class="text-xs text-mute mt-2">
        {caption} ·{' '}
        <a href={source.href} class="underline hover:text-ink">
          {source.label}
        </a>
      </figcaption>
    </figure>
  );
}

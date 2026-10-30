import { useEffect, useRef, useState } from 'preact/hooks';
import { type Msg, type UiEvent } from '../../lib/ask/core';
import ProjectCards from './ProjectCards';
import Timeline from './Timeline';
import CodeBlock from './CodeBlock';
import Suggestions from './Suggestions';

type Turn = { q: string; text: string; ui: UiEvent[]; error?: string };

const EXAMPLES = [
  'What has Dhaniar worked on professionally?',
  "Show me Dhaniar's projects",
  'How was BPMN AI Studio built?',
];
const SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined;
const GENERIC_ERROR = 'Assistant unavailable, try again later.';

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, o: Record<string, unknown>) => string; reset: (id?: string) => void };
  }
}

// Last 6 messages, answer text only (no notes about components, so the model has nothing to imitate).
// Turns without text are skipped to keep user/assistant pairs valid.
function toHistory(turns: Turn[]): Msg[] {
  const msgs: Msg[] = [];
  for (const t of turns) {
    const content = t.text.trim().slice(0, 1500);
    if (content) msgs.push({ role: 'user', content: t.q }, { role: 'assistant', content });
  }
  return msgs.slice(-6);
}

function renderUi(e: UiEvent, onPick: (q: string) => void) {
  const p = e.props as any;
  switch (e.name) {
    case 'project_cards':
      return <ProjectCards note={p.note} projects={p.projects} />;
    case 'timeline':
      return <Timeline title={p.title} items={p.items} />;
    case 'code':
      return <CodeBlock language={p.language} code={p.code} caption={p.caption} source={p.source} />;
    case 'suggestions':
      return <Suggestions questions={p.questions} onPick={onPick} />;
  }
}

export default function AskApp() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string>();
  const abortRef = useRef<AbortController>();

  useEffect(() => {
    if (!SITE_KEY) return;
    const mount = () =>
      (widgetId.current = window.turnstile!.render(widgetRef.current!, {
        sitekey: SITE_KEY,
        callback: setToken,
        'expired-callback': () => setToken(''),
        'error-callback': () => setToken(''),
      }));
    if (window.turnstile) return void mount();
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = mount;
    document.head.appendChild(s);
  }, []);

  const patchLast = (fn: (t: Turn) => Turn) => setTurns((ts) => ts.map((t, i) => (i === ts.length - 1 ? fn(t) : t)));

  async function send(q: string) {
    q = q.trim();
    if (!q || busy || !token) return;
    const history = toHistory(turns);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setBusy(true);
    setInput('');
    setTurns((ts) => [...ts, { q, text: '', ui: [] }]);
    inputRef.current?.focus();
    const sentToken = token;
    // Turnstile tokens are single-use
    setToken('');
    window.turnstile?.reset(widgetId.current);

    const handle = (line: string) => {
      let e: any;
      try {
        e = JSON.parse(line);
      } catch {
        return;
      }
      if (e.type === 'text') patchLast((t) => ({ ...t, text: t.text + e.text }));
      else if (e.type === 'ui') patchLast((t) => ({ ...t, ui: [...t.ui, e] }));
      else if (e.type === 'error') patchLast((t) => ({ ...t, error: String(e.message ?? GENERIC_ERROR) }));
    };

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q, history, token: sentToken }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const e = await res.json().catch(() => null);
        patchLast((t) => ({ ...t, error: e?.message ?? GENERIC_ERROR }));
        return;
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buf = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += value;
        let i;
        while ((i = buf.indexOf('\n')) >= 0) {
          handle(buf.slice(0, i));
          buf = buf.slice(i + 1);
        }
      }
      if (buf.trim()) handle(buf);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') patchLast((t) => ({ ...t, error: GENERIC_ERROR }));
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  const pick = (q: string) => {
    send(q);
    inputRef.current?.focus();
  };

  return (
    <div>
      {turns.length === 0 && (
        <div class="mb-6">
          <p class="text-xs text-mute mb-2">Try one of these:</p>
          <Suggestions questions={EXAMPLES} onPick={pick} />
        </div>
      )}

      <div role="log" aria-live="polite" aria-busy={busy} aria-label="Conversation" class="space-y-6">
        {turns.map((t, i) => (
          <div key={i}>
            <p class="text-sm text-ink font-bold">
              <span class="text-mute">[&gt;]</span> {t.q}
            </p>
            <div class="mt-2 text-sm text-body">
              {t.text && (
                <p class="whitespace-pre-wrap break-words">
                  <span class="text-mute">[+]</span> {t.text}
                </p>
              )}
              {t.ui.map((u, j) =>
                // only the latest answer keeps clickable follow-ups
                u.name === 'suggestions' && i !== turns.length - 1 ? null : <div key={j}>{renderUi(u, pick)}</div>,
              )}
              {busy && i === turns.length - 1 && !t.text && t.ui.length === 0 && !t.error && <p class="text-mute">[...] thinking</p>}
              {t.error && (
                <p role="alert" class="mt-2 text-sm text-ink border border-danger px-3 py-2">
                  [!] {t.error}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <form
        class="mt-8 pt-4 border-t border-hairline"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <label for="ask-q" class="block text-xs text-mute mb-1">
          Your question
        </label>
        <div class="flex gap-2">
          <input
            id="ask-q"
            ref={inputRef}
            type="text"
            maxLength={500}
            autocomplete="off"
            value={input}
            onInput={(e) => setInput(e.currentTarget.value)}
            class="flex-1 min-w-0 min-h-11 px-3 text-sm bg-canvas text-ink border border-hairline-strong"
          />
          {busy ? (
            <button type="button" onClick={() => abortRef.current?.abort()} class="min-h-11 px-3 text-sm text-ink border border-hairline-strong hover:bg-surface-soft">
              [ stop ]
            </button>
          ) : (
            <button type="submit" disabled={!token || !input.trim()} class="min-h-11 px-3 text-sm text-ink border border-hairline-strong hover:bg-surface-soft disabled:text-mute disabled:cursor-not-allowed">
              [ ask ]
            </button>
          )}
        </div>
        <div ref={widgetRef} class="mt-3" />
        {!SITE_KEY ? (
          <p role="alert" class="mt-2 text-xs text-ink">[!] Verification is not configured (PUBLIC_TURNSTILE_SITE_KEY).</p>
        ) : (
          !token && <p class="mt-2 text-xs text-mute">[...] verifying you are human</p>
        )}
      </form>
    </div>
  );
}

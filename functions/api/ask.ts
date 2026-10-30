import type { PagesFunction, Fetcher } from '@cloudflare/workers-types';
import { buildSystem, buildTools, MAX_TOKENS, sanitizeRequest, validateUi, type Ctx, type UiEvent } from '../../src/lib/ask/core';

type Env = {
  ASSETS: Fetcher;
  DEEPSEEK_API_KEY?: string;
  TURNSTILE_SECRET?: string;
  LLM_MODEL?: string;
  LLM_BASE_URL?: string;
};

const ERR = 'Assistant unavailable, try again later.';
const MAX_BODY = 8 * 1024;
const MAX_UI = 3;
const enc = new TextEncoder();

const fail = (status: number, message: string) =>
  new Response(JSON.stringify({ type: 'error', message }) + '\n', {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

let cached: { system: string; tools: ReturnType<typeof buildTools>; ctx: Ctx } | undefined;

// NOTE: no per-IP rate limit on Pages Functions; move to Workers rate-limit binding or KV counter if abused
export const onRequestPost: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  if (request.headers.get('Origin') !== new URL(request.url).origin) return fail(403, 'Forbidden.');
  if (Number(request.headers.get('Content-Length') ?? 0) > MAX_BODY) return fail(413, 'Request too large.');
  const raw = await request.text();
  if (enc.encode(raw).length > MAX_BODY) return fail(413, 'Request too large.');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fail(400, 'Invalid request.');
  }
  const req = sanitizeRequest(parsed);
  if (!req) return fail(400, 'Invalid request.');

  if (!env.TURNSTILE_SECRET || !env.DEEPSEEK_API_KEY) {
    console.log('ask: missing TURNSTILE_SECRET or DEEPSEEK_API_KEY');
    return fail(500, ERR);
  }
  if (!req.token) return fail(403, 'Verification failed.');
  const ip = request.headers.get('CF-Connecting-IP');
  const form = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: req.token });
  if (ip) form.set('remoteip', ip);
  try {
    const v = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    if (!((await v.json()) as { success?: boolean }).success) return fail(403, 'Verification failed.');
  } catch {
    return fail(502, ERR);
  }

  if (!cached) {
    try {
      const res = await env.ASSETS.fetch(new URL('/ask-context.json', request.url).toString());
      if (!res.ok) throw new Error(String(res.status));
      const ctx = (await res.json()) as Ctx;
      cached = { ctx, system: buildSystem(ctx), tools: buildTools(ctx) };
    } catch (e) {
      console.log('ask: context unavailable', String(e));
      return fail(500, ERR);
    }
  }
  const { ctx, system, tools } = cached;

  let upstream: Response;
  try {
    upstream = await fetch(`${env.LLM_BASE_URL || 'https://api.deepseek.com'}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.DEEPSEEK_API_KEY}` },
      signal: AbortSignal.timeout(45_000),
      body: JSON.stringify({
        model: env.LLM_MODEL || 'deepseek-flash',
        stream: true,
        stream_options: { include_usage: true },
        max_tokens: MAX_TOKENS,
        // DeepSeek V4 thinks by default; not needed here and slower/costlier
        thinking: { type: 'disabled' },
        tools,
        tool_choice: 'auto',
        messages: [{ role: 'system', content: system }, ...req.history, { role: 'user', content: req.q }],
      }),
    });
  } catch (e) {
    console.log('ask: upstream fetch failed', String(e));
    return fail(502, ERR);
  }
  if (!upstream.ok || !upstream.body) {
    console.log('ask: upstream status', upstream.status);
    return fail(502, ERR);
  }

  const { readable, writable } = new TransformStream();
  const w = writable.getWriter();
  const emit = (o: object) => w.write(enc.encode(JSON.stringify(o) + '\n'));

  const run = async () => {
    try {
      const reader = upstream.body!.pipeThrough(new TextDecoderStream()).getReader();
      const calls: { name: string; args: string }[] = [];
      let buf = '';
      let finish: string | null = null;
      let usage: Record<string, number> | undefined;

      const handle = async (line: string) => {
        if (!line.startsWith('data:')) return;
        const data = line.slice(5).trim();
        if (!data || data === '[DONE]') return;
        let j: any;
        try {
          j = JSON.parse(data);
        } catch {
          return;
        }
        if (j.usage) usage = j.usage;
        const c = j.choices?.[0];
        if (!c) return;
        if (c.delta?.content) await emit({ type: 'text', text: c.delta.content });
        for (const tc of c.delta?.tool_calls ?? []) {
          const cur = (calls[tc.index ?? 0] ??= { name: '', args: '' });
          cur.name += tc.function?.name ?? '';
          cur.args += tc.function?.arguments ?? '';
        }
        if (c.finish_reason) finish = c.finish_reason;
      };

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += value;
        let i;
        while ((i = buf.indexOf('\n')) >= 0) {
          await handle(buf.slice(0, i));
          buf = buf.slice(i + 1);
        }
      }
      await handle(buf);

      if (usage) {
        console.log(
          JSON.stringify({
            usage: {
              prompt_tokens: usage.prompt_tokens,
              prompt_cache_hit_tokens: usage.prompt_cache_hit_tokens,
              completion_tokens: usage.completion_tokens,
            },
          }),
        );
      }
      if (finish && !['stop', 'tool_calls', 'length'].includes(finish)) {
        console.log('ask: finish_reason', finish);
        await emit({ type: 'error', message: ERR });
      } else if (finish !== 'length') {
        // a truncated (length) tool call is dropped; otherwise validate each one
        const uis = calls
          .filter(Boolean)
          .map((c) => validateUi(c.name, c.args, ctx))
          .filter((u): u is UiEvent => u !== null)
          .slice(0, MAX_UI);
        for (const u of uis) await emit(u);
      }
      await emit({ type: 'done' });
    } catch (e) {
      console.log('ask: stream failed', String(e));
      await emit({ type: 'error', message: ERR }).catch(() => {});
    } finally {
      await w.close().catch(() => {});
    }
  };
  waitUntil(run());

  return new Response(readable, {
    headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store' },
  });
};

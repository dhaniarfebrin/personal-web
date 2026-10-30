import { describe, expect, test } from 'bun:test';
import { buildSystem, buildTools, sanitizeRequest, validateUi, type Ctx } from './core';

const ctx: Ctx = {
  projects: [
    {
      slug: 'alpha',
      data: { title: 'Alpha', description: 'd', technologies: ['React'], image: '/i.png', liveUrl: 'https://a.test', githubUrl: '' },
      body: 'intro\n```ts\nexport function  hello() {\n  return 1;\n}\n```',
    },
    { slug: 'beta', data: { title: 'Beta', description: 'd2', technologies: [] }, body: 'x' },
  ],
  blog: [{ slug: 'post', data: { title: 'Post', description: 'd', publishedAt: '2026-01-01' }, body: 'const a = 1;' }],
  experience: [{ id: 'job', data: { org: 'Org', role: 'Dev', kind: 'work', start: '2025-01', highlights: [], technologies: [] } }],
  techStack: ['React'],
};
const J = JSON.stringify;
const req = (o: object = {}) => ({ q: 'hi', token: 't', history: [], ...o });

describe('sanitizeRequest', () => {
  test('valid', () => expect(sanitizeRequest(req())?.q).toBe('hi'));
  test('q empty / too long / not string', () => {
    expect(sanitizeRequest(req({ q: '  ' }))).toBeNull();
    expect(sanitizeRequest(req({ q: 'x'.repeat(501) }))).toBeNull();
    expect(sanitizeRequest(req({ q: 1 }))).toBeNull();
  });
  test('token missing becomes empty string (server rejects it)', () => expect(sanitizeRequest({ q: 'hi' })?.token).toBe(''));
  test('history > 6, wrong role order, too long', () => {
    const h = (n: number) => Array.from({ length: n }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'a' }));
    expect(sanitizeRequest(req({ history: h(6) }))?.history).toHaveLength(6);
    expect(sanitizeRequest(req({ history: h(8) }))).toBeNull();
    expect(sanitizeRequest(req({ history: [{ role: 'assistant', content: 'a' }, { role: 'user', content: 'a' }] }))).toBeNull();
    expect(sanitizeRequest(req({ history: [{ role: 'system', content: 'a' }, { role: 'assistant', content: 'a' }] }))).toBeNull();
    expect(sanitizeRequest(req({ history: h(1) }))).toBeNull();
    expect(sanitizeRequest(req({ history: [{ role: 'user', content: 'x'.repeat(1501) }, { role: 'assistant', content: 'a' }] }))).toBeNull();
  });
});

describe('validateUi', () => {
  test('show_projects takes props from content, drops empty urls', () => {
    const ui = validateUi('show_projects', J({ slugs: ['alpha'], note: 'n', title: '<img onerror=x>' }), ctx);
    expect(ui?.name).toBe('project_cards');
    expect((ui?.props as any).projects[0]).toEqual({
      slug: 'alpha', title: 'Alpha', description: 'd', technologies: ['React'], image: '/i.png',
      liveUrl: 'https://a.test', githubUrl: undefined, href: '/projects/alpha',
    });
  });
  test('show_projects rejects bad slug, duplicates, count, long note', () => {
    expect(validateUi('show_projects', J({ slugs: ['nope'], note: 'n' }), ctx)).toBeNull();
    expect(validateUi('show_projects', J({ slugs: ['alpha', 'alpha'], note: 'n' }), ctx)).toBeNull();
    expect(validateUi('show_projects', J({ slugs: [], note: 'n' }), ctx)).toBeNull();
    expect(validateUi('show_projects', J({ slugs: ['alpha', 'beta', 'alpha', 'x'], note: 'n' }), ctx)).toBeNull();
    expect(validateUi('show_projects', J({ slugs: ['alpha'], note: 'n'.repeat(161) }), ctx)).toBeNull();
  });
  const item = (o = {}) => ({ when: '2025', label: 'L', detail: 'D', source: 'experience:job', ...o });
  test('show_timeline ok with source links', () => {
    const ui = validateUi('show_timeline', J({ title: 'T', items: [item(), item({ source: 'project:alpha' }), item({ source: 'blog:post' })] }), ctx);
    expect((ui?.props as any).items.map((i: any) => i.source.href)).toEqual(['/#experience', '/projects/alpha', '/blog/post']);
  });
  test('show_timeline rejects unknown source, length limits, item count', () => {
    expect(validateUi('show_timeline', J({ title: 'T', items: [item(), item({ source: 'experience:ghost' })] }), ctx)).toBeNull();
    expect(validateUi('show_timeline', J({ title: 'T', items: [item(), item({ when: 'x'.repeat(33) })] }), ctx)).toBeNull();
    expect(validateUi('show_timeline', J({ title: 'T', items: [item(), item({ detail: 'x'.repeat(201) })] }), ctx)).toBeNull();
    expect(validateUi('show_timeline', J({ title: 'T', items: [item()] }), ctx)).toBeNull();
    expect(validateUi('show_timeline', J({ title: 'T', items: Array(9).fill(item()) }), ctx)).toBeNull();
  });
  const code = (o = {}) => ({ source: 'project:alpha', language: 'ts', code: 'export function hello() {\n return 1;\n}', caption: 'c', ...o });
  test('show_code accepts whitespace-normalized substring', () => {
    expect(validateUi('show_code', J(code()), ctx)?.name).toBe('code');
  });
  test('show_code rejects non-substring, bad language/source, limits', () => {
    expect(validateUi('show_code', J(code({ code: 'rm -rf /' })), ctx)).toBeNull();
    expect(validateUi('show_code', J(code({ source: 'project:beta' })), ctx)).toBeNull();
    expect(validateUi('show_code', J(code({ language: 'python' })), ctx)).toBeNull();
    expect(validateUi('show_code', J(code({ source: 'experience:job' })), ctx)).toBeNull();
    expect(validateUi('show_code', J(code({ caption: 'x'.repeat(161) })), ctx)).toBeNull();
    const long = { ...ctx, blog: [{ ...ctx.blog[0], body: 'a\n'.repeat(50) }] };
    expect(validateUi('show_code', J(code({ source: 'blog:post', code: 'a\n'.repeat(41) })), long)).toBeNull();
  });
  test('suggest_questions', () => {
    expect(validateUi('suggest_questions', J({ questions: ['a', 'b'] }), ctx)?.name).toBe('suggestions');
    expect(validateUi('suggest_questions', J({ questions: [] }), ctx)).toBeNull();
    expect(validateUi('suggest_questions', J({ questions: ['a', 'b', 'c', 'd'] }), ctx)).toBeNull();
    expect(validateUi('suggest_questions', J({ questions: ['x'.repeat(91)] }), ctx)).toBeNull();
  });
  test('broken json / unknown tool', () => {
    expect(validateUi('show_projects', '{"slugs": ["alp', ctx)).toBeNull();
    expect(validateUi('show_projects', 'null', ctx)).toBeNull();
    expect(validateUi('rm_rf', '{}', ctx)).toBeNull();
  });
});

describe('buildTools / buildSystem', () => {
  test('enums are sorted and stable', () => {
    const t = buildTools({ ...ctx, projects: [...ctx.projects].reverse() });
    expect((t[0].function.parameters as any).properties.slugs.items.enum).toEqual(['alpha', 'beta']);
    expect(J(buildTools(ctx))).toBe(J(buildTools(ctx)));
  });
  test('context comes first in system prompt', () => expect(buildSystem(ctx).startsWith('<context>')).toBe(true));
  test('system prompt tells the model about present end and no UI markers', () => {
    const s = buildSystem(ctx);
    expect(s).toContain("end 'present'");
    expect(s).toContain('Never write UI markers');
  });
});

export const readTime = (body: string) => Math.ceil(body.trim().split(/\s+/).length / 200);

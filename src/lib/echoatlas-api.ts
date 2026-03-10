const BASE_URL = (process.env.ECHOATLAS_BASE_URL || 'https://echo-atlas.com').replace(/\/+$/, '');
const API_KEY = process.env.ECHOATLAS_API_KEY || '';

export async function echoatlasGet(path: string, params?: Record<string, string>): Promise<Response> {
  const url = new URL(path, BASE_URL);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v) url.searchParams.set(k, v);
    }
  }

  return fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: 'application/json',
    },
    next: { revalidate: 60 },
  });
}

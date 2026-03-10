import { NextResponse } from 'next/server';
import { echoatlasGet } from '@/lib/echoatlas-api';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get('from') || new Date(Date.now() - 7 * 86400000).toISOString();
  const to = request.nextUrl.searchParams.get('to') || new Date().toISOString();
  const type = request.nextUrl.searchParams.get('type') || '';
  const limit = request.nextUrl.searchParams.get('limit') || '100';

  const res = await echoatlasGet('/api/observatory/underground/events', { from, to, type, limit });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

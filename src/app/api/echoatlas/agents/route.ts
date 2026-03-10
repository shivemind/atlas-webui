import { NextResponse } from 'next/server';
import { echoatlasGet } from '@/lib/echoatlas-api';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get('page') || '1';
  const pageSize = request.nextUrl.searchParams.get('pageSize') || '20';

  const res = await echoatlasGet('/api/observatory/v1/agents', { page, pageSize });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

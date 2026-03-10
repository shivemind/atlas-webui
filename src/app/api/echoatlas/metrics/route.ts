import { NextResponse } from 'next/server';
import { echoatlasGet } from '@/lib/echoatlas-api';

export async function GET() {
  const res = await echoatlasGet('/api/observatory/v1/metrics');
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

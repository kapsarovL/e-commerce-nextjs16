import { type NextRequest, NextResponse } from 'next/server';
import { verifyGoogleCrawler } from '@/lib/verify-crawler';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const ip = req.nextUrl.searchParams.get('ip');

  if (!ip) {
    return NextResponse.json({ error: 'Missing "ip" query parameter' }, { status: 400 });
  }

  const ipv4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  if (!ipv4.test(ip)) {
    return NextResponse.json({ error: 'Invalid IPv4 address' }, { status: 400 });
  }

  try {
    const result = await verifyGoogleCrawler(ip);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'DNS lookup failed' }, { status: 500 });
  }
}

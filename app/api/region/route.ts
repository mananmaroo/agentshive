import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const requestHeaders = await headers();
  const rawCountry = requestHeaders.get('x-vercel-ip-country') ?? '';
  const country = /^[A-Za-z]{2}$/.test(rawCountry) ? rawCountry.toUpperCase() : 'ROW';

  return NextResponse.json(
    { country },
    {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    },
  );
}

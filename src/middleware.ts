import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

function rateLimit(request: NextRequest): NextResponse | null {
  // Simple in-memory rate limiter (per Edge instance)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ip = (request as any).ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
  
  if (ip === 'unknown') return null;

  const WINDOW_MS = 60 * 1000; // 1 minute
  const MAX_REQUESTS = 100; // 100 requests per minute per IP

  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.timestamp > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    // Clean up old entries to prevent memory leaks in long-running instances
    if (rateLimitMap.size > 10000) {
      const keysToDelete = Array.from(rateLimitMap.keys()).slice(0, 1000);
      for (const key of keysToDelete) {
        rateLimitMap.delete(key);
      }
    }
    return null;
  }

  if (record.count >= MAX_REQUESTS) {
    return new NextResponse(JSON.stringify({ error: 'Too Many Requests' }), { 
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  record.count++;
  return null;
}

export async function middleware(request: NextRequest) {
  // WAF: Rate limit API routes to prevent abuse
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const rateLimitResponse = rateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;
  }

  return await updateSession(request)
}
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|wav)$).*)',
  ],
}

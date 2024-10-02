import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  headers: true,
});

export async function middleware(request: NextRequest) {
  // Apply rate limiting only to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    return new Promise((resolve, reject) => {
      limiter(request as any, NextResponse.next() as any, (result: any) => {
        if (result instanceof Error) {
          reject(result);
        }
        resolve(result);
      });
    })
      .then(() => {
        return NextResponse.next();
      })
      .catch((error) => {
        return new NextResponse(
          JSON.stringify({ success: false, message: error.message || 'Too many requests' }),
          { status: 429, headers: { 'content-type': 'application/json' } }
        );
      });
  }

  // For non-API routes, just proceed to the next middleware or route handler
  return NextResponse.next();
}

// Optional: Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
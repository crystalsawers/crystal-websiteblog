// app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const loggedInCookie = request.cookies.get('loggedIn');
  
  const isLoggedIn = (loggedInCookie?.value ?? '') === 'true';

  if (!isLoggedIn && url.pathname.startsWith('/protected-page')) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/protected-page'], // Adjust if needed
};

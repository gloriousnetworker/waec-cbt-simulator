// src/app/api/proxy/[...path]/route.js
//
// Same-origin proxy for the CBT backend.
//
// WHY THIS EXISTS:
//   iOS Safari (ITP) and PWA standalone mode block cross-origin cookies.
//   The backend is at cbt-simulator-backend.vercel.app; the frontend is at
//   a different Vercel domain.  Any fetch with credentials: 'include' from
//   the browser to the backend fails silently on iOS — the session cookie is
//   never sent, every protected route returns 401, and the user is bounced to
//   the login screen immediately after logging in.
//
//   By routing all API calls through this Next.js route handler, the browser
//   only ever talks to its own origin (same-origin). Cookies are first-party
//   and iOS Safari never blocks them.  The Next.js server then forwards the
//   request to the real backend server-to-server (no ITP restrictions there).
//
// HOW IT WORKS:
//   Browser → GET /api/proxy/student/profile   (same-origin, first-party)
//   Next.js server → GET https://cbt-simulator-backend.vercel.app/api/student/profile
//   Response (including Set-Cookie) forwarded back to browser
//   Set-Cookie domain stripped so cookie is stored on the frontend domain
//
// CORS:  The backend already whitelists the frontend origins.
//        This proxy also means the CORS preflight never hits the real backend
//        from mobile — another source of cross-origin breakage eliminated.

import { NextResponse } from 'next/server';

const BACKEND = 'https://cbt-simulator-backend.vercel.app';

async function handler(request, context) {
  try {
    const { path } = await context.params;
    const segments = Array.isArray(path) ? path : [path];
    const pathStr = segments.join('/');

    const { search } = new URL(request.url);
    const targetUrl = `${BACKEND}/api/${pathStr}${search}`;

    // Forward only the headers the backend needs
    const forwardHeaders = {};
    const contentType = request.headers.get('content-type');
    if (contentType) forwardHeaders['content-type'] = contentType;

    // Forward the session cookies the browser sent with this request
    const cookie = request.headers.get('cookie');
    if (cookie) forwardHeaders['cookie'] = cookie;

    let body;
    if (!['GET', 'HEAD'].includes(request.method)) {
      body = await request.arrayBuffer();
    }

    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body,
      redirect: 'manual', // don't follow redirects — pass them through
    });

    const responseData = await upstream.arrayBuffer();
    const responseHeaders = new Headers();

    const upContentType = upstream.headers.get('content-type');
    if (upContentType) responseHeaders.set('content-type', upContentType);

    // Forward Set-Cookie headers.
    // Strip the backend domain so the browser stores them on the frontend
    // origin (first-party).  Keep Secure and HttpOnly intact.
    const setCookies = (() => {
      try {
        // Node 18+ / undici — returns an array when multiple Set-Cookie headers exist
        return upstream.headers.getSetCookie();
      } catch {
        const single = upstream.headers.get('set-cookie');
        return single ? [single] : [];
      }
    })();

    for (const c of setCookies) {
      const cleaned = c
        .replace(/;\s*domain=[^;,]*/gi, '')        // remove backend domain
        .replace(/;\s*samesite=\w+/gi, '; SameSite=Lax'); // relax samesite
      responseHeaders.append('set-cookie', cleaned);
    }

    return new NextResponse(responseData, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error('[proxy] error:', err);
    return NextResponse.json(
      { error: 'Proxy error', message: String(err) },
      { status: 502 }
    );
  }
}

export const GET     = handler;
export const POST    = handler;
export const PUT     = handler;
export const PATCH   = handler;
export const DELETE  = handler;
export const OPTIONS = handler;

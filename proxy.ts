import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
 
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              maxAge: 7200, // Duración de sesión de 2 horas (7200 segundos)
            })
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const url = request.nextUrl.clone();

  // Si intentan entrar al dashboard sin sesión activa
  if (url.pathname.startsWith('/dashboard') && !user) {
    const attemptedUrl = request.nextUrl.pathname + request.nextUrl.search;
    url.pathname = '/login';
    url.searchParams.set('next', attemptedUrl);

    const redirectResponse = NextResponse.redirect(url);
    
    // Guardamos la ruta exacta (ej. /dashboard/encuestas/uuid) en una cookie por 2 horas
    redirectResponse.cookies.set('next_url', attemptedUrl, {
      path: '/',
      maxAge: 7200,
      httpOnly: false,
      sameSite: 'lax',
    });

    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
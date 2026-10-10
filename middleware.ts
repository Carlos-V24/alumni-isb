import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
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
              maxAge: 7200, // Duración de sesión de 2 horas (7200s)
            })
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const url = request.nextUrl.clone();

  // 1. Si intentan entrar al dashboard SIN sesión activa -> Enviar a Login
  if (url.pathname.startsWith('/dashboard') && !user) {
    const attemptedUrl = request.nextUrl.pathname + request.nextUrl.search;
    url.pathname = '/login';
    url.searchParams.set('next', attemptedUrl);

    const redirectResponse = NextResponse.redirect(url);
    
    // Guardar la cookie temporal solo si es un enlace profundo
    if (attemptedUrl !== '/dashboard' && attemptedUrl !== '/dashboard/') {
      redirectResponse.cookies.set('next_url', attemptedUrl, {
        path: '/',
        maxAge: 900,
        httpOnly: false,
        sameSite: 'lax',
      });
    }

    return redirectResponse;
  }

  // 2. Si intentan entrar a Auth CON sesión activa -> Enviar al Dashboard
  const authRoutes = ['/login', '/sign-up', '/recuperar-contrasena', '/restablecer-contrasena'];
  
  if (authRoutes.includes(url.pathname) && user) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Ahora el middleware vigila el dashboard Y las páginas de acceso
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/sign-up',
    '/recuperar-contrasena',
    '/restablecer-contrasena'
  ],
};
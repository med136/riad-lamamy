import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Récupérer l'utilisateur
  const { data: { user } } = await supabase.auth.getUser()

  // Routes protégées
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') &&
                      !request.nextUrl.pathname.startsWith('/admin/login')

  // Si pas connecté et essaye d'accéder à une route admin
  if (!user && isAdminRoute) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Si connecté et sur la page login
  if (user && request.nextUrl.pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ]
}

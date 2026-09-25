import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/adminClient'
import { getAdminAccessDecision } from '@/lib/admin-auth'

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

  const pathname = request.nextUrl.pathname
  const concernsAdmin = pathname === '/admin' || pathname.startsWith('/admin/') ||
    pathname === '/api/admin' || pathname.startsWith('/api/admin/')

  let hasAdminProfile = false
  if (user && concernsAdmin) {
    const admin = createAdminClient()
    const { data } = await admin
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()
    hasAdminProfile = !!data
  }

  const decision = getAdminAccessDecision(pathname, !!user, hasAdminProfile)

  if (decision === 'unauthorized') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  if (decision === 'forbidden') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }
  if (decision === 'redirect-login') {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  if (decision === 'redirect-dashboard') {
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

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // --- Unauthenticated ---
  if (!user) {
    if (pathname === '/login') return response
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // --- Authenticated ---
  const role    = (user.app_metadata?.role as string | undefined) ?? ''
  const isAdmin = role === 'admin'

  if (pathname === '/login' || pathname === '/') {
    return NextResponse.redirect(
      new URL(isAdmin ? '/admin' : '/merchant', request.url)
    )
  }

  if (pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/merchant', request.url))
  }

  if (pathname.startsWith('/merchant') && isAdmin) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return response
}

export const config = {
  matcher: ['/', '/login', '/admin/:path*', '/merchant/:path*'],
}

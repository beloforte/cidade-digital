import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

const PUBLICAS = ['/login', '/cadastro', '/demo']

export async function middleware(req) {
  let res = NextResponse.next({ request: { headers: req.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      db: { schema: 'ncd' },
      cookies: {
        get: (n) => req.cookies.get(n)?.value,
        set: (n, v, o) => res.cookies.set({ name: n, value: v, ...o }),
        remove: (n, o) => res.cookies.set({ name: n, value: '', ...o }),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = req.nextUrl
  const ehPublica = pathname === '/' || PUBLICAS.some((p) => pathname.startsWith(p))

  // sem sessão e fora das públicas -> login
  if (!user && !ehPublica) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // com sessão em /login, /cadastro ou / -> manda para a home do papel
  if (user && (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/cadastro'))) {
    const { data: papeis } = await supabase
      .from('papeis').select('papel').eq('usuario_id', user.id)
    const lista = (papeis || []).map((p) => p.papel)
    const destino = lista.includes('admin') ? '/admin'
                  : lista.includes('lojista') ? '/lojista'
                  : '/cliente'
    const url = req.nextUrl.clone()
    url.pathname = destino
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

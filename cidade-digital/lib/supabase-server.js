import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerSupabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      db: { schema: 'ncd' },
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
        set(name, value, options) {
          try { cookieStore.set({ name, value, ...options }) } catch (e) {}
        },
        remove(name, options) {
          try { cookieStore.set({ name, value: '', ...options }) } catch (e) {}
        },
      },
    }
  )
}

/** Retorna { user, perfil, papeis } ou null */
export async function getSessao() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: perfil }, { data: papeis }] = await Promise.all([
    supabase.from('usuarios').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('papeis').select('papel').eq('usuario_id', user.id),
  ])

  return {
    supabase,
    user,
    perfil: perfil || null,
    papeis: (papeis || []).map((p) => p.papel),
  }
}

export function homeDoPapel(papeis = []) {
  if (papeis.includes('admin')) return '/admin'
  if (papeis.includes('lojista')) return '/lojista'
  return '/cliente'
}

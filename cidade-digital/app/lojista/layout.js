import { redirect } from 'next/navigation'
import { getSessao } from '@/lib/supabase-server'
import Nav from '@/components/Nav'

export default async function Layout({ children }) {
  const s = await getSessao()
  if (!s) redirect('/login')
  if (!s.papeis.includes('lojista') && !s.papeis.includes('admin')) redirect('/cliente')
  return (
    <>
      <Nav papeis={s.papeis} nome={s.perfil?.nome} />
      <main className="wrap" style={{ padding: '22px 18px 60px' }}>{children}</main>
    </>
  )
}

import { redirect } from 'next/navigation'
import { getSessao, homeDoPapel } from '@/lib/supabase-server'
import Nav from '@/components/Nav'

export default async function Layout({ children }) {
  const s = await getSessao()
  if (!s) redirect('/login')
  return (
    <>
      <Nav papeis={s.papeis} nome={s.perfil?.nome} />
      <main className="wrap" style={{ padding: '22px 18px 60px' }}>{children}</main>
    </>
  )
}

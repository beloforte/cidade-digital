'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { temEnvSupabase } from '@/lib/env'

export default function Nav({ papeis = [], nome, demo = false }) {
  const path = usePathname()
  const router = useRouter()
  const supabase = temEnvSupabase() ? createClient() : null

  const links = []
  if (demo) {
    links.push(['/demo?t=cliente', 'Início'], ['/demo?t=quiz', 'Quiz'], ['/demo?t=cupons', 'Meus cupons'])
  } else if (papeis.includes('cliente') || papeis.length === 0) {
    links.push(['/cliente', 'Início'], ['/cliente/quiz', 'Quiz'], ['/cliente/cupons', 'Meus cupons'])
  }
  if (papeis.includes('lojista')) {
    links.push(['/lojista', 'Minha loja'], ['/lojista/receita', 'Minha fatura'])
  }
  if (papeis.includes('admin')) {
    links.push(['/admin', 'Admin'], ['/admin/receita', 'Receita'])
  }

  async function sair() {
    if (demo) { window.location.href = '/'; return }
    if (supabase) await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="nav">
      <div className="wrap">
        <div className="brand"><span className="dot" /> Cidade Digital</div>
        <div className="navlinks">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className={path === href ? 'on' : ''}>{label}</Link>
          ))}
        </div>
        <div className="row">
          {nome && <span className="tiny muted">{nome}</span>}
          <button className="btn ghost" onClick={sair} style={{ padding: '7px 12px', fontSize: 13 }}>
            Sair
          </button>
        </div>
      </div>
    </nav>
  )
}

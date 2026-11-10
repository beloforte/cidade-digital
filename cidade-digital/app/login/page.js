'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import { temEnvSupabase } from '@/lib/env'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const confirmado = params.get('confirmado') === '1'
  const supabase = temEnvSupabase() ? createClient() : null
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    if (!supabase) { setErro('Configuracao ausente: veja o aviso acima.'); return }
    setCarregando(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password: senha,
      })
      if (error) throw new Error('E-mail ou senha inválidos.')

      const { data: papeis } = await supabase
        .from('papeis').select('papel').eq('usuario_id', data.user.id)
      const lista = (papeis || []).map((p) => p.papel)
      const destino = lista.includes('admin') ? '/admin'
                    : lista.includes('lojista') ? '/lojista'
                    : '/cliente'
      router.push(destino)
      router.refresh()
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="center">
      <form className="card auth" onSubmit={entrar}>
        <h1>Entrar</h1>
        <p className="muted small" style={{ marginTop: 0, marginBottom: 18 }}>
          Use o e-mail e a senha da sua conta.
        </p>

        {confirmado && !erro && (
          <div className="alert ok">
            E-mail confirmado. Entre com a senha que você cadastrou.
          </div>
        )}

        {!supabase && (
          <div className="alert err">
            Faltam as variaveis de ambiente (NEXT_PUBLIC_SUPABASE_URL e
            NEXT_PUBLIC_SUPABASE_ANON_KEY). Configure na Vercel e faca Redeploy.
          </div>
        )}

        {erro && <div className="alert err">{erro}</div>}

        <div className="field">
          <label>E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                 required autoComplete="email" placeholder="voce@email.com" />
        </div>
        <div className="field">
          <label>Senha</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
                 required autoComplete="current-password" placeholder="••••••" />
        </div>

        <button className="btn prim wide" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="small muted" style={{ textAlign: 'center', marginTop: 14 }}>
          Não tem conta? <a href="/cadastro">Criar agora</a>
        </p>
      </form>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={<div className="center"><div className="card auth">Carregando…</div></div>}>
      <LoginForm />
    </Suspense>
  )
}

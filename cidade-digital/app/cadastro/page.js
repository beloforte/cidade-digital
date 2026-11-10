'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { temEnvSupabase } from '@/lib/env'

export default function Cadastro() {
  const router = useRouter()
  const supabase = temEnvSupabase() ? createClient() : null
  const [f, setF] = useState({ nome: '', email: '', whatsapp: '', cpf: '', senha: '', papel: 'cliente' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function cadastrar(e) {
    e.preventDefault()
    setErro('')
    if (!supabase) { setErro('Configuracao ausente: veja o aviso acima.'); return }
    setCarregando(true)
    try {
      if (f.senha.length < 6) throw new Error('A senha precisa ter ao menos 6 caracteres.')
      const cpf = f.cpf.replace(/\D/g, '')

      // emailRedirectTo: sem isso o Supabase manda o link de confirmacao para o
      // "Site URL" do projeto (que por padrao e http://localhost:3000).
      const { data, error } = await supabase.auth.signUp({
        email: f.email.trim().toLowerCase(),
        password: f.senha,
        options: {
          emailRedirectTo: `${window.location.origin}/login?confirmado=1`,
          data: { nome: f.nome.trim(), whatsapp: f.whatsapp.trim(), cpf, papel: f.papel },
        },
      })
      if (error) throw new Error(error.message)

      // o perfil é criado por trigger no banco; aguarda sessão
      if (!data.session) {
        setErro('Conta criada. Confirme o e-mail e depois entre.')
        return
      }
      router.push(f.papel === 'lojista' ? '/lojista' : '/cliente')
      router.refresh()
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="center">
      <form className="card auth" onSubmit={cadastrar} style={{ maxWidth: 440 }}>
        <h1>Criar conta</h1>
        <p className="muted small" style={{ marginTop: 0, marginBottom: 18 }}>
          Pontalinda · restaurantes e lanchonetes
        </p>

        {!supabase && (
          <div className="alert err">
            Faltam as variaveis de ambiente (NEXT_PUBLIC_SUPABASE_URL e
            NEXT_PUBLIC_SUPABASE_ANON_KEY). Configure na Vercel e faca Redeploy.
          </div>
        )}

        {erro && <div className="alert err">{erro}</div>}

        <div className="field">
          <label>Nome completo</label>
          <input value={f.nome} onChange={set('nome')} required placeholder="Seu nome" />
        </div>
        <div className="field">
          <label>E-mail</label>
          <input type="email" value={f.email} onChange={set('email')} required placeholder="voce@email.com" />
        </div>
        <div className="row" style={{ gap: 10 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>WhatsApp</label>
            <input value={f.whatsapp} onChange={set('whatsapp')} placeholder="(17) 99999-0000" />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>CPF</label>
            <input value={f.cpf} onChange={set('cpf')} placeholder="000.000.000-00" />
          </div>
        </div>
        <div className="field">
          <label>Senha</label>
          <input type="password" value={f.senha} onChange={set('senha')} required
                 minLength={6} placeholder="mínimo 6 caracteres" />
        </div>
        <div className="field">
          <label>Eu sou</label>
          <select value={f.papel} onChange={set('papel')}>
            <option value="cliente">Cliente — quero ganhar pontos</option>
            <option value="divulgador">Divulgador — quero divulgar e ganhar comissão</option>
            <option value="lojista">Lojista — tenho um comércio</option>
          </select>
        </div>

        <button className="btn prim wide" disabled={carregando}>
          {carregando ? 'Criando...' : 'Criar conta'}
        </button>
        <p className="small muted" style={{ textAlign: 'center', marginTop: 14 }}>
          Já tem conta? <a href="/login">Entrar</a>
        </p>
      </form>
    </div>
  )
}

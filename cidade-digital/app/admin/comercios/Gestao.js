'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function brl(n) {
  return 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',')
}
function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function Gestao({ comercios, lojistas, ofertas }) {
  const router = useRouter()
  const supabase = createClient()
  const [msg, setMsg] = useState(null)
  const [f, setF] = useState({ nome: '', dono: '', whatsapp: '', bairro: 'Centro' })
  const [ofertaDe, setOfertaDe] = useState(null)
  const [of, setOf] = useState({ titulo: '', preco: '', desc: '' })

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function criarLoja(e) {
    e.preventDefault()
    setMsg(null)
    if (!f.dono) { setMsg({ tipo: 'err', txt: 'Escolha o lojista dono — o comércio precisa de um responsável.' }); return }
    try {
      // nasce inativo: só entra no ar quando o admin aprovar (regra do piloto)
      const { error } = await supabase.from('comercios').insert({
        nome: f.nome.trim(),
        slug: slugify(f.nome) + '-' + Math.random().toString(36).slice(2, 5),
        dono_id: f.dono,
        whatsapp: f.whatsapp.trim(),
        bairro: f.bairro.trim() || null,
        ativo: false,
      })
      if (error) throw new Error(error.message)
      setMsg({ tipo: 'ok', txt: 'Comércio criado como pendente. Aprove abaixo para colocá-lo no ar.' })
      setF({ nome: '', dono: '', whatsapp: '', bairro: 'Centro' })
      router.refresh()
    } catch (err) {
      setMsg({ tipo: 'err', txt: err.message })
    }
  }

  async function alternar(c) {
    setMsg(null)
    const { error } = await supabase.from('comercios').update({ ativo: !c.ativo }).eq('id', c.id)
    if (error) { setMsg({ tipo: 'err', txt: error.message }); return }
    setMsg({ tipo: 'ok', txt: c.ativo ? `${c.nome} saiu do ar.` : `${c.nome} está no ar.` })
    router.refresh()
  }

  async function criarOferta(e, comercioId) {
    e.preventDefault()
    setMsg(null)
    try {
      const { error } = await supabase.from('ofertas').insert({
        comercio_id: comercioId,
        titulo: of.titulo.trim(),
        descricao: of.desc.trim() || null,
        preco: Number(String(of.preco).replace(',', '.')),
        desconto_max_pct: 10,
        status: 'ativa',
      })
      if (error) throw new Error(error.message)
      setMsg({ tipo: 'ok', txt: 'Oferta publicada.' })
      setOf({ titulo: '', preco: '', desc: '' }); setOfertaDe(null)
      router.refresh()
    } catch (err) {
      setMsg({ tipo: 'err', txt: err.message })
    }
  }

  return (
    <>
      <div className="between" style={{ marginBottom: 14 }}>
        <h1>Comércios</h1>
        <a className="btn" href="/admin" style={{ padding: '8px 14px', fontSize: 13.5 }}>← Painel</a>
      </div>

      {msg && <div className={'alert ' + msg.tipo}>{msg.txt}</div>}

      <div className="card">
        <h2 style={{ fontSize: 15 }}>Cadastrar comércio</h2>
        <form onSubmit={criarLoja}>
          <div className="row" style={{ gap: 10 }}>
            <div className="field" style={{ flex: 2 }}>
              <label>Nome</label>
              <input value={f.nome} onChange={set('nome')} required placeholder="Lanchonete do Zé" />
            </div>
            <div className="field" style={{ flex: 2 }}>
              <label>Dono (conta de lojista)</label>
              <select value={f.dono} onChange={set('dono')} required>
                <option value="">— escolha —</option>
                {lojistas.map((l) => (
                  <option key={l.id} value={l.id}>{l.nome} ({l.email})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>WhatsApp</label>
              <input value={f.whatsapp} onChange={set('whatsapp')} required placeholder="(17) 99999-0000" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Bairro</label>
              <input value={f.bairro} onChange={set('bairro')} placeholder="Centro" />
            </div>
          </div>
          <button className="btn prim" disabled={lojistas.length === 0}>
            {lojistas.length === 0 ? 'Nenhum lojista cadastrado' : 'Criar comércio'}
          </button>
          {lojistas.length === 0 && (
            <p className="tiny muted" style={{ marginBottom: 0 }}>
              Peça ao dono do comércio para criar conta escolhendo “Lojista” em /cadastro.
            </p>
          )}
        </form>
      </div>

      <h2 style={{ marginTop: 22 }}>No ar / pendentes</h2>
      <div className="list">
        {comercios.map((c) => {
          const minhas = ofertas.filter((o) => o.comercio_id === c.id)
          return (
            <div key={c.id} style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
              <div className="item" style={{ border: 0 }}>
                <div>
                  <div className="t">{c.nome}</div>
                  <div className="s">
                    {c.bairro || '—'} · {c.whatsapp} · {minhas.length} oferta(s)
                    {' · '}
                    {c.plano === 'mensalidade'
                      ? `mensalidade R$ ${Number(c.mensalidade||0).toFixed(2).replace('.', ',')}`
                      : 'comissão 3%'}
                    {c.isento_ate
                      ? ` · isenta até ${new Date(c.isento_ate + 'T12:00:00').toLocaleDateString('pt-BR')}`
                      : ''}
                  </div>
                </div>
                <div className="row">
                  <button className="btn ghost" style={{ padding: '5px 10px', fontSize: 12 }}
                          onClick={() => setOfertaDe(ofertaDe === c.id ? null : c.id)}>
                    + oferta
                  </button>
                  <button className={'btn ' + (c.ativo ? '' : 'prim')} onClick={() => alternar(c)}
                          style={{ padding: '6px 12px', fontSize: 12.5 }}>
                    {c.ativo ? 'Tirar do ar' : 'Aprovar'}
                  </button>
                  <span className={'badge ' + (c.ativo ? 'ok' : 'pend')}>{c.ativo ? 'no ar' : 'pendente'}</span>
                </div>
              </div>

              {ofertaDe === c.id && (
                <form onSubmit={(e) => criarOferta(e, c.id)} style={{ paddingLeft: 4 }}>
                  <div className="row" style={{ gap: 10 }}>
                    <div className="field" style={{ flex: 2 }}>
                      <label>Oferta</label>
                      <input value={of.titulo} onChange={(e) => setOf({ ...of, titulo: e.target.value })}
                             required placeholder="Combo x-burger + refri" />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label>Preço</label>
                      <input value={of.preco} onChange={(e) => setOf({ ...of, preco: e.target.value })}
                             required inputMode="decimal" placeholder="32,90" />
                    </div>
                    <div className="field" style={{ flex: '0 0 auto', justifyContent: 'flex-end' }}>
                      <label>&nbsp;</label>
                      <button className="btn prim" style={{ padding: '10px 16px' }}>Publicar</button>
                    </div>
                  </div>
                </form>
              )}

              {minhas.length > 0 && (
                <div style={{ paddingLeft: 4 }}>
                  {minhas.map((o) => (
                    <div key={o.id} className="small muted" style={{ padding: '3px 0' }}>
                      • {o.titulo} — {brl(o.preco)} (até {o.desconto_max_pct}% off, {o.status})
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

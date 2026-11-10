'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function Cupons({ ofertas, cupons, ofertaFoco, demo = false }) {
  const router = useRouter()
  const supabase = createClient()
  const [erro, setErro] = useState('')
  const [novo, setNovo] = useState(null)
  const [carregando, setCarregando] = useState(false)

  async function resgatar(oferta) {
    setErro(''); setCarregando(true)
    if (demo) {
      const valor = Math.min(oferta.preco * oferta.desconto_max_pct / 100, 20)
      setNovo({
        codigo: 'DEMO' + Math.random().toString(16).slice(2, 6).toUpperCase(),
        valor_desconto: Number(valor.toFixed(2)),
        titulo: oferta.titulo,
      })
      setCarregando(false)
      return
    }
    try {
      // toda a regra está no servidor: débito de pontos, teto de desconto, validade 48h
      const { data, error } = await supabase.rpc('resgatar_cupom', { p_oferta: oferta.id })
      if (error) throw new Error(error.message)
      setNovo({ ...data[0], titulo: oferta.titulo })
      router.refresh()
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }

  const pendentes = cupons.filter((c) => c.status === 'pendente')
  const outros = cupons.filter((c) => c.status !== 'pendente')

  function restante(iso) {
    const ms = new Date(iso) - new Date()
    if (ms <= 0) return 'expirado'
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    return h > 0 ? `${h}h ${m}min` : `${m}min`
  }

  // quantos pontos o cupom custa: R$ 1,00 = 1.000 pts, teto R$ 20 (mesma conta do servidor)
  function pontosDe(o) {
    const valor = Math.min(Number(o.preco) * Number(o.desconto_max_pct) / 100, 20)
    return Math.ceil(valor * 1000)
  }

  return (
    <>
      {erro && <div className="alert err">{erro}</div>}

      {novo && (
        <div className="card" style={{ marginBottom: 16, borderColor: 'var(--gold)' }}>
          <h2 style={{ fontSize: 15 }}>🎟️ Cupom gerado — {novo.titulo}</h2>
          <div className="code">{novo.codigo}</div>
          <p className="small muted" style={{ textAlign: 'center', margin: 0 }}>
            Desconto de R$ {Number(novo.valor_desconto).toFixed(2).replace('.', ',')} ·
            válido por 48h. Mostre este código na loja.
          </p>
          <button className="btn wide" style={{ marginTop: 12 }} onClick={() => setNovo(null)}>
            Fechar
          </button>
        </div>
      )}

      {pendentes.length > 0 && (
        <>
          <h2>Cupons ativos</h2>
          <div className="list" style={{ marginBottom: 20 }}>
            {pendentes.map((c) => (
              <div className="item" key={c.id}>
                <div>
                  <div className="t" style={{ fontFamily: 'ui-monospace,monospace', letterSpacing: '.1em' }}>
                    {c.codigo}
                  </div>
                  <div className="s">{c.ofertas?.titulo || '—'} · expira em {restante(c.expira_em)}</div>
                </div>
                <strong style={{ color: 'var(--green)' }}>
                  −R$ {Number(c.valor_desconto).toFixed(2).replace('.', ',')}
                </strong>
              </div>
            ))}
          </div>
        </>
      )}

      <h2>Resgatar desconto</h2>
      {ofertas.length === 0 ? (
        <div className="card muted small">Nenhuma oferta ativa ainda.</div>
      ) : (
        <div className="list">
          {ofertas.map((o) => (
            <div className="item" key={o.id} style={o.id === ofertaFoco ? { borderColor: 'var(--gold)' } : {}}>
              <div>
                <div className="t">{o.titulo}</div>
                <div className="s">{o.comercios?.nome} · até {o.desconto_max_pct}% off</div>
              </div>
              <button className="btn" disabled={carregando} onClick={() => resgatar(o)}
                      style={{ padding: '7px 13px', fontSize: 13 }}
                      title={`Troca ${pontosDe(o).toLocaleString('pt-BR')} pts por um cupom de 48h`}>
                {pontosDe(o).toLocaleString('pt-BR')} pts
              </button>
            </div>
          ))}
        </div>
      )}

      {outros.length > 0 && (
        <>
          <h2 style={{ marginTop: 24 }}>Histórico</h2>
          <div className="list">
            {outros.map((c) => (
              <div className="item" key={c.id} style={{ opacity: 0.72 }}>
                <div>
                  <div className="t" style={{ fontFamily: 'ui-monospace,monospace', letterSpacing: '.08em', fontSize: 13 }}>
                    {c.codigo}
                  </div>
                  <div className="s">{c.ofertas?.titulo || '—'}</div>
                </div>
                <span className={'badge ' + (c.status === 'usado' ? 'ok' : 'no')}>{c.status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}

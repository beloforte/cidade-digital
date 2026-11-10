'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function brl(n) {
  return 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',')
}
function data(iso) {
  return iso ? new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR') : '—'
}

export default function Receita({ comercios, faturas }) {
  const router = useRouter()
  const supabase = createClient()
  const [msg, setMsg] = useState(null)
  const [ocupado, setOcupado] = useState(false)
  const [mudando, setMudando] = useState({})

  const abertas = faturas.filter((f) => f.status === 'aberta')
  const pagas = faturas.filter((f) => f.status === 'paga')
  const emComissao = comercios.filter((c) => c.plano === 'comissao')
  const emMensalidade = comercios.filter((c) => c.plano === 'mensalidade')

  // o que a comissão renderia hoje, em média, por loja (premissa: 20 vendas × R$ 32,90)
  const MRR = emMensalidade.reduce((a, c) => a + Number(c.mensalidade), 0)

  async function gerar() {
    setMsg(null); setOcupado(true)
    try {
      const { data, error } = await supabase.rpc('gerar_faturas', {})
      if (error) throw new Error(error.message)
      setMsg({
        tipo: 'ok',
        txt: (data || []).length
          ? `Faturas geradas: ${data.map((f) => `${f.comercio} ${brl(f.valor)}`).join(' · ')}`
          : 'Nenhuma fatura nova — nada a cobrar neste mês (ou já estava gerada).',
      })
      router.refresh()
    } catch (e) {
      setMsg({ tipo: 'err', txt: e.message })
    } finally {
      setOcupado(false)
    }
  }

  async function pagar(id) {
    setMsg(null)
    const { error } = await supabase.rpc('pagar_fatura', { p_fatura: id })
    if (error) { setMsg({ tipo: 'err', txt: error.message }); return }
    setMsg({ tipo: 'ok', txt: 'Fatura marcada como paga.' })
    router.refresh()
  }

  async function trocarPlano(c) {
    const novo = c.plano === 'mensalidade' ? 'comissao' : 'mensalidade'
    const valor = mudando[c.id] !== undefined ? mudando[c.id] : c.mensalidade
    setMsg(null)
    const { error } = await supabase.from('comercios').update({
      plano: novo,
      mensalidade: novo === 'mensalidade' ? Number(String(valor).replace(',', '.')) : 0,
      mensalidade_desde: novo === 'mensalidade' ? new Date().toISOString().slice(0, 10) : null,
    }).eq('id', c.id)
    if (error) { setMsg({ tipo: 'err', txt: error.message }); return }
    setMsg({
      tipo: 'ok',
      txt: novo === 'mensalidade'
        ? `${c.nome}: mensalidade ativada. A comissão de 3% para de ser cobrada nas vendas após ${data(c.isento_ate)}.`
        : `${c.nome}: voltou para comissão de 3% por venda.`,
    })
    router.refresh()
  }

  return (
    <>
      <div className="between" style={{ marginBottom: 14 }}>
        <h1>Receita</h1>
        <a className="btn" href="/admin" style={{ padding: '8px 14px', fontSize: 13.5 }}>← Painel</a>
      </div>

      {msg && <div className={'alert ' + msg.tipo}>{msg.txt}</div>}

      <div className="stats">
        <div className="stat">
          <div className="v">{emComissao.length}</div>
          <div className="l">lojas em comissão 3%</div>
        </div>
        <div className="stat">
          <div className="v" style={{ color: 'var(--gold2)' }}>{emMensalidade.length}</div>
          <div className="l">lojas em mensalidade</div>
        </div>
        <div className="stat">
          <div className="v" style={{ fontSize: 17 }}>{brl(MRR)}</div>
          <div className="l">MRR contratado</div>
        </div>
        <div className="stat">
          <div className="v" style={{ color: abertas.length ? 'var(--red)' : 'var(--ink3)', fontSize: 17 }}>
            {brl(abertas.reduce((a, f) => a + Number(f.valor), 0))}
          </div>
          <div className="l">em aberto</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="between">
          <div>
            <h2 style={{ margin: 0, fontSize: 15 }}>Fatura do mês</h2>
            <p className="tiny muted" style={{ margin: '2px 0 0' }}>
              Cobra só quem está em mensalidade e já saiu da isenção. Rodar duas vezes não duplica.
            </p>
          </div>
          <button className="btn prim" onClick={gerar} disabled={ocupado}
                  style={{ padding: '8px 14px', fontSize: 13 }}>
            {ocupado ? '...' : 'Gerar faturas'}
          </button>
        </div>
      </div>

      <h2>Lojas e modelo de receita</h2>
      <div className="list">
        {comercios.map((c) => (
          <div className="item" key={c.id}>
            <div>
              <div className="t">{c.nome}</div>
              <div className="s">
                isenta até {data(c.isento_ate)} ·{' '}
                {c.plano === 'mensalidade'
                  ? `mensalidade ${brl(c.mensalidade)}/mês desde ${data(c.mensalidade_desde)}`
                  : 'comissão 3% por venda'}
              </div>
            </div>
            <div className="row">
              {c.plano === 'comissao' && (
                <input value={mudando[c.id] ?? ''} placeholder="49,90"
                       onChange={(e) => setMudando({ ...mudando, [c.id]: e.target.value })}
                       inputMode="decimal"
                       style={{ width: 82, padding: '6px 8px', fontSize: 13, textAlign: 'right' }} />
              )}
              <button className="btn" onClick={() => trocarPlano(c)}
                      style={{ padding: '6px 12px', fontSize: 12.5 }}>
                {c.plano === 'mensalidade' ? 'Voltar p/ comissão' : 'Ativar mensalidade'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 24 }}>Faturas em aberto</h2>
      {abertas.length === 0 ? (
        <div className="card muted small">Nada em aberto.</div>
      ) : (
        <div className="list">
          {abertas.map((f) => (
            <div className="item" key={f.id}>
              <div>
                <div className="t">{f.comercios?.nome || '—'} · {brl(f.valor)}</div>
                <div className="s">competência {data(f.competencia)}</div>
              </div>
              <button className="btn prim" onClick={() => pagar(f.id)}
                      style={{ padding: '6px 12px', fontSize: 12.5 }}>
                Marcar paga
              </button>
            </div>
          ))}
        </div>
      )}

      {pagas.length > 0 && (
        <>
          <h2 style={{ marginTop: 24 }}>Pagas</h2>
          <div className="list">
            {pagas.map((f) => (
              <div className="item" key={f.id} style={{ opacity: 0.7 }}>
                <div>
                  <div className="t">{f.comercios?.nome || '—'} · {brl(f.valor)}</div>
                  <div className="s">competência {data(f.competencia)} · paga {data(f.pago_em?.slice(0, 10))}</div>
                </div>
                <span className="badge ok">paga</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}

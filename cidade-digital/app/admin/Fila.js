'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function brl(n) {
  return 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',')
}

export default function Fila({ vendas, demo = false }) {
  const router = useRouter()
  const supabase = createClient()
  const [msg, setMsg] = useState(null)
  const [ocupado, setOcupado] = useState(null)

  const pendentes = vendas.filter((v) => v.status === 'informada')
  const outras = vendas.filter((v) => v.status !== 'informada').slice(0, 25)

  async function confirmar(id) {
    setMsg(null); setOcupado(id)
    if (demo) {
      setMsg({ tipo: 'ok', txt: 'Modo demo: no app real a venda seria confirmada com liberação em D+7.' })
      setOcupado(null)
      return
    }
    try {
      // a função grava confirmada_em + libera_em (D+7) e o cashback do cliente
      const { data, error } = await supabase.rpc('confirmar_venda', { p_venda: id })
      if (error) throw new Error(error.message)
      const r = data[0]
      if (!r.ok) throw new Error(r.mensagem)
      setMsg({ tipo: 'ok', txt: `Confirmada. Liberação em ${new Date(r.libera_em).toLocaleDateString('pt-BR')}.` })
      router.refresh()
    } catch (e) {
      setMsg({ tipo: 'err', txt: e.message })
    } finally {
      setOcupado(null)
    }
  }

  async function estornar(id) {
    const motivo = window.prompt('Motivo do estorno:')
    if (!motivo) return
    setMsg(null); setOcupado(id)
    if (demo) {
      setMsg({ tipo: 'ok', txt: 'Modo demo: no app real o cashback do cliente seria revertido.' })
      setOcupado(null)
      return
    }
    try {
      const { error } = await supabase.rpc('estornar_venda', { p_venda: id, p_motivo: motivo })
      if (error) throw new Error(error.message)
      setMsg({ tipo: 'ok', txt: 'Venda estornada e cashback revertido.' })
      router.refresh()
    } catch (e) {
      setMsg({ tipo: 'err', txt: e.message })
    } finally {
      setOcupado(null)
    }
  }

  return (
    <>
      {msg && <div className={'alert ' + msg.tipo}>{msg.txt}</div>}

      <h2 style={{ marginTop: 20 }}>
        A confirmar {pendentes.length > 0 && <span className="badge pend">{pendentes.length}</span>}
      </h2>
      {pendentes.length === 0 ? (
        <div className="card muted small">Nada na fila. As vendas informadas pelos lojistas aparecem aqui.</div>
      ) : (
        <div className="list">
          {pendentes.map((v) => (
            <div className="item" key={v.id}>
              <div>
                <div className="t">{brl(v.valor_bruto)} · {v.comercios?.nome || '—'}</div>
                <div className="s">
                  {new Date(v.informada_em).toLocaleString('pt-BR')}
                  {Number(v.desconto) > 0 && ` · cupom ${brl(v.desconto)}`}
                </div>
              </div>
              <button className="btn prim" disabled={ocupado === v.id} onClick={() => confirmar(v.id)}
                      style={{ padding: '7px 14px', fontSize: 13 }}>
                {ocupado === v.id ? '...' : 'Confirmar'}
              </button>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ marginTop: 24 }}>Confirmadas</h2>
      {outras.length === 0 ? (
        <div className="card muted small">Nenhuma venda confirmada ainda.</div>
      ) : (
        <div className="list">
          {outras.map((v) => (
            <div className="item" key={v.id} style={v.status === 'estornada' ? { opacity: 0.6 } : {}}>
              <div>
                <div className="t">{brl(v.valor_bruto)} · {v.comercios?.nome || '—'}</div>
                <div className="s">
                  {v.status === 'confirmada'
                    ? `plataforma ${brl(v.comissao_plataforma)} · divulgador ${brl(v.comissao_divulgador)} · libera ${new Date(v.libera_em).toLocaleDateString('pt-BR')}`
                    : `estornada em ${new Date(v.informada_em).toLocaleDateString('pt-BR')}`}
                </div>
              </div>
              <div className="row">
                <span className={'badge ' + (v.status === 'confirmada' ? 'ok' : 'no')}>{v.status}</span>
                {v.status === 'confirmada' && (
                  <button className="btn ghost" onClick={() => estornar(v.id)} disabled={ocupado === v.id}
                          style={{ padding: '5px 10px', fontSize: 12 }}>
                    estornar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

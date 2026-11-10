'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function brl(n) {
  return 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',')
}

export default function Painel({ loja, vendas, ofertas, demo = false }) {
  const router = useRouter()
  const supabase = createClient()

  const [valor, setValor] = useState('')
  const [cupom, setCupom] = useState('')
  const [link, setLink] = useState('')
  const [msg, setMsg] = useState(null)
  const [ocupado, setOcupado] = useState(false)

  const [codigoValidar, setCodigoValidar] = useState('')
  const [resValidar, setResValidar] = useState(null)

  const confirmadas = vendas.filter((v) => v.status === 'confirmada')
  const pendentes = vendas.filter((v) => v.status === 'informada')
  const gmv = confirmadas.reduce((a, v) => a + Number(v.valor_liquido), 0)
  const aReceber = confirmadas.reduce((a, v) => a + Number(v.comissao_plataforma), 0)
  const aPagar = confirmadas.reduce((a, v) => a + Number(v.comissao_divulgador), 0)

  async function registrarVenda(e) {
    e.preventDefault()
    setMsg(null); setOcupado(true)
    if (demo) {
      setMsg({ tipo: 'ok', txt: 'Modo demo: no app real a venda entraria na fila do admin.' })
      setOcupado(false)
      return
    }
    try {
      const { data, error } = await supabase.rpc('registrar_venda', {
        p_valor: Number(valor.replace(',', '.')),
        p_cupom: cupom.trim() || null,
        p_link: link.trim() || null,
        p_obs: null,
      })
      if (error) throw new Error(error.message)
      setMsg({ tipo: 'ok', txt: `Venda registrada. Aguardando aprovação do administrador.` })
      setValor(''); setCupom(''); setLink('')
      router.refresh()
    } catch (err) {
      setMsg({ tipo: 'err', txt: err.message })
    } finally {
      setOcupado(false)
    }
  }

  async function validar(e) {
    e.preventDefault()
    setResValidar(null)
    if (demo) {
      const bom = codigoValidar.trim().length === 8
      setResValidar(bom
        ? { ok: true, valor_desconto: 3.29 }
        : { ok: false, mensagem: 'cupom não encontrado (demo: use 8 caracteres)' })
      return
    }
    try {
      const { data, error } = await supabase.rpc('validar_cupom', { p_codigo: codigoValidar.trim() })
      if (error) throw new Error(error.message)
      const r = data[0]
      setResValidar(r)
      if (r.ok) { setCodigoValidar(''); router.refresh() }
    } catch (err) {
      setResValidar({ ok: false, mensagem: err.message })
    }
  }

  return (
    <>
      <div className="between" style={{ marginBottom: 14 }}>
        <div>
          <h1>{loja.nome}</h1>
          <p className="muted small" style={{ margin: 0 }}>
            {loja.bairro || 'Pontalinda'} · {loja.ativo ? 'ativa' : 'aguardando aprovação'}
            {loja.plano === 'mensalidade'
              ? ` · mensalidade R$ ${Number(loja.mensalidade || 0).toFixed(2).replace('.', ',')}/mês`
              : ' · comissão 3% por venda'}
          </p>
        </div>
        <span className={'badge ' + (loja.ativo ? 'ok' : 'pend')}>
          {loja.ativo ? 'no ar' : 'pendente'}
        </span>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="v">{brl(gmv)}</div>
          <div className="l">GMV confirmado</div>
        </div>
        <div className="stat">
          <div className="v" style={{ color: 'var(--gold2)' }}>{brl(aReceber)}</div>
          <div className="l">plataforma 3%</div>
        </div>
        <div className="stat">
          <div className="v" style={{ color: 'var(--purple)' }}>{brl(aPagar)}</div>
          <div className="l">divulgadores 7%</div>
        </div>
        <div className="stat">
          <div className="v" style={{ color: pendentes.length ? 'var(--gold2)' : 'var(--ink3)' }}>
            {pendentes.length}
          </div>
          <div className="l">aguardando admin</div>
        </div>
      </div>

      {msg && <div className={'alert ' + msg.tipo}>{msg.txt}</div>}

      <div className="row" style={{ alignItems: 'stretch', gap: 14 }}>
        <form className="card" style={{ flex: '1 1 320px' }} onSubmit={registrarVenda}>
          <h2 style={{ fontSize: 15 }}>🧾 Registrar venda</h2>
          <p className="tiny muted" style={{ marginTop: -6 }}>
            O administrador confirma depois. Comissão só é liberada em D+7.
          </p>
          <div className="field">
            <label>Valor da venda (R$)</label>
            <input value={valor} onChange={(e) => setValor(e.target.value)}
                   placeholder="28,90" required inputMode="decimal" />
          </div>
          <div className="row" style={{ gap: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Cupom (opcional)</label>
              <input value={cupom} onChange={(e) => setCupom(e.target.value.toUpperCase())}
                     placeholder="A1B2C3D4" style={{ fontFamily: 'ui-monospace,monospace' }} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Código do divulgador</label>
              <input value={link} onChange={(e) => setLink(e.target.value.toUpperCase())}
                     placeholder="opcional" style={{ fontFamily: 'ui-monospace,monospace' }} />
            </div>
          </div>
          <button className="btn prim wide" disabled={ocupado}>
            {ocupado ? 'Registrando...' : 'Registrar venda'}
          </button>
        </form>

        <form className="card" style={{ flex: '1 1 280px' }} onSubmit={validar}>
          <h2 style={{ fontSize: 15 }}>✅ Validar cupom</h2>
          <p className="tiny muted" style={{ marginTop: -6 }}>
            Digite o código que o cliente mostrou. Vale uma vez só.
          </p>
          <div className="field">
            <label>Código do cupom</label>
            <input value={codigoValidar} onChange={(e) => setCodigoValidar(e.target.value.toUpperCase())}
                   placeholder="A1B2C3D4" style={{ fontFamily: 'ui-monospace,monospace', fontSize: 16, letterSpacing: '.08em' }} />
          </div>
          <button className="btn wide" disabled={!codigoValidar}>Validar</button>
          {resValidar && (
            <div className={'alert ' + (resValidar.ok ? 'ok' : 'err')} style={{ marginTop: 12, marginBottom: 0 }}>
              {resValidar.ok
                ? `Cupom válido — desconto de ${brl(resValidar.valor_desconto)}`
                : resValidar.mensagem}
            </div>
          )}
        </form>
      </div>

      <h2 style={{ marginTop: 24 }}>Vendas recentes</h2>
      {vendas.length === 0 ? (
        <div className="card muted small">Nenhuma venda registrada ainda.</div>
      ) : (
        <div className="list">
          {vendas.map((v) => (
            <div className="item" key={v.id}>
              <div>
                <div className="t">{brl(v.valor_bruto)}</div>
                <div className="s">
                  {new Date(v.informada_em).toLocaleDateString('pt-BR')}
                  {Number(v.desconto) > 0 && ` · desconto ${brl(v.desconto)}`}
                  {v.status === 'confirmada' && ` · libera ${new Date(v.libera_em).toLocaleDateString('pt-BR')}`}
                </div>
              </div>
              <div className="row">
                <span className="tiny muted">div. {brl(v.comissao_divulgador)}</span>
                <span className={'badge ' + (v.status === 'confirmada' ? 'ok' : v.status === 'estornada' ? 'no' : 'pend')}>
                  {v.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {ofertas.length > 0 && (
        <>
          <h2 style={{ marginTop: 24 }}>Minhas ofertas</h2>
          <div className="list">
            {ofertas.map((o) => (
              <div className="item" key={o.id}>
                <div>
                  <div className="t">{o.titulo}</div>
                  <div className="s">{brl(o.preco)} · até {o.desconto_max_pct}% off</div>
                </div>
                <span className={'badge ' + (o.status === 'ativa' ? 'ok' : 'pend')}>{o.status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}

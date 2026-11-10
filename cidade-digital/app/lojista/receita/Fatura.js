'use client'

function brl(n) {
  return 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',')
}
function data(iso) {
  return iso ? new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR') : '—'
}

export default function Fatura({ loja, faturas }) {
  const emMensalidade = loja.plano === 'mensalidade'
  const abertas = faturas.filter((f) => f.status === 'aberta')

  return (
    <>
      <h1>{loja.nome}</h1>
      <p className="muted small" style={{ marginTop: -8 }}>Como você paga a plataforma</p>

      <div className="card" style={{ borderColor: 'var(--gold)' }}>
        <div className="between">
          <div>
            <h2 style={{ margin: 0, fontSize: 15 }}>
              {emMensalidade ? 'Mensalidade' : 'Comissão por venda'}
            </h2>
            <p className="small muted" style={{ margin: '4px 0 0' }}>
              {emMensalidade
                ? `${brl(loja.mensalidade)} por mês. Nenhuma comissão sobre as vendas.`
                : '3% sobre cada venda confirmada. Sem mensalidade.'}
            </p>
          </div>
          <strong style={{ fontSize: 20, color: 'var(--gold2)' }}>
            {emMensalidade ? `${brl(loja.mensalidade)}/mês` : '3%'}
          </strong>
        </div>

        <p className="tiny muted" style={{ margin: '14px 0 0' }}>
          Isenção do piloto até <strong>{data(loja.isento_ate)}</strong>.
          {loja.isento_ate && (
            emMensalidade
              ? ' A primeira fatura sai no dia 1º do mês seguinte ao fim da isenção.'
              : ' Os 3% só passam a valer para vendas informadas depois dessa data.'
          )}
        </p>
      </div>

      <h2 style={{ marginTop: 22 }}>Faturas</h2>
      {faturas.length === 0 ? (
        <div className="card muted small">
          Nenhuma fatura. {emMensalidade
            ? 'A primeira aparece depois da isenção.'
            : 'No modelo de comissão não existe fatura — o desconto vem na venda.'}
        </div>
      ) : (
        <div className="list">
          {faturas.map((f) => (
            <div className="item" key={f.id}>
              <div>
                <div className="t">{brl(f.valor)} · competência {data(f.competencia)}</div>
                <div className="s">
                  {f.status === 'paga' ? `paga em ${data(f.pago_em?.slice(0, 10))}` : 'em aberto'}
                </div>
              </div>
              <span className={'badge ' + (f.status === 'paga' ? 'ok' : 'pend')}>{f.status}</span>
            </div>
          ))}
        </div>
      )}

      {abertas.length > 0 && (
        <p className="tiny muted" style={{ marginTop: 14 }}>
          Pagamento no piloto é combinado direto com o administrador — o app não cobra cartão.
        </p>
      )}
    </>
  )
}

/** Versão de demonstração: /demo?t=fatura — mostra a tela depois da isenção. */
export function FaturaDemo() {
  const daqui90 = new Date(Date.now() - 45 * 86400e3).toISOString().slice(0, 10)  // isenção já venceu
  return (
    <Fatura
      loja={{ nome: 'Lanchonete do Zé', plano: 'mensalidade', mensalidade: 49.9,
              isento_ate: daqui90, ativo: true }}
      faturas={[
        { id: 'f1', competencia: new Date().toISOString().slice(0, 8) + '01', valor: 49.9, status: 'aberta', pago_em: null },
        { id: 'f2', competencia: '2026-10-01', valor: 49.9, status: 'paga', pago_em: '2026-10-03T10:00:00Z' },
      ]}
    />
  )
}

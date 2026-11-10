'use client'

function brl(n) {
  return 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',')
}

export default function KpisAdmin({ vendas = [], cupons = [], usuarios = [], comercios = [] }) {
  const confirmadas = vendas.filter((v) => v.status === 'confirmada')
  const informadas = vendas.filter((v) => v.status === 'informada')
  const estornadas = vendas.filter((v) => v.status === 'estornada')

  // GMV e comissões só contam venda confirmada — estorno não compensa sozinho
  const gmv = confirmadas.reduce((a, v) => a + Number(v.valor_liquido), 0)
  const plataforma = confirmadas.reduce((a, v) => a + Number(v.comissao_plataforma), 0)
  const divulgadores = confirmadas.reduce((a, v) => a + Number(v.comissao_divulgador), 0)
  const aLiberar = confirmadas
    .filter((v) => v.libera_em && new Date(v.libera_em) > new Date())
    .reduce((a, v) => a + Number(v.valor_liquido), 0)

  const cuponsUsados = cupons.filter((c) => c.status === 'usado').length
  const cuponsPend = cupons.filter((c) => c.status === 'pendente').length
  const pontos = usuarios.reduce((a, u) => a + Number(u.pontos || 0), 0)

  return (
    <>
      <div className="stats">
        <div className="stat">
          <div className="v">{brl(gmv)}</div>
          <div className="l">GMV confirmado</div>
        </div>
        <div className="stat">
          <div className="v" style={{ color: 'var(--gold2)' }}>{brl(plataforma)}</div>
          <div className="l">receita plataforma</div>
        </div>
        <div className="stat">
          <div className="v" style={{ color: 'var(--purple)' }}>{brl(divulgadores)}</div>
          <div className="l">a pagar divulgadores</div>
        </div>
        <div className="stat">
          <div className="v" style={{ color: informadas.length ? 'var(--red)' : 'var(--ink3)' }}>
            {informadas.length}
          </div>
          <div className="l">vendas a confirmar</div>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="v" style={{ fontSize: 17 }}>{brl(aLiberar)}</div>
          <div className="l">em carência D+7</div>
        </div>
        <div className="stat">
          <div className="v" style={{ fontSize: 17 }}>{cuponsUsados} / {cuponsPend}</div>
          <div className="l">cupons usados / ativos</div>
        </div>
        <div className="stat">
          <div className="v" style={{ fontSize: 17 }}>{estornadas.length}</div>
          <div className="l">estornos</div>
        </div>
        <div className="stat">
          <div className="v" style={{ fontSize: 17 }}>{pontos.toLocaleString('pt-BR')}</div>
          <div className="l">pontos em circulação</div>
        </div>
      </div>
    </>
  )
}

'use client'
import Link from 'next/link'
import Checkin from '@/app/cliente/checkin'

const NIVEL_INFO = {
  bronze:   { nome: 'Bronze',   cor: '#c98b4b', prox: 15000 },
  prata:    { nome: 'Prata',    cor: '#9fb0c4', prox: 60000 },
  ouro:     { nome: 'Ouro',     cor: '#e8b53a', prox: 150000 },
  diamante: { nome: 'Diamante', cor: '#7fd7e8', prox: null },
}

function brl(n) {
  return Number(n || 0).toFixed(2).replace('.', ',')
}

export default function DashboardCliente({
  perfil = null,          // o servidor manda null quando não há perfil criado
  semPerfil = false,      // conta existe no Auth, perfil não — precisa avisar
  ofertas = [], cupons = [], extrato = [], feitoHoje = false, demo = false,
}) {
  // blindagem: qualquer campo faltando vira valor neutro, nunca quebra a tela
  const p = perfil || { nome: 'Visitante', pontos: 0, pontos_acumulados: 0, nivel: 'bronze' }
  const nivel = NIVEL_INFO[p.nivel] || NIVEL_INFO.bronze
  const acumulado = Number(p.pontos_acumulados || 0)
  const faltam = nivel.prox ? Math.max(0, nivel.prox - acumulado) : 0
  const pct = nivel.prox ? Math.min(100, Math.round((acumulado / nivel.prox) * 100)) : 100

  return (
    <>
      {semPerfil && (
        <div className="alert err" style={{ marginBottom: 14 }}>
          Sua conta existe, mas o perfil ainda não foi criado. Recarregue a página;
          se continuar, avise quem mantém o sistema (rode `diagnostico-cadastro.sql`).
        </div>
      )}

      <div className="between" style={{ marginBottom: 16 }}>
        <div>
          <h1>Olá, {(p.nome || '').split(' ')[0] || 'jogador'}</h1>
          <p className="muted small" style={{ margin: 0 }}>Pontalinda · restaurantes e lanchonetes</p>
        </div>
        <span className="badge niv" style={{ color: nivel.cor, borderColor: nivel.cor + '66' }}>
          {nivel.nome}
        </span>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="v" style={{ color: 'var(--gold2)' }}>
            {Number(p.pontos || 0).toLocaleString('pt-BR')}
          </div>
          <div className="l">pontos</div>
        </div>
        <div className="stat">
          <div className="v" style={{ color: 'var(--green)' }}>{cupons.length}</div>
          <div className="l">cupons ativos</div>
        </div>
        <div className="stat">
          <div className="v" style={{ fontSize: 16, color: 'var(--ink2)' }}>
            R$ {brl(Number(p.pontos || 0) / 1000)}
          </div>
          <div className="l">em desconto</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="between">
          <h2 style={{ margin: 0, fontSize: 15 }}>
            Nível {nivel.nome}
            {nivel.prox && <span className="muted tiny"> · faltam {faltam.toLocaleString('pt-BR')} pts para o próximo</span>}
          </h2>
          <span className="tiny muted">{pct}%</span>
        </div>
        <div style={{ height: 7, background: 'var(--bg)', borderRadius: 20, overflow: 'hidden', marginTop: 10 }}>
          <div style={{ height: '100%', width: pct + '%', background: nivel.cor, transition: '.3s' }} />
        </div>
      </div>

      <Checkin feitoHoje={feitoHoje} demo={demo} />

      <div className="row" style={{ marginBottom: 18 }}>
        <Link href={demo ? '/demo?t=quiz' : '/cliente/quiz'} className="btn prim" style={{ flex: 1 }}>
          🎮 Jogar o quiz de hoje
        </Link>
        <Link href={demo ? '/demo?t=cupons' : '/cliente/cupons'} className="btn" style={{ flex: 1 }}>
          🎟️ Meus cupons
        </Link>
      </div>

      <h2>Ofertas em Pontalinda</h2>
      {ofertas.length === 0 ? (
        <div className="card muted small">
          Nenhuma oferta publicada ainda. Peça ao administrador para ativar as primeiras lojas.
        </div>
      ) : (
        <div className="list">
          {ofertas.map((o) => (
            <div className="item" key={o.id}>
              <div>
                <div className="t">{o.titulo}</div>
                <div className="s">{o.comercios?.nome || '—'} · até {o.desconto_max_pct}% off</div>
              </div>
              <div className="row">
                <strong style={{ fontSize: 15 }}>R$ {brl(o.preco)}</strong>
                <Link href={demo ? '/demo?t=cupons' : `/cliente/cupons?oferta=${o.id}`}
                      className="btn" style={{ padding: '7px 12px', fontSize: 13 }}>
                  Resgatar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {extrato.length > 0 && (
        <>
          <h2 style={{ marginTop: 24 }}>Últimos pontos</h2>
          <div className="list">
            {extrato.map((e, i) => (
              <div className="item" key={i}>
                <span className="small">{e.motivo}</span>
                <strong style={{ color: e.delta > 0 ? 'var(--green)' : 'var(--red)', fontSize: 13.5 }}>
                  {e.delta > 0 ? '+' : ''}{Number(e.delta).toLocaleString('pt-BR')}
                </strong>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}

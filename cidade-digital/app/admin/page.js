import { getSessao } from '@/lib/supabase-server'
import KpisAdmin from '@/components/KpisAdmin'
import Fila from './Fila'

export default async function AdminHome() {
  const { supabase } = await getSessao()

  const [{ data: vendas }, { data: cupons }, { data: usuarios }, { data: comercios }] =
    await Promise.all([
      supabase.from('vendas')
        .select('id,valor_bruto,desconto,valor_liquido,comissao_divulgador,comissao_plataforma,status,informada_em,libera_em,comercios(nome)')
        .order('informada_em', { ascending: false })
        .limit(60),
      supabase.from('cupons').select('id,status,valor_desconto'),
      supabase.from('usuarios').select('id,pontos'),
      supabase.from('comercios').select('id,ativo'),
    ])

  const lojasNoAr = (comercios || []).filter((c) => c.ativo).length
  const vs = vendas || []

  return (
    <>
      <div className="between" style={{ marginBottom: 16 }}>
        <div>
          <h1>Painel do piloto</h1>
          <p className="muted small" style={{ margin: 0 }}>
            Pontalinda · {lojasNoAr} loja(s) no ar · {vs.length} venda(s) registradas
          </p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <a className="btn" href="/admin/receita" style={{ padding: '8px 14px', fontSize: 13.5 }}>
            Receita
          </a>
          <a className="btn" href="/admin/comercios" style={{ padding: '8px 14px', fontSize: 13.5 }}>
            Comércios e ofertas
          </a>
        </div>
      </div>

      <KpisAdmin
        vendas={vs}
        cupons={cupons || []}
        usuarios={usuarios || []}
        comercios={comercios || []}
      />

      <Fila vendas={vs} />
    </>
  )
}

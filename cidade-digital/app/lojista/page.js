import { getSessao } from '@/lib/supabase-server'
import Painel from './Painel'

export default async function LojistaPage() {
  const { supabase, user, papeis } = await getSessao()

  // admin pode inspecionar qualquer loja; lojista vê a sua
  // a RLS já limita: lojista só vê o próprio comércio; admin vê todos
  const { data: comercios } = await supabase
    .from('comercios')
    .select('id,nome,slug,ativo,bairro,whatsapp,dono_id')
    .order('nome')

  const meu = (comercios || []).find((c) => c.dono_id === user.id) || null
  const loja = meu || (papeis.includes('admin') ? (comercios || [])[0] || null : null)

  if (!loja) {
    return (
      <div className="card">
        <h1>Sem comércio vinculado</h1>
        <p className="muted small">
          Sua conta ainda não está ligada a um comércio. Peça ao administrador para criar e
          aprovar a loja, ou cadastre-se novamente como lojista.
        </p>
      </div>
    )
  }

  const [{ data: vendas }, { data: ofertas }] = await Promise.all([
    supabase.from('vendas')
      .select('id,valor_bruto,desconto,valor_liquido,comissao_divulgador,comissao_plataforma,status,informada_em,libera_em')
      .eq('comercio_id', loja.id)
      .order('informada_em', { ascending: false })
      .limit(40),
    supabase.from('ofertas')
      .select('id,titulo,preco,desconto_max_pct,status')
      .eq('comercio_id', loja.id),
  ])

  return <Painel loja={loja} vendas={vendas || []} ofertas={ofertas || []} />
}

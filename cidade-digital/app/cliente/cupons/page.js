import { getSessao } from '@/lib/supabase-server'
import Cupons from './Cupons'

export default async function CuponsPage({ searchParams }) {
  const { supabase, user } = await getSessao()

  const [{ data: ofertas }, { data: cupons }] = await Promise.all([
    supabase.from('ofertas')
      .select('id,titulo,preco,desconto_max_pct,comercio_id,comercios(nome)')
      .eq('status', 'ativa')
      .order('criado_em', { ascending: false }),
    supabase.from('cupons')
      .select('id,codigo,status,expira_em,valor_desconto,pontos_gastos,ofertas(titulo)')
      .eq('cliente_id', user.id)
      .order('criado_em', { ascending: false })
      .limit(30),
  ])

  return <Cupons ofertas={ofertas || []} cupons={cupons || []} ofertaFoco={searchParams?.oferta} />
}

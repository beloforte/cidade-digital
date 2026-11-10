import { getSessao } from '@/lib/supabase-server'
import Fatura, { FaturaDemo } from './Fatura'

export default async function MinhaFatura() {
  const { supabase, user } = await getSessao()

  const { data: comercios } = await supabase
    .from('comercios')
    .select('id,nome,plano,mensalidade,mensalidade_desde,isento_ate,ativo')
    .eq('dono_id', user.id)

  const loja = (comercios || [])[0]
  if (!loja) {
    return (
      <div className="card">
        <h1>Sem comércio vinculado</h1>
        <p className="muted small">Sua conta ainda não está ligada a um comércio.</p>
      </div>
    )
  }

  const { data: faturas } = await supabase
    .from('faturas')
    .select('id,competencia,valor,status,pago_em')
    .eq('comercio_id', loja.id)
    .order('competencia', { ascending: false })

  return <Fatura loja={loja} faturas={faturas || []} />
}

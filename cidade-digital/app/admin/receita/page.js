import { getSessao } from '@/lib/supabase-server'
import Receita from './Receita'

export default async function ReceitaPage() {
  const { supabase } = await getSessao()

  const [{ data: comercios }, { data: faturas }] = await Promise.all([
    supabase.from('comercios')
      .select('id,nome,plano,mensalidade,mensalidade_desde,isento_ate,ativo')
      .order('nome'),
    supabase.from('faturas')
      .select('id,comercio_id,competencia,valor,status,pago_em,comercios(nome)')
      .order('competencia', { ascending: false })
      .limit(60),
  ])

  return <Receita comercios={comercios || []} faturas={faturas || []} />
}

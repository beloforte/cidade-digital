import { getSessao } from '@/lib/supabase-server'
import Gestao from './Gestao'

export default async function ComerciosPage() {
  const { supabase } = await getSessao()

  const [{ data: comercios }, { data: lojistas }, { data: ofertas }] = await Promise.all([
    supabase.from('comercios')
      .select('id,nome,slug,whatsapp,bairro,ativo,dono_id,criado_em,plano,mensalidade,isento_ate')
      .order('criado_em', { ascending: false }),
    supabase.from('papeis').select('usuario_id,papel,usuarios(nome,email)').eq('papel', 'lojista'),
    supabase.from('ofertas').select('id,titulo,preco,desconto_max_pct,status,comercio_id')
      .order('criado_em', { ascending: false }),
  ])

  return (
    <Gestao
      comercios={comercios || []}
      lojistas={(lojistas || []).map((l) => ({
        id: l.usuario_id,
        nome: l.usuarios?.nome || '—',
        email: l.usuarios?.email || '',
      }))}
      ofertas={ofertas || []}
    />
  )
}

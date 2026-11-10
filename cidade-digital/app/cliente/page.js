import { getSessao } from '@/lib/supabase-server'
import DashboardCliente from '@/components/DashboardCliente'

export default async function ClienteHome() {
  const { supabase, user, perfil } = await getSessao()

  const [{ data: ofertas }, { data: cupons }, { data: extrato }] = await Promise.all([
    supabase.from('ofertas').select('id,titulo,preco,desconto_max_pct,destaque,comercios(nome)')
      .eq('status', 'ativa').limit(12),
    supabase.from('cupons').select('id,codigo,status,expira_em,valor_desconto')
      .eq('cliente_id', user.id).eq('status', 'pendente'),
    supabase.from('pontos_extrato').select('delta,motivo,criado_em')
      .eq('usuario_id', user.id).order('criado_em', { ascending: false }).limit(6),
  ])

  // check-in do dia: a tabela de auditoria não abre para cliente,
  // então o estado vem do próprio extrato
  const fuso = { timeZone: 'America/Sao_Paulo' }
  const hj = new Date().toLocaleDateString('pt-BR', fuso)
  const feitoHoje = (extrato || []).some(
    (e) => e.motivo === 'checkin' && new Date(e.criado_em).toLocaleDateString('pt-BR', fuso) === hj
  )

  return (
    <DashboardCliente
      perfil={perfil}
      ofertas={ofertas || []}
      cupons={cupons || []}
      extrato={extrato || []}
      feitoHoje={feitoHoje}
    />
  )
}

import { getSessao } from '@/lib/supabase-server'
import DashboardCliente from '@/components/DashboardCliente'

export default async function ClienteHome() {
  const s = await getSessao()
  const { supabase, user } = s

  // CONTA SEM PERFIL: acontece quando o trigger do cadastro não rodou (ou foi
  // restaurado de um dump sem o trg_novo_usuario). Antes isso quebrava a tela
  // com "Cannot read properties of null (reading 'nivel')".
  // Aqui o perfil é criado na hora, com o que veio do cadastro.
  let perfil = s.perfil
  if (!perfil && user) {
    const meta = user.user_metadata || {}
    const { data: criado } = await supabase
      .from('usuarios')
      .upsert({
        id: user.id,
        nome: meta.nome || (user.email || '').split('@')[0],
        email: user.email,
        whatsapp: meta.whatsapp || null,
        cpf: (meta.cpf || '').replace(/\D/g, '') || null,
      }, { onConflict: 'id' })
      .select()
      .maybeSingle()

    if (criado) {
      const papel = meta.papel === 'lojista' ? 'lojista' : 'cliente'
      await supabase.from('papeis').upsert(
        { usuario_id: user.id, papel }, { onConflict: 'usuario_id,papel' }
      )
      perfil = criado
    }
  }

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
      semPerfil={!perfil}
      ofertas={ofertas || []}
      cupons={cupons || []}
      extrato={extrato || []}
      feitoHoje={feitoHoje}
    />
  )
}

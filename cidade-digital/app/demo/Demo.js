'use client'
import DashboardCliente from '@/components/DashboardCliente'
import Quiz from '@/app/cliente/quiz/Quiz'
import Cupons from '@/app/cliente/cupons/Cupons'
import Painel from '@/app/lojista/Painel'
import Fila from '@/app/admin/Fila'
import KpisAdmin from '@/components/KpisAdmin'
import { FaturaDemo } from '@/app/lojista/receita/Fatura'
import Nav from '@/components/Nav'

const OFERTAS = [
  { id: '1', titulo: 'Combo x-burger + batata + refri', preco: 32.9, desconto_max_pct: 10, comercios: { nome: 'Lanchonete do Zé' } },
  { id: '2', titulo: 'Pizza grande 2 sabores', preco: 49.9, desconto_max_pct: 10, comercios: { nome: 'Pizzaria Bella' } },
  { id: '3', titulo: 'Marmita executiva', preco: 22, desconto_max_pct: 10, comercios: { nome: 'Restaurante Sabor da Terra' } },
  { id: '4', titulo: 'Açaí 500ml com 3 acompanhamentos', preco: 19.9, desconto_max_pct: 10, comercios: { nome: 'Açaí do Bairro' } },
]

const PERGUNTAS = [
  { id: 1, dificuldade: 1, gabarito: 0, enunciado: 'Qual é o prato típico brasileiro feito com feijão preto, carnes e farofa?', a: 'Feijoada', b: 'Strogonoff', c: 'Lasanha', d: 'Sushi' },
  { id: 2, dificuldade: 2, gabarito: 1, enunciado: 'Qual desses rios passa mais perto de Pontalinda?', a: 'Rio Amazonas', b: 'Rio Paraná', c: 'Rio São Francisco', d: 'Rio Doce' },
  { id: 3, dificuldade: 3, gabarito: 2, enunciado: 'Qual ingrediente dá o amarelo característico do colorau caseiro?', a: 'Cúrcuma', b: 'Páprica', c: 'Urucum', d: 'Açafrão' },
]

const CUPONS = [
  { id: 'c1', codigo: 'A1B2C3D4', status: 'pendente', expira_em: new Date(Date.now() + 41 * 3600e3).toISOString(), valor_desconto: 3.29, ofertas: { titulo: 'Combo x-burger + batata + refri' } },
  { id: 'c2', codigo: '9F8E7D6C', status: 'usado', expira_em: new Date(Date.now() - 72 * 3600e3).toISOString(), valor_desconto: 4.99, ofertas: { titulo: 'Pizza grande 2 sabores' } },
]

const EXTRATO = [
  { delta: 2400, motivo: 'quiz' },
  { delta: 50, motivo: 'checkin' },
  { delta: 658, motivo: 'cashback' },
  { delta: -3290, motivo: 'cupom' },
  { delta: 1800, motivo: 'quiz' },
]

const VENDAS_LOJA = [
  { id: 'v1', valor_bruto: 32.9, desconto: 3.29, valor_liquido: 29.61, comissao_divulgador: 2.07, comissao_plataforma: 0.89, status: 'confirmada', informada_em: new Date(Date.now() - 2 * 86400e3).toISOString(), libera_em: new Date(Date.now() + 5 * 86400e3).toISOString() },
  { id: 'v2', valor_bruto: 49.9, desconto: 0, valor_liquido: 49.9, comissao_divulgador: 3.49, comissao_plataforma: 1.5, status: 'confirmada', informada_em: new Date(Date.now() - 9 * 86400e3).toISOString(), libera_em: new Date(Date.now() - 2 * 86400e3).toISOString() },
  { id: 'v3', valor_bruto: 28.0, desconto: 0, valor_liquido: 28, comissao_divulgador: 1.96, comissao_plataforma: 0.84, status: 'informada', informada_em: new Date(Date.now() - 3 * 3600e3).toISOString(), libera_em: null },
]

const VENDAS_ADMIN = [
  { ...VENDAS_LOJA[2], comercios: { nome: 'Lanchonete do Zé' } },
  { id: 'v4', valor_bruto: 22, desconto: 2.2, valor_liquido: 19.8, comissao_divulgador: 1.39, comissao_plataforma: 0.59, status: 'informada', informada_em: new Date(Date.now() - 5 * 3600e3).toISOString(), libera_em: null, comercios: { nome: 'Restaurante Sabor da Terra' } },
  { ...VENDAS_LOJA[0], comercios: { nome: 'Lanchonete do Zé' } },
  { ...VENDAS_LOJA[1], comercios: { nome: 'Pizzaria Bella' } },
]

const LOJA = { nome: 'Lanchonete do Zé', bairro: 'Centro', ativo: true }
const OFERTAS_LOJA = [{ id: '1', titulo: 'Combo x-burger + batata + refri', preco: 32.9, desconto_max_pct: 10, status: 'ativa' }]

const ABAS = [
  ['cliente', 'Cliente'],
  ['quiz', 'Quiz'],
  ['cupons', 'Cupons'],
  ['lojista', 'Lojista'],
  ['fatura', 'Fatura'],
  ['admin', 'Admin'],
]

export default function Demo({ tela = 'cliente' }) {
  return (
    <>
      <Nav papeis={[]} nome="Modo demo" demo />
      <main className="wrap" style={{ padding: '22px 18px 60px' }}>
        <div className="card" style={{ marginBottom: 16, borderColor: 'var(--gold)', padding: '12px 14px' }}>
          <div className="between">
            <p className="small" style={{ margin: 0 }}>
              <strong style={{ color: 'var(--gold2)' }}>Demonstração</strong>
              <span className="muted"> — dados fixos, sem banco. Nenhum botão grava nada.</span>
            </p>
            <div className="row" style={{ gap: 6 }}>
              {ABAS.map(([k, label]) => (
                <a key={k} href={`/demo?t=${k}`} className="btn"
                   style={{ padding: '5px 10px', fontSize: 12.5, borderColor: tela === k ? 'var(--gold)' : 'var(--line)', color: tela === k ? 'var(--gold2)' : 'var(--ink2)' }}>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {tela === 'cliente' && (
          <DashboardCliente perfil={{ nome: 'Maria Souza', pontos: 4180, pontos_acumulados: 9850, nivel: 'bronze' }}
                            ofertas={OFERTAS} cupons={CUPONS.filter((c) => c.status === 'pendente')}
                            extrato={EXTRATO} demo />
        )}
        {tela === 'quiz' && <Quiz perguntas={PERGUNTAS} demo />}
        {tela === 'cupons' && <Cupons ofertas={OFERTAS} cupons={CUPONS} demo />}
        {tela === 'lojista' && <Painel loja={LOJA} vendas={VENDAS_LOJA} ofertas={OFERTAS_LOJA} demo />}
        {tela === 'fatura' && <FaturaDemo />}
        {tela === 'admin' && (
          <>
            <KpisAdmin
              vendas={VENDAS_ADMIN}
              cupons={CUPONS}
              usuarios={[{ pontos: 4180 }, { pontos: 12300 }, { pontos: 640 }]}
              comercios={[{ ativo: true }, { ativo: true }, { ativo: false }]}
            />
            <Fila vendas={VENDAS_ADMIN} demo />
          </>
        )}
      </main>
    </>
  )
}

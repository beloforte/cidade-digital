import { getSessao } from '@/lib/supabase-server'
import Quiz from './Quiz'

const TOTAL = 15

export default async function QuizPage() {
  const { supabase } = await getSessao()

  const { data: perguntas } = await supabase
    .from('perguntas')
    .select('id,enunciado,a,b,c,d,dificuldade,categoria')
    .eq('ativa', true)

  const todas = perguntas || []

  // mistura desejada: 40% fácil, 33% média, 27% difícil — ajustada ao
  // estoque real do banco (hoje: 32 / 23 / 5). Se faltar de um nível,
  // completa com o que houver, para a rodada nunca sair com menos de 15.
  function embaralha(lista) {
    const a = [...lista]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const porNivel = (d) => embaralha(todas.filter((p) => p.dificuldade === d))
  const facil = porNivel(1)
  const media = porNivel(2)
  const dificil = porNivel(3)

  const escolhidas = [
    ...facil.slice(0, 6),
    ...media.slice(0, 5),
    ...dificil.slice(0, 4),
  ]

  // sobrou (ou faltou) de algum nível: completa com o resto, sem repetir
  if (escolhidas.length < TOTAL) {
    const ids = new Set(escolhidas.map((p) => p.id))
    const resto = embaralha(todas.filter((p) => !ids.has(p.id)))
    escolhidas.push(...resto.slice(0, TOTAL - escolhidas.length))
  }

  const rodada = embaralha(escolhidas)

  if (rodada.length < 5) {
    return (
      <div className="card">
        <h1>Quiz indisponível</h1>
        <p className="muted small">
          Há {rodada.length} pergunta(s) ativa(s) no banco — o mínimo é 5. Rode o seed.sql.
        </p>
      </div>
    )
  }

  return <Quiz perguntas={rodada} />
}

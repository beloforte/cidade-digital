'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { somAcerto, somErro, somFim, aquecerAudio } from '@/lib/som'

const PTS = { 1: 100, 2: 200, 3: 300 }
const LETRAS = ['A', 'B', 'C', 'D']

export default function Quiz({ perguntas, demo = false }) {
  const router = useRouter()
  const supabase = createClient()

  const [i, setI] = useState(0)
  const [marcada, setMarcada] = useState(null)   // resposta escolhida na pergunta atual
  const [correta, setCorreta] = useState(null)   // gabarito só depois de responder
  const [respostas, setRespostas] = useState({})
  const [acertos, setAcertos] = useState(0)
  const [erros, setErros] = useState(0)
  const [fim, setFim] = useState(null)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mudo, setMudo] = useState(false)

  const atual = perguntas[i]
  const ultima = i === perguntas.length - 1
  const respondida = marcada !== null

  // o áudio só destrava depois de um toque — o primeiro toque é sempre em "Começar"
  const [comecou, setComecou] = useState(false)
  const salvo = useRef(false)

  useEffect(() => {
    try { setMudo(localStorage.getItem('cd_mudo') === '1') } catch (e) {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem('cd_mudo', mudo ? '1' : '0') } catch (e) {}
  }, [mudo])

  // quando o estado vira "respondida", a marcação da opção entra em cena
  function tocar(fn) {
    if (mudo) return
    try { fn() } catch (e) {}
  }

  async function responder(idx) {
    if (respondida || enviando) return
    setMarcada(idx)

    let gabarito
    if (demo) {
      // demonstração: gabarito fixo no roteiro, já que não há banco para perguntar
      gabarito = atual.gabarito ?? 0
    } else {
      try {
        // o servidor confere e devolve a correta; a pontuação NÃO é decidida aqui
        const { data, error } = await supabase.rpc('conferir_resposta', {
          p_pergunta: atual.id,
          p_resposta: idx,
        })
        if (error) throw new Error(error.message)
        gabarito = data[0].correta
      } catch (e) {
        setErro('Não consegui conferir esta resposta. Toque de novo.')
        setMarcada(null)
        return
      }
    }

    setCorreta(gabarito)
    const acertou = idx === gabarito
    setRespostas((r) => ({ ...r, [atual.id]: idx }))
    if (acertou) { setAcertos((a) => a + 1); tocar(somAcerto) }
    else { setErros((e) => e + 1); tocar(somErro) }
  }

  function avancar() {
    if (ultima) { finalizar(); return }
    setMarcada(null); setCorreta(null)
    setI(i + 1)
  }

  async function finalizar() {
    setErro(''); setEnviando(true)
    tocar(somFim)
    if (demo) {
      const ganhos = Object.entries(respostas).reduce((a, [id, r]) => {
        const q = perguntas.find((p) => String(p.id) === String(id))
        return a + (r === 0 ? PTS[q.dificuldade] : 0)
      }, 0)
      setFim({ acertos, pontos: ganhos, saldo: 4180 + ganhos })
      setEnviando(false)
      return
    }

    try {
      const payload = Object.entries(respostas).map(([id, r]) => ({
        pergunta_id: Number(id), resposta: r,
      }))
      // quem soma os pontos é a função do banco, com o gabarito conferido lá dentro
      const { data, error } = await supabase.rpc('submeter_quiz', { p_respostas: payload })
      if (error) throw new Error(error.message)
      setFim(data[0])
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  if (!comecou) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🎯</div>
        <h1 style={{ marginBottom: 4 }}>{perguntas.length} perguntas, uma rodada por dia</h1>
        <p className="muted small" style={{ marginBottom: 4 }}>
          Acertou: caixa registradora. Errou: toca o erro. Sem pressa, sem cronômetro.
        </p>
        <p className="tiny muted" style={{ marginBottom: 20 }}>
          Dá para desligar o som no topo da tela.
        </p>
        <button className="btn prim wide" onClick={() => { aquecerAudio(); setComecou(true) }}>
          Começar
        </button>
      </div>
    )
  }

  if (fim) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 46, marginBottom: 6 }}>
          {acertos >= perguntas.length * 0.8 ? '🏆' : acertos >= perguntas.length * 0.5 ? '🥈' : '🎯'}
        </div>
        <h1 style={{ marginBottom: 2 }}>{fim.acertos} de {perguntas.length}</h1>
        <p className="muted small">Você ganhou</p>
        <p style={{ fontSize: 30, fontWeight: 700, color: 'var(--gold2)', margin: '4px 0 2px' }}>
          +{Number(fim.pontos).toLocaleString('pt-BR')} pts
        </p>
        <p className="small muted">Saldo: {Number(fim.saldo).toLocaleString('pt-BR')} pontos</p>
        <button className="btn prim wide" style={{ marginTop: 16 }}
                onClick={() => { router.push(demo ? '/demo' : '/cliente'); router.refresh() }}>
          Voltar ao início
        </button>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="between" style={{ marginBottom: 14 }}>
        <span className="tiny muted">Pergunta {i + 1} de {perguntas.length}</span>
        <div className="row" style={{ gap: 8 }}>
          <span className="tiny" style={{ color: 'var(--green)' }}>✓ {acertos}</span>
          <span className="tiny" style={{ color: 'var(--red)' }}>✕ {erros}</span>
          <button className="btn ghost" onClick={() => setMudo((m) => !m)}
                  title={mudo ? 'Ligar som' : 'Desligar som'}
                  style={{ padding: '3px 8px', fontSize: 12, lineHeight: 1 }}>
            {mudo ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      <div style={{ height: 4, background: 'var(--bg)', borderRadius: 20, marginBottom: 18, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: ((i + 1) / perguntas.length) * 100 + '%', background: 'var(--gold)' }} />
      </div>

      {erro && <div className="alert err">{erro}</div>}

      <h2 style={{ fontSize: 17.5, lineHeight: 1.4, marginBottom: 16 }}>{atual.enunciado}</h2>

      {[atual.a, atual.b, atual.c, atual.d].map((op, idx) => {
        let estilo = {}
        let marca = null
        if (respondida) {
          if (idx === correta) {
            estilo = { borderColor: 'var(--green)', background: 'rgba(52,211,153,.10)' }
            marca = '✓'
          } else if (idx === marcada) {
            estilo = { borderColor: 'var(--red)', background: 'rgba(248,113,113,.10)' }
            marca = '✕'
          } else {
            estilo = { opacity: 0.45 }
          }
        }
        return (
          <button key={idx} className="opt" onClick={() => responder(idx)}
                  disabled={respondida} style={estilo}>
            <span style={{ opacity: 0.5, marginRight: 8, fontSize: 12 }}>{LETRAS[idx]}</span>
            {op}
            {marca && <span style={{ float: 'right', fontWeight: 700 }}>{marca}</span>}
          </button>
        )
      })}

      {respondida && (
        <>
          <p className="small" style={{ margin: '14px 0 0', color: marcada === correta ? 'var(--green)' : 'var(--red)' }}>
            {marcada === correta
              ? `Isso — +${PTS[atual.dificuldade]} pts`
              : `Errou. A certa era ${LETRAS[correta]}: ${[atual.a, atual.b, atual.c, atual.d][correta]}`}
          </p>
          <button className="btn prim wide" style={{ marginTop: 12 }} onClick={avancar}>
            {ultima ? 'Ver resultado' : 'Próxima pergunta'}
          </button>
        </>
      )}
    </div>
  )
}

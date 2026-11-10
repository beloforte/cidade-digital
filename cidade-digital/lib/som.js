/* Sons do quiz — sintetizados no navegador, sem arquivo de áudio nem CDN.
   Caixa registradora no acerto, "errou" no erro. 5 KB de código em vez de 200 KB de mp3,
   e funciona offline (3G de interior, tela de celular no balcão). */

let ctx = null

function audio() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tom(ac, { freq, inicio = 0, dur = 0.12, tipo = 'triangle', volume = 0.16, ate = null }) {
  const t0 = ac.currentTime + inicio
  const osc = ac.createOscillator()
  const ganho = ac.createGain()
  osc.type = tipo
  osc.frequency.setValueAtTime(freq, t0)
  if (ate) osc.frequency.exponentialRampToValueAtTime(ate, t0 + dur)
  ganho.gain.setValueAtTime(0.0001, t0)
  ganho.gain.exponentialRampToValueAtTime(volume, t0 + 0.008)
  ganho.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(ganho).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

function ruido(ac, { inicio = 0, dur = 0.05, volume = 0.08, corte = 1800 }) {
  const t0 = ac.currentTime + inicio
  const n = Math.floor(ac.sampleRate * dur)
  const buf = ac.createBuffer(1, n, ac.sampleRate)
  const dados = buf.getChannelData(0)
  for (let i = 0; i < n; i++) dados[i] = (Math.random() * 2 - 1) * (1 - i / n)
  const src = ac.createBufferSource()
  src.buffer = buf
  const filtro = ac.createBiquadFilter()
  filtro.type = 'bandpass'
  filtro.frequency.value = corte
  const ganho = ac.createGain()
  ganho.gain.value = volume
  src.connect(filtro).connect(ganho).connect(ac.destination)
  src.start(t0)
}

/** Caixa registradora: "dim" do sino + gaveta batendo. */
export function somAcerto() {
  const ac = audio()
  if (!ac) return
  tom(ac, { freq: 1318.5, dur: 0.16, tipo: 'triangle', volume: 0.18 })          // mi6
  tom(ac, { freq: 1975.5, inicio: 0.06, dur: 0.5, tipo: 'sine', volume: 0.14 }) // si6, o sino
  tom(ac, { freq: 2637.0, inicio: 0.06, dur: 0.35, tipo: 'sine', volume: 0.07 })
  ruido(ac, { inicio: 0.16, dur: 0.05, volume: 0.10, corte: 1200 })             // gaveta
  ruido(ac, { inicio: 0.235, dur: 0.09, volume: 0.13, corte: 400 })             // baque
  tom(ac, { freq: 110, inicio: 0.24, dur: 0.10, tipo: 'square', volume: 0.05 })
}

/** Erro: dois tons descendo, meio abafados. */
export function somErro() {
  const ac = audio()
  if (!ac) return
  tom(ac, { freq: 320, dur: 0.13, tipo: 'sawtooth', volume: 0.09, ate: 230 })
  tom(ac, { freq: 180, inicio: 0.13, dur: 0.22, tipo: 'sawtooth', volume: 0.10, ate: 110 })
}

/** Fim de rodada: arpejo curto (não é fanfarra, é "acabou"). */
export function somFim() {
  const ac = audio()
  if (!ac) return
  ;[523.25, 659.25, 783.99].forEach((f, i) =>
    tom(ac, { freq: f, inicio: i * 0.09, dur: 0.2, tipo: 'triangle', volume: 0.10 }))
}

/** Toque curto de "pode crer, registrei" (check-in, validar cupom). */
export function somOk() {
  const ac = audio()
  if (!ac) return
  tom(ac, { freq: 880, dur: 0.09, tipo: 'sine', volume: 0.12 })
  tom(ac, { freq: 1320, inicio: 0.075, dur: 0.14, tipo: 'sine', volume: 0.10 })
}

/** Destrava o áudio no primeiro toque do usuário (exigência dos navegadores). */
export function aquecerAudio() {
  const ac = audio()
  if (!ac) return ac !== null
  return true
}

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function Checkin({ feitoHoje, demo = false }) {
  const router = useRouter()
  const supabase = createClient()
  const [estado, setEstado] = useState(feitoHoje ? 'feito' : 'livre')
  const [msg, setMsg] = useState('')

  async function ponto() {
    if (demo) { setMsg('Modo demonstração: no app real vale 50 pontos.'); setEstado('feito'); return }
    setEstado('...')
    const { data, error } = await supabase.rpc('checkin')
    if (error) { setMsg(error.message); setEstado(feitoHoje ? 'feito' : 'livre'); return }
    const r = data[0]
    setMsg(r.mensagem)
    setEstado(r.ok ? 'feito' : 'feito')
    router.refresh()
  }

  return (
    <div className="card between" style={{ marginBottom: 14 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 14.5 }}>Check-in de hoje</h2>
        <p className="tiny muted" style={{ margin: '2px 0 0' }}>
          {msg || (estado === 'feito' ? 'Você já marcou presença hoje. Volte amanhã.' : '50 pontos por dia, é só tocar.')}
        </p>
      </div>
      <button className="btn" onClick={ponto} disabled={estado !== 'livre'}
              style={{ padding: '8px 14px', fontSize: 13 }}>
        {estado === 'feito' ? '✓ feito' : estado === '...' ? '...' : '+50 pts'}
      </button>
    </div>
  )
}

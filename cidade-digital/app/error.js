'use client'
import { useEffect } from 'react'

/* Tela mostrada quando um componente quebra no navegador.
   Sem isto, o Next exibe só "Application error: a client-side exception has occurred".
   Aqui a mensagem real aparece na tela — e o usuário pode copiar e mandar. */
export default function Erro({ error, reset }) {
  useEffect(() => {
    console.error('[erro na tela]', error)
  }, [error])

  const msg = error?.message || 'erro desconhecido'
  const digest = error?.digest

  return (
    <div className="center">
      <div className="card auth" style={{ maxWidth: 520 }}>
        <h1>Algo quebrou nesta tela</h1>
        <p className="muted small" style={{ marginTop: 0 }}>
          O restante do app continua funcionando. Tente de novo; se repetir,
          copie o texto abaixo e mande para quem mantém o sistema.
        </p>

        <div className="alert err" style={{ wordBreak: 'break-word', fontFamily: 'ui-monospace, monospace' }}>
          {String(msg).slice(0, 400)}
        </div>

        {digest && (
          <p className="small muted">código do erro: <code>{digest}</code></p>
        )}

        <button className="btn prim wide" onClick={() => reset()}>Tentar de novo</button>
        <p className="small muted" style={{ textAlign: 'center', marginTop: 14 }}>
          <a href="/">Voltar para o início</a>
        </p>
      </div>
    </div>
  )
}

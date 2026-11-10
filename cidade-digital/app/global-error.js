'use client'

/* Último recurso: quebra no layout raiz. Precisa ter <html> e <body> próprios. */
export default function ErroGlobal({ error, reset }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#0e1116', color: '#e8ecf1',
                     display: 'grid', placeItems: 'center', minHeight: '100vh', margin: 0 }}>
        <div style={{ maxWidth: 520, padding: 24, background: '#161b22',
                      border: '1px solid #2a323d', borderRadius: 14 }}>
          <h1 style={{ fontSize: 20, marginTop: 0 }}>O app não conseguiu iniciar</h1>
          <p style={{ fontSize: 14, color: '#9aa7b8' }}>
            Copie o texto abaixo e mande para quem mantém o sistema.
          </p>
          <pre style={{ fontSize: 12, color: '#ffc9c7', whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word', background: 'rgba(239,83,80,.1)',
                        border: '1px solid rgba(239,83,80,.35)', borderRadius: 10, padding: 12 }}>
            {String(error?.message || 'erro desconhecido').slice(0, 400)}
          </pre>
          <button onClick={() => reset()}
                  style={{ padding: '10px 16px', borderRadius: 10, border: 0,
                           background: '#4f8ef7', color: '#fff', fontSize: 14, cursor: 'pointer' }}>
            Tentar de novo
          </button>
        </div>
      </body>
    </html>
  )
}

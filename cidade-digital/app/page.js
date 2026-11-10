export default function Home() {
  return (
    <div className="center">
      <div className="card auth" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🎯</div>
        <h1>Cidade Digital</h1>
        <p className="muted small">Quiz, pontos e descontos no comércio de Pontalinda.</p>
        <div className="row" style={{ marginTop: 20 }}>
          <a className="btn prim wide" href="/login">Entrar</a>
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <a className="btn wide" href="/cadastro">Criar conta</a>
        </div>
      </div>
    </div>
  )
}

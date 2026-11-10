import './globals.css'

export const metadata = {
  title: 'Cidade Digital',
  description: 'Quiz, pontos e descontos no comércio de Pontalinda',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

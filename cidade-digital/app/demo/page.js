import Demo from './Demo'

const TELAS = ['cliente', 'quiz', 'cupons', 'lojista', 'fatura', 'admin']

export default function Page({ searchParams }) {
  const tela = TELAS.includes(searchParams?.t) ? searchParams.t : 'cliente'
  return <Demo tela={tela} />
}

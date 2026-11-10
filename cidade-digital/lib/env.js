// Um lugar só para validar as variáveis do Supabase, com erro que diz o que fazer.
const FALTANDO = () => {
  const faltam = [
    !process.env.NEXT_PUBLIC_SUPABASE_URL && 'NEXT_PUBLIC_SUPABASE_URL',
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ].filter(Boolean)

  return new Error(
    `Faltam as variaveis de ambiente: ${faltam.join(', ')}.\n\n` +
    `NA VERCEL: Settings > Environment Variables > adicione as duas,\n` +
    `marcando Production (e Preview). Depois Deployments > Redeploy.\n` +
    `Variavel nova NAO entra em deploy ja feito: precisa re-deployar.\n\n` +
    `LOCAL: copie .env.example para .env.local e preencha.\n` +
    `Valores: Supabase > Project Settings > API (URL e anon public).`
  )
}

export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw FALTANDO()
  return { url, key }
}

/** true se as duas variáveis existem — para decidir se pode criar o client */
export function temEnvSupabase() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

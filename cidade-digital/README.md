# Cidade Digital — app

Next.js 14 (App Router) + Supabase. O banco está em `../schema.sql` e `../seed.sql`;
o guia de deploy está em `../README-DEPLOY.md`.

## Rodar

```bash
cp .env.example .env.local   # cole a URL e a anon key do Supabase
npm install
npm run dev                  # http://localhost:3000
```

Sem credenciais o app abre em `/`, `/login`, `/cadastro` e `/demo`, mas todo dado
autenticado fica vazio. `/demo` mostra as 5 telas com dados fixos, sem banco.

## Rotas

| Rota | Papel | O que faz |
|---|---|---|
| `/` | público | capa com entrar / criar conta |
| `/login`, `/cadastro` | público | auth (Supabase) |
| `/demo` | público | demonstração sem banco, 5 abas |
| `/cliente` | cliente | saldo, nível, check-in, ofertas, extrato |
| `/cliente/quiz` | cliente | rodada de 15 perguntas, 1 por dia |
| `/cliente/cupons` | cliente | resgatar e ver cupons (48h) |
| `/lojista` | lojista | registrar venda, validar cupom, histórico |
| `/admin` | admin | KPIs e fila de confirmação de venda |
| `/admin/comercios` | admin | cadastrar/aprovar loja, publicar oferta |

O `middleware.js` barra rota por papel e manda cada um para a sua home.

## Regra de ouro

O navegador **nunca** decide pontos, desconto, comissão ou nível. Tudo isso é
`security definer` no `schema.sql`; o app só chama a RPC e mostra a resposta.
Se um dia alguém abrir o DevTools e chamar a RPC na mão, a função do banco
recusa pelo mesmo motivo.

## Build

```bash
npm run build   # 13 rotas, 0 erro (verificado)
npm start
```

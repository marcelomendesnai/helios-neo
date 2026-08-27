# Deploy — Helios Neo (Cloudflare Pages)

Pasta espelho do repo GitHub `helios-neo` (marcelomendesnai/helios-neo), fonte
do deploy no Cloudflare Pages. Segue o mesmo padrao do Garagem Inteligente e
Estudo Biblico (ver MEMORY.md em _meta).

## Estrutura
- `index.html`, `styles-v6.css`, `context-export.js`, `manifest.json`, `sw.js` e ícones — PWA.
- `functions/` — API do Cloudflare Pages para autenticação, carteira, cotações, histórico e fundamentos.
- `migrations/` — somente schema e parâmetros genéricos. Dados pessoais nunca entram no Git.
- `PRODUCT.md` e `DESIGN.md` — contexto de produto e sistema visual.
- `tests/` — testes focados das funções que montam e copiam o contexto da carteira.

## Testes locais

```powershell
node --test tests/*.test.cjs
```

## Fluxo de deploy
1. Alterar o código em uma branch e validar interface, API e migrations localmente.
2. Abrir PR; não publicar dados reais, tokens ou arquivos de credenciais.
3. Depois do merge, o Cloudflare Pages faz o deploy automaticamente.

## Segurança operacional
- `PIN`, `SESSION_SECRET`, chaves externas e dados reais ficam apenas no Cloudflare/D1.
- O repositório deve permanecer privado enquanto representar uma carteira real.
- Antes do deploy, aplicar as migrations pendentes e conferir o cache do Service Worker.


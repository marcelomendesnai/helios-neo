# Deploy — Helios Neo (Cloudflare Pages)

Pasta espelho do repo GitHub `helios-neo` (marcelomendesnai/helios-neo), fonte
do deploy no Cloudflare Pages. Segue o mesmo padrao do Garagem Inteligente e
Estudo Biblico (ver MEMORY.md em _meta).

## Estrutura
- `index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` — o PWA em si (raiz do site).
- `functions/` — Cloudflare Pages Functions (API). Vazia por enquanto (Passo 1);
  Passo 3 do roadmap adiciona as rotas que substituem o Google Apps Script
  (login com PIN verificado no servidor + leitura/escrita no D1).

## Fluxo de deploy
1. Editar os arquivos aqui dentro (`deploy/`), nao na raiz do projeto (`Helios_Neo/index.html`
   e a copia de trabalho local/PWA; espelhar manualmente pra ca quando for publicar).
2. `git add . && git commit -m "..."` e `git push` (repo ja configurado com o token em `_meta/.git-credentials`).
3. Cloudflare Pages redeploya sozinho a cada push (conectado ao repo GitHub).

## Historico
- 2026-07-13: repo criado, deploy inicial so com o frontend (ainda sem Functions/D1) — Passo 1 do roadmap de migracao.

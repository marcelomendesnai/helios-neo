// GET /api/ativos — lista de ativos enriquecida (preço atual, variação, ganho real).
// POST /api/ativos — cria ativo novo (editor de ativos, 2026-07-19).
import { checkAuth, unauthorized } from '../_lib/auth.js';
import { listarAtivosEnriquecidos, gerarIdAtivo, sanitizarAtivoInput } from '../_lib/ativos.js';

export async function onRequestGet({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();
  try {
    const data = await listarAtivosEnriquecidos(env.DB, env);
    return json({ ok: true, data });
  } catch (e) {
    return json({ erro: e.message }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();
  try {
    const body = await request.json();
    if (!body.nome || !String(body.nome).trim()) {
      return json({ erro: 'nome_obrigatorio' }, 400);
    }
    const campos = sanitizarAtivoInput(body);
    const id = gerarIdAtivo();
    const agora = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
    ).bind(
      id,
      campos.classif_1 ?? null, campos.classif_2 ?? null, campos.classif_3 ?? null, campos.classif_4 ?? null,
      body.nome.trim(), campos.ticker_api ?? null,
      campos.qtd ?? null, campos.preco_medio ?? null, campos.data_aquis ?? null,
      campos.calc_real ?? 0, campos.preco_atual_manual ?? null,
      campos.moeda ?? 'BRL', campos.fonte_url ?? null, campos.observacao ?? null,
      agora, agora
    ).run();
    return json({ ok: true, id });
  } catch (e) {
    return json({ erro: e.message }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}

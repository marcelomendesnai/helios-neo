// PUT    /api/ativos/:id — edita campos de um ativo existente.
// DELETE /api/ativos/:id — soft-delete (ativo = 0, não apaga a linha).
import { checkAuth, unauthorized } from '../../_lib/auth.js';
import { sanitizarAtivoInput } from '../../_lib/ativos.js';

export async function onRequestPut({ request, env, params }) {
  if (!checkAuth(request, env)) return unauthorized();
  const id = params.id;
  try {
    const existente = await env.DB.prepare('SELECT id FROM ativos WHERE id = ?').bind(id).first();
    if (!existente) return json({ erro: 'ativo_nao_encontrado' }, 404);

    const body = await request.json();
    const campos = sanitizarAtivoInput(body);
    const chaves = Object.keys(campos);
    if (!chaves.length) return json({ erro: 'nada_para_atualizar' }, 400);

    const agora = new Date().toISOString();
    const sets = chaves.map((k) => `${k} = ?`).concat('atualizado_em = ?');
    const valores = chaves.map((k) => campos[k]).concat(agora, id);

    await env.DB.prepare(`UPDATE ativos SET ${sets.join(', ')} WHERE id = ?`).bind(...valores).run();
    return json({ ok: true });
  } catch (e) {
    return json({ erro: e.message }, 500);
  }
}

export async function onRequestDelete({ request, env, params }) {
  if (!checkAuth(request, env)) return unauthorized();
  const id = params.id;
  try {
    const existente = await env.DB.prepare('SELECT id FROM ativos WHERE id = ?').bind(id).first();
    if (!existente) return json({ erro: 'ativo_nao_encontrado' }, 404);
    const agora = new Date().toISOString();
    await env.DB.prepare('UPDATE ativos SET ativo = 0, atualizado_em = ? WHERE id = ?').bind(agora, id).run();
    return json({ ok: true });
  } catch (e) {
    return json({ erro: e.message }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}

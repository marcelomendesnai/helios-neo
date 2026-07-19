// GET /api/ativos — lista de ativos enriquecida (preço atual, variação, ganho real).
import { checkAuth, unauthorized } from '../_lib/auth.js';
import { listarAtivosEnriquecidos } from '../_lib/ativos.js';

export async function onRequestGet({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();
  try {
    const data = await listarAtivosEnriquecidos(env.DB, env);
    return json({ ok: true, data });
  } catch (e) {
    return json({ erro: e.message }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}

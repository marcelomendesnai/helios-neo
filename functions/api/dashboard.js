// GET /api/dashboard — totais (bruto/líquido) + breakdown por categoria + top 10.
import { checkAuth, unauthorized } from '../_lib/auth.js';
import { listarAtivosEnriquecidos, montarDashboard } from '../_lib/ativos.js';

export async function onRequestGet({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();
  try {
    const ativos = await listarAtivosEnriquecidos(env.DB, env);
    const data = montarDashboard(ativos);
    return json({ ok: true, data });
  } catch (e) {
    return json({ erro: e.message }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}

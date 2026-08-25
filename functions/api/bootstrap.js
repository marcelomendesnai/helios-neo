// GET /api/bootstrap — carga inicial consistente em uma única passagem.
import { checkAuth, unauthorized } from '../_lib/auth.js';
import { listarAtivosEnriquecidos, montarDashboard } from '../_lib/ativos.js';

export async function onRequestGet({ request, env }) {
  if (!(await checkAuth(request, env))) return unauthorized();
  try {
    const ativos = await listarAtivosEnriquecidos(env.DB, env);
    const dashboard = montarDashboard(ativos);
    const { results } = await env.DB
      .prepare('SELECT data, total_bruto, total_liquido, total_por_classif1 FROM snapshots ORDER BY data')
      .all();
    const snapshots = (results || []).map((s) => ({
      data: s.data,
      total_bruto: s.total_bruto,
      total_liquido: s.total_liquido,
      por_classif1: parseJsonSeguro(s.total_por_classif1)
    }));
    return json({ ok: true, data: { dashboard, ativos, snapshots } });
  } catch (e) {
    return json({ erro: e.message }, 500);
  }
}

function parseJsonSeguro(value) {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}


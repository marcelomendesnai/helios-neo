// GET /api/snapshots — histórico mensal de patrimônio.
import { checkAuth, unauthorized } from '../_lib/auth.js';

export async function onRequestGet({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();
  try {
    const { results } = await env.DB
      .prepare('SELECT data, total_bruto, total_liquido, total_por_classif1 FROM snapshots ORDER BY data')
      .all();
    const data = (results || []).map((s) => ({
      data: s.data,
      total_bruto: s.total_bruto,
      total_liquido: s.total_liquido,
      por_classif1: s.total_por_classif1 ? JSON.parse(s.total_por_classif1) : null
    }));
    return json({ ok: true, data });
  } catch (e) {
    return json({ erro: e.message }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}

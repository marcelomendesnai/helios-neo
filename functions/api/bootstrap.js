// GET /api/bootstrap — carga inicial consistente em uma única passagem.
import { checkAuth, unauthorized } from '../_lib/auth.js';
import { listarAtivosEnriquecidos, montarDashboard } from '../_lib/ativos.js';
import { garantirSnapshotMensal, listarSnapshotsComIpca } from '../_lib/historico.js';

export async function onRequestGet({ request, env }) {
  if (!(await checkAuth(request, env))) return unauthorized();
  try {
    const ativos = await listarAtivosEnriquecidos(env.DB, env);
    const dashboard = montarDashboard(ativos);
    await garantirSnapshotMensal(env.DB, dashboard);
    const snapshots = await listarSnapshotsComIpca(env.DB);
    return json({ ok: true, data: { dashboard, ativos, snapshots } });
  } catch (e) {
    return json({ erro: e.message }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}


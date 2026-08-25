// GET /api/snapshots — histórico mensal de patrimônio.
import { checkAuth, unauthorized } from '../_lib/auth.js';
import { listarSnapshotsComIpca } from '../_lib/historico.js';

export async function onRequestGet({ request, env }) {
  if (!(await checkAuth(request, env))) return unauthorized();
  try {
    const data = await listarSnapshotsComIpca(env.DB);
    return json({ ok: true, data });
  } catch (e) {
    return json({ erro: e.message }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}


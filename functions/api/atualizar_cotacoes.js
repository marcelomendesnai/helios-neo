// GET /api/atualizar_cotacoes — botão de refresh manual do app.
// Apaga o cache de hoje e força buscar cotação nova na BRAPI/câmbio.
import { checkAuth, unauthorized } from '../_lib/auth.js';

export async function onRequestGet({ request, env }) {
  if (!(await checkAuth(request, env))) return unauthorized();
  try {
    const hoje = new Date().toISOString().slice(0, 10);
    await env.DB.prepare('DELETE FROM cotacoes_cache WHERE data = ?').bind(hoje).run();
    // O próximo /api/bootstrap repopula o cache e devolve os mesmos dados usados
    // pela tela; evita calcular carteira e IPCA duas vezes no mesmo refresh.
    return json({ ok: true });
  } catch (e) {
    return json({ erro: e.message }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}


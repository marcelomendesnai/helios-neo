// GET /api/parametros — lista todos os parâmetros de setor (pra tela de edição).
// PUT  /api/parametros — edita um indicador de um setor (aplicavel/verde/amarelo/peso).
// Edição aqui marca gerado_por_ia=0 (deixou de ser só sugestão da IA, o Marcelo validou/mudou).
import { checkAuth, unauthorized } from '../_lib/auth.js';
import { INDICADORES } from '../_lib/gemini.js';

export async function onRequestGet({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();
  try {
    const { results } = await env.DB.prepare('SELECT * FROM parametros_fundamentos ORDER BY setor, indicador').all();
    return json({ ok: true, data: results || [], indicadores: INDICADORES });
  } catch (e) {
    return json({ erro: e.message }, 500);
  }
}

export async function onRequestPut({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();
  try {
    const body = await request.json();
    const { setor, indicador } = body;
    if (!setor || !indicador || !INDICADORES[indicador]) {
      return json({ erro: 'setor_ou_indicador_invalido' }, 400);
    }
    const aplicavel = body.aplicavel ? 1 : 0;
    const verde_limite = body.verde_limite === '' || body.verde_limite === undefined ? null : Number(body.verde_limite);
    const amarelo_limite = body.amarelo_limite === '' || body.amarelo_limite === undefined ? null : Number(body.amarelo_limite);
    const peso = body.peso ? Number(body.peso) : INDICADORES[indicador].peso;
    const agora = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO parametros_fundamentos (setor, indicador, aplicavel, direcao, verde_limite, amarelo_limite, peso, gerado_por_ia, gerado_em, atualizado_em)
       VALUES (?,?,?,?,?,?,?,0,NULL,?)
       ON CONFLICT(setor, indicador) DO UPDATE SET
         aplicavel = excluded.aplicavel,
         verde_limite = excluded.verde_limite,
         amarelo_limite = excluded.amarelo_limite,
         peso = excluded.peso,
         gerado_por_ia = 0,
         atualizado_em = excluded.atualizado_em`
    ).bind(setor, indicador, aplicavel, INDICADORES[indicador].direcao, verde_limite, amarelo_limite, peso, agora).run();

    return json({ ok: true });
  } catch (e) {
    return json({ erro: e.message }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}

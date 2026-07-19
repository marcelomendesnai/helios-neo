// POST /api/login  { pin: "1234" }
// Compara com a secret PIN (configurada no dashboard Cloudflare, nunca no código).
// Se bater, devolve um cookie de sessão HttpOnly.
import { sessionCookie } from '../_lib/auth.js';

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ erro: 'body_invalido' }, 400);
  }

  if (!env.PIN) return json({ erro: 'pin_nao_configurado_no_servidor' }, 500);
  if (!env.SESSION_SECRET) return json({ erro: 'session_secret_nao_configurado' }, 500);

  const pin = String(body.pin || '');
  if (pin !== env.PIN) return json({ erro: 'pin_incorreto' }, 401);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': sessionCookie(env)
    }
  });
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}

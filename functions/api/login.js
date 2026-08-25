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

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const ipKey = await hashIdentifier(ip, env.SESSION_SECRET);
  const agora = Math.floor(Date.now() / 1000);
  const tentativa = await env.DB.prepare('SELECT falhas, janela_inicio, bloqueado_ate FROM login_attempts WHERE ip_hash = ?').bind(ipKey).first();
  if (tentativa && Number(tentativa.bloqueado_ate) > agora) {
    return json({ erro: 'tente_novamente_mais_tarde' }, 429, { 'Retry-After': String(Number(tentativa.bloqueado_ate) - agora) });
  }

  const pin = String(body.pin || '');
  if (pin !== env.PIN) {
    const dentroDaJanela = tentativa && agora - Number(tentativa.janela_inicio) < 600;
    const falhas = dentroDaJanela ? Number(tentativa.falhas) + 1 : 1;
    const janelaInicio = dentroDaJanela ? Number(tentativa.janela_inicio) : agora;
    const bloqueadoAte = falhas >= 5 ? agora + 900 : 0;
    await env.DB.prepare(
      `INSERT INTO login_attempts (ip_hash, falhas, janela_inicio, bloqueado_ate, atualizado_em)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(ip_hash) DO UPDATE SET falhas=excluded.falhas, janela_inicio=excluded.janela_inicio,
       bloqueado_ate=excluded.bloqueado_ate, atualizado_em=excluded.atualizado_em`
    ).bind(ipKey, falhas, janelaInicio, bloqueadoAte, new Date().toISOString()).run();
    return json({ erro: 'pin_incorreto' }, 401);
  }

  await env.DB.prepare('DELETE FROM login_attempts WHERE ip_hash = ?').bind(ipKey).run();

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': await sessionCookie(env)
    }
  });
}

async function hashIdentifier(value, secret) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function json(obj, status, extraHeaders = {}) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...extraHeaders } });
}


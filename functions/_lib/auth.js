// Helios Neo — verificação de sessão via cookie HttpOnly.
// O PIN só é comparado aqui (servidor). Depois do login certo, o navegador
// guarda um cookie (SESSION_SECRET) que ele manda sozinho nas próximas
// chamadas — nunca aparece no código-fonte que dá pra ver com F12.

const COOKIE_NAME = 'helios_session';

export function checkAuth(request, env) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp(COOKIE_NAME + '=([^;]+)'));
  if (!match) return false;
  if (!env.SESSION_SECRET) return false;
  return match[1] === env.SESSION_SECRET;
}

export function unauthorized() {
  return new Response(JSON.stringify({ erro: 'nao_autorizado' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function sessionCookie(env) {
  const maxAge = 60 * 60 * 24 * 30; // 30 dias
  return `${COOKIE_NAME}=${env.SESSION_SECRET}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export function clearCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

// Helios Neo — sessão curta, assinada e guardada em cookie HttpOnly.
// O navegador recebe somente um token verificável; SESSION_SECRET nunca sai
// do Worker. O token expira mesmo se o cookie for copiado ou não for apagado.

const COOKIE_NAME = '__Host-helios_session';
const SESSION_SECONDS = 60 * 60 * 8;
const encoder = new TextEncoder();

function base64url(bytes) {
  let bin = '';
  new Uint8Array(bytes).forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const bin = atob(base64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function signingKey(secret) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function sign(payload, secret) {
  const key = await signingKey(secret);
  return base64url(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
}

export async function checkAuth(request, env) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp(COOKIE_NAME + '=([^;]+)'));
  if (!match) return false;
  if (!env.SESSION_SECRET) return false;
  const parts = match[1].split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return false;
  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires <= Math.floor(Date.now() / 1000)) return false;
  try {
    const key = await signingKey(env.SESSION_SECRET);
    return crypto.subtle.verify('HMAC', key, fromBase64url(parts[2]), encoder.encode(parts[0] + '.' + parts[1]));
  } catch {
    return false;
  }
}

export function unauthorized() {
  return new Response(JSON.stringify({ erro: 'nao_autorizado' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function sessionCookie(env) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `v1.${expires}`;
  const token = `${payload}.${await sign(payload, env.SESSION_SECRET)}`;
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_SECONDS}`;
}

export function clearCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}


// Helios Neo — lógica de ativos/cotações/IPCA.
// Porta pra cá a lógica que antes vivia no Code.gs (Google Apps Script):
// cotações via BRAPI (ações/FIIs) e open.er-api.com (câmbio), com cache
// diário na tabela D1 `cotacoes_cache`; IPCA acumulado via API do BCB
// (série 433) pra calcular ganho real dos bens com calc_real=1.
//
// OBS: hoje() usa UTC (Cloudflare Workers rodam em UTC). Code.gs usava
// horário de São Paulo. Diferença só importa perto da meia-noite — não
// afeta o valor do patrimônio, só a data do cache/snapshot em casos raros.

function hojeStr() {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

// Editor de ativos (2026-07-19) — campos que a página deixa editar direto.
// Whitelist de propósito: nunca deixar o body do POST/PUT gravar coluna fora
// dessa lista (ex: 'id', 'ativo' de soft-delete tem rota própria — DELETE).
export const CAMPOS_ATIVO = [
  'classif_1', 'classif_2', 'classif_3', 'classif_4',
  'nome', 'ticker_api', 'qtd', 'preco_medio', 'data_aquis',
  'calc_real', 'preco_atual_manual', 'moeda', 'fonte_url', 'observacao'
];

// Gera id curto no mesmo formato dos existentes (8 hex, ex: 'e5832a55').
export function gerarIdAtivo() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8);
}

// Filtra o body pra só os campos permitidos + normaliza tipos (D1 é chato
// com undefined — vira null; número vazio vira null; calc_real vira 0/1).
export function sanitizarAtivoInput(body) {
  const out = {};
  for (const campo of CAMPOS_ATIVO) {
    if (!(campo in body)) continue;
    let v = body[campo];
    if (v === '' || v === undefined) v = null;
    if (campo === 'qtd' || campo === 'preco_medio') {
      v = v === null ? null : Number(v);
      if (v !== null && isNaN(v)) v = null;
    }
    if (campo === 'calc_real') {
      v = (v === true || v === 1 || v === '1') ? 1 : 0;
    }
    out[campo] = v;
  }
  return out;
}

async function mapaCotacoesHoje(db, hoje) {
  const { results } = await db
    .prepare('SELECT ticker_api, preco FROM cotacoes_cache WHERE data = ?')
    .bind(hoje)
    .all();
  const mapa = {};
  (results || []).forEach((r) => { mapa[r.ticker_api] = r.preco; });
  return mapa;
}

async function buscarCotacoesFaltantes(db, tickers, env, hoje) {
  const agora = new Date().toISOString();
  const cambios = tickers.filter((t) => t.indexOf('-') > -1);
  const acoes = tickers.filter((t) => t.indexOf('-') === -1);
  const novas = {};

  for (const t of acoes) {
    try {
      let url = 'https://brapi.dev/api/quote/' + encodeURIComponent(t);
      if (env.BRAPI_TOKEN) url += '?token=' + env.BRAPI_TOKEN;
      const r = await fetch(url);
      if (!r.ok) continue;
      const j = await r.json();
      const preco = j.results && j.results[0] && j.results[0].regularMarketPrice;
      if (preco === null || preco === undefined) continue;
      await db
        .prepare('INSERT OR REPLACE INTO cotacoes_cache (ticker_api, data, preco, moeda, fonte, atualizado_em) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(t, hoje, preco, 'BRL', 'BRAPI', agora)
        .run();
      novas[t] = preco;
    } catch (e) { /* falhou, ativo cai pro preço manual */ }
  }

  const origens = [...new Set(cambios.map((c) => c.split('-')[0]))];
  for (const from of origens) {
    try {
      const r = await fetch('https://open.er-api.com/v6/latest/' + from);
      if (!r.ok) continue;
      const j = await r.json();
      if (j.result !== 'success' || !j.rates) continue;
      for (const par of cambios.filter((c) => c.split('-')[0] === from)) {
        const to = par.split('-')[1];
        const taxa = j.rates[to];
        if (!taxa) continue;
        await db
          .prepare('INSERT OR REPLACE INTO cotacoes_cache (ticker_api, data, preco, moeda, fonte, atualizado_em) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(par, hoje, taxa, from, 'ExchangeRate', agora)
          .run();
        novas[par] = taxa;
      }
    } catch (e) { /* falhou, ativo cai pro preço manual */ }
  }

  return novas;
}

async function ipcaAcumulado(dataAquis) {
  if (!dataAquis) return null;
  const inicio = new Date(dataAquis + 'T00:00:00Z');
  if (isNaN(inicio.getTime())) return null;
  const hoje = new Date();
  if (inicio >= hoje) return 0;

  const fmt = (d) => String(d.getUTCDate()).padStart(2, '0') + '/' + String(d.getUTCMonth() + 1).padStart(2, '0') + '/' + d.getUTCFullYear();
  const url = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json&dataInicial=' + fmt(inicio) + '&dataFinal=' + fmt(hoje);

  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const j = await r.json();
    if (!Array.isArray(j) || !j.length) return 0;
    let acum = 1;
    j.forEach((m) => {
      const v = Number(String(m.valor).replace(',', '.'));
      if (!isNaN(v)) acum *= 1 + v / 100;
    });
    return acum - 1;
  } catch (e) {
    return null;
  }
}

async function enriquecerAtivo(a, cache) {
  const cotacaoAuto = a.ticker_api ? cache[a.ticker_api] : null;
  const manualStr = a.preco_atual_manual === null || a.preco_atual_manual === undefined ? '' : String(a.preco_atual_manual).trim();
  const manualNum = Number(manualStr);
  const manualValido = manualStr !== '' && manualStr.toUpperCase() !== 'ATUALIZAR' && !isNaN(manualNum);

  const precoAtual = cotacaoAuto !== null && cotacaoAuto !== undefined
    ? cotacaoAuto
    : (manualValido ? manualNum : null);

  const pm = Number(a.preco_medio) || 0;
  const qtd = Number(a.qtd) || 1;
  const total_atual = precoAtual !== null ? precoAtual * qtd : 0;
  const variacao_pct = pm > 0 && precoAtual !== null ? (precoAtual - pm) / pm : null;

  let ganho_real = null;
  if (Number(a.calc_real) === 1 && a.data_aquis && pm > 0) {
    const ipca = await ipcaAcumulado(a.data_aquis);
    if (ipca !== null && variacao_pct !== null) {
      const valor_aquis = pm * qtd;
      const real_pct = (1 + variacao_pct) / (1 + ipca) - 1;
      ganho_real = {
        nominal_pct: variacao_pct,
        ipca_pct: ipca,
        real_pct: real_pct,
        valor_aquisicao: valor_aquis,
        valor_atual: total_atual,
        ganho_nominal_brl: total_atual - valor_aquis,
        valor_aquisicao_corrigido: valor_aquis * (1 + ipca),
        ganho_real_brl: total_atual - valor_aquis * (1 + ipca)
      };
    }
  }

  return Object.assign({}, a, {
    preco_atual: precoAtual,
    preco_atual_fonte: cotacaoAuto !== null && cotacaoAuto !== undefined ? 'api' : 'manual',
    total_atual,
    variacao_pct,
    ganho_real
  });
}

export async function listarAtivosEnriquecidos(db, env) {
  const hoje = hojeStr();
  const { results } = await db.prepare('SELECT * FROM ativos WHERE ativo = 1').all();
  const ativos = results || [];

  let cache = await mapaCotacoesHoje(db, hoje);
  const faltando = [...new Set(ativos.map((a) => a.ticker_api).filter((t) => t && !(t in cache)))];
  if (faltando.length) {
    const novas = await buscarCotacoesFaltantes(db, faltando, env, hoje);
    cache = Object.assign({}, cache, novas);
  }

  const enriquecidos = [];
  for (const a of ativos) {
    enriquecidos.push(await enriquecerAtivo(a, cache));
  }
  return enriquecidos;
}

export function montarDashboard(ativos) {
  let total_bruto = 0;
  let total_liquido = 0;
  const porC1 = {};
  const porC2 = {};
  const top = [];

  ativos.forEach((a) => {
    const v = a.total_atual || 0;
    total_liquido += v;
    if (v > 0) total_bruto += v;
    porC1[a.classif_1] = (porC1[a.classif_1] || 0) + v;
    const k2 = a.classif_1 + ' > ' + a.classif_2;
    porC2[k2] = (porC2[k2] || 0) + v;
    if (v !== 0) {
      top.push({
        nome: a.nome,
        ticker: a.ticker_api,
        classif: a.classif_1 + ' > ' + a.classif_2,
        total: v,
        variacao_pct: a.variacao_pct
      });
    }
  });

  top.sort((x, y) => y.total - x.total);

  return {
    total_bruto,
    total_liquido,
    por_classif1: porC1,
    por_classif2: porC2,
    top_ativos: top.slice(0, 10),
    qtd_ativos: ativos.length,
    atualizado_em: new Date().toISOString()
  };
}

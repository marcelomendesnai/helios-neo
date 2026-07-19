// Helios Neo — matriz de fundamentos (2026-07-19).
// Busca indicadores na bolsai (api.usebolsai.com, plano free), cacheia no D1
// (1x por dia por ticker — mesmo padrão de cotacoes_cache em _lib/ativos.js),
// e calcula o "índice de alerta" ponderado a partir dos parâmetros de setor
// (ver _lib/gemini.js pra como o parâmetro de um setor novo é gerado).
import { INDICADORES } from './gemini.js';

function hojeStr() {
  return new Date().toISOString().slice(0, 10);
}

async function buscarFundamentosBolsai(ticker, env) {
  const url = 'https://api.usebolsai.com/api/v1/fundamentals/' + encodeURIComponent(ticker);
  const r = await fetch(url, { headers: { 'X-API-Key': env.BOLSAI_API_KEY } });
  if (!r.ok) return null;
  return r.json();
}

async function buscarSetorBolsai(ticker, env) {
  const url = 'https://api.usebolsai.com/api/v1/companies/' + encodeURIComponent(ticker);
  const r = await fetch(url, { headers: { 'X-API-Key': env.BOLSAI_API_KEY } });
  if (!r.ok) return null;
  const j = await r.json();
  return j.sector || null;
}

// Retorna a linha de fundamentos_cache do dia (busca na bolsai se ainda nao tem).
// reference_date = trimestre do balanço (vem da bolsai) — cada trimestre novo vira
// uma linha nova na tabela = histórico "de graça" acumulando a partir de hoje.
export async function obterFundamentosCache(db, ticker, env) {
  const hoje = hojeStr();
  const cached = await db.prepare('SELECT * FROM fundamentos_cache WHERE ticker = ? AND consultado_em = ?').bind(ticker, hoje).first();
  if (cached) return cached;

  const [dados, setor] = await Promise.all([
    buscarFundamentosBolsai(ticker, env),
    buscarSetorBolsai(ticker, env)
  ]);
  if (!dados) return null;

  const row = {
    ticker,
    reference_date: dados.reference_date || hoje,
    consultado_em: hoje,
    setor: setor || null,
    close_price: dados.close_price ?? null,
    pl: dados.pl ?? null,
    pvp: dados.pvp ?? null,
    roe: dados.roe ?? null,
    roa: dados.roa ?? null,
    net_margin: dados.net_margin ?? null,
    net_debt_ebitda: dados.net_debt_ebitda ?? null,
    current_ratio: dados.current_ratio ?? null,
    cagr_revenue_5y: dados.cagr_revenue_5y ?? null,
    cagr_earnings_5y: dados.cagr_earnings_5y ?? null,
    // dividend_yield: [nao verificado] se a bolsai devolve isso de graca no
    // /fundamentals - se vier undefined aqui, fica null e a matriz marca N/A
    // pra esse indicador em vez de quebrar.
    dividend_yield: dados.dividend_yield ?? null,
    raw_json: JSON.stringify(dados)
  };

  await db.prepare(
    `INSERT OR REPLACE INTO fundamentos_cache
     (ticker, reference_date, consultado_em, setor, close_price, pl, pvp, roe, roa, net_margin, net_debt_ebitda, current_ratio, cagr_revenue_5y, cagr_earnings_5y, dividend_yield, raw_json)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    row.ticker, row.reference_date, row.consultado_em, row.setor, row.close_price,
    row.pl, row.pvp, row.roe, row.roa, row.net_margin, row.net_debt_ebitda, row.current_ratio,
    row.cagr_revenue_5y, row.cagr_earnings_5y, row.dividend_yield, row.raw_json
  ).run();

  return row;
}

function classificarSinal(valor, param) {
  if (valor === null || valor === undefined) return 'na';
  if (!param || Number(param.aplicavel) !== 1) return 'na';
  const v = param.verde_limite, a = param.amarelo_limite;
  if (v === null || v === undefined || a === null || a === undefined) return 'na';
  if (param.direcao === 'menor_melhor') {
    if (valor <= v) return 'verde';
    if (valor <= a) return 'amarelo';
    return 'vermelho';
  }
  // maior_melhor
  if (valor >= v) return 'verde';
  if (valor >= a) return 'amarelo';
  return 'vermelho';
}

// Índice de alerta: soma do peso de tudo que ta vermelho (peso cheio) + amarelo
// (meio peso), dividido pelo peso total aplicavel. 0% = tudo dentro do parametro,
// 100% = tudo vermelho.
export function calcularScore(fundamentos, parametros) {
  const mapa = {};
  (parametros || []).forEach((p) => { mapa[p.indicador] = p; });

  let pesoTotal = 0;
  let pesoRuim = 0;
  const detalhe = [];

  for (const ind of Object.keys(INDICADORES)) {
    const param = mapa[ind];
    const valor = fundamentos[ind];
    const sinal = classificarSinal(valor, param);
    if (sinal === 'na') {
      detalhe.push({ indicador: ind, valor, sinal, peso: 0 });
      continue;
    }
    const peso = param.peso;
    pesoTotal += peso;
    if (sinal === 'vermelho') pesoRuim += peso;
    else if (sinal === 'amarelo') pesoRuim += peso / 2;
    detalhe.push({ indicador: ind, valor, sinal, peso });
  }

  const indiceAlerta = pesoTotal > 0 ? Math.round((pesoRuim / pesoTotal) * 100) : null;
  return { indiceAlerta, detalhe };
}
